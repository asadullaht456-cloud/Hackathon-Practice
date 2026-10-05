import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Icon, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { AppCard } from '@/components/AppCard';
import { QrPass } from '@/components/QrPass';
import { TopUpModal } from '@/components/TopUpModal';
import { StateView } from '@/components/StateView';
import {
  getWallet,
  topUp,
  getTransactions,
  getQrToken,
  getProfile,
  Transaction,
} from '@/services';

const DEVICE_ID = 'device_simulator_demo_01';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();

  const [balance, setBalance] = useState<number>(0);
  const [role, setRole] = useState<'citizen' | 'student'>('citizen');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string | undefined>(undefined);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topUpModalVisible, setTopUpModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingTopUp, setLoadingTopUp] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Load wallet & QR directly from @/services
  const fetchWalletData = async () => {
    try {
      const [walletData, profileData, qrData, txsData] = await Promise.all([
        getWallet(),
        getProfile(),
        getQrToken(DEVICE_ID),
        getTransactions(20),
      ]);

      if (walletData?.balancePkr !== undefined) setBalance(walletData.balancePkr);
      if (profileData?.role) setRole(profileData.role);
      if (qrData?.tokenId) {
        setQrToken(qrData.tokenId);
        setQrExpiresAt(qrData.expiresAt);
      }
      if (txsData) setTransactions(txsData);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleRefreshQr = async () => {
    try {
      const q = await getQrToken(DEVICE_ID);
      if (q?.tokenId) {
        setQrToken(q.tokenId);
        setQrExpiresAt(q.expiresAt);
      }
    } catch (err) {
      console.error('Error refreshing QR token:', err);
    }
  };

  const handleTopUp = async (amount: number, method: 'jazzcash' | 'raast') => {
    setLoadingTopUp(true);
    try {
      const result = await topUp(amount, method);
      if (result?.balancePkr !== undefined) {
        setBalance(result.balancePkr);
      }
      const updatedTxs = await getTransactions(20);
      setTransactions(updatedTxs);
    } catch (err) {
      console.error('Error topping up:', err);
    } finally {
      setLoadingTopUp(false);
    }
  };

  const onPullRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWalletData(), handleRefreshQr()]);
    setRefreshing(false);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loadingInitial) {
    return <StateView state="loading" loadingMessage="Loading wallet & pass..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.four,
        paddingBottom: insets.bottom + spacing.six,
        paddingHorizontal: spacing.four,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onPullRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Title */}
      <View style={{ marginBottom: spacing.three }}>
        <Text
          variant="headlineSmall"
          style={{
            color: colors.text,
            fontWeight: isGlare ? '900' : '800',
            letterSpacing: -0.5,
          }}
        >
          Transit Wallet & Pass
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: spacing.half }}>
          Zero-fare student pass & contactless fare card
        </Text>
      </View>

      {/* Stitch UI: Deep Emerald Chalo Cash Card */}
      <View
        style={[
          styles.cashCardContainer,
          {
            backgroundColor: isGlare ? '#ffffff' : '#1e6819',
            borderColor: isGlare ? '#000000' : 'transparent',
            borderWidth: isGlare ? 2.5 : 0,
            borderRadius: borderRadius.xl,
            padding: spacing.five,
            marginBottom: spacing.five,
          },
        ]}
      >
        {/* Top Meta Row */}
        <View style={styles.cashCardTop}>
          <View style={styles.cashCardBrand}>
            <View
              style={[
                styles.brandDot,
                { backgroundColor: isGlare ? '#000000' : '#a9f697' },
              ]}
            />
            <Text
              variant="labelMedium"
              style={{
                color: isGlare ? '#000000' : '#eaffdf',
                fontWeight: '800',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Chalo Cash Card
            </Text>
          </View>

          <View
            style={[
              styles.nfcBadge,
              {
                backgroundColor: isGlare ? '#000000' : 'rgba(0,0,0,0.25)',
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: '#ffffff',
                fontWeight: '700',
                fontSize: 11,
              }}
            >
              NFC READY
            </Text>
          </View>
        </View>

        {/* Large Balance Display */}
        <View style={{ marginVertical: spacing.three }}>
          <Text
            variant="headlineLarge"
            style={{
              color: isGlare ? '#000000' : '#ffffff',
              fontWeight: isGlare ? '900' : '800',
              letterSpacing: -1,
            }}
          >
            PKR {balance}.00
          </Text>
          <View style={styles.roleSubRow}>
            <Icon
              source={role === 'student' ? 'school' : 'account-check'}
              size={16}
              color={isGlare ? '#000000' : '#eaffdf'}
            />
            <Text
              variant="bodySmall"
              style={{
                color: isGlare ? '#000000' : '#eaffdf',
                fontWeight: isGlare ? '800' : '600',
                marginLeft: spacing.one,
              }}
            >
              {role === 'student'
                ? 'Student Zero-Fare Active • Punjab Mass Transit'
                : 'Standard Citizen Fare Balance'}
            </Text>
          </View>
        </View>

        {/* Action Button Row */}
        <View style={styles.cashCardActions}>
          <Button
            mode="contained"
            icon="plus-circle"
            onPress={() => setTopUpModalVisible(true)}
            buttonColor={isGlare ? '#000000' : '#ffffff'}
            textColor={isGlare ? '#ffffff' : '#1e6819'}
            style={[
              styles.topUpPillBtn,
              { borderRadius: borderRadius.full },
              isGlare && { borderWidth: 1.5, borderColor: '#000000' },
            ]}
            contentStyle={{ height: 44 }}
            labelStyle={{ fontWeight: '800', fontSize: 14 }}
          >
            + Top Up Balance
          </Button>

          <View
            style={[
              styles.gatewayPill,
              {
                backgroundColor: isGlare ? '#f3f4f6' : 'rgba(0,0,0,0.2)',
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Icon
              source="lightning-bolt"
              size={14}
              color={isGlare ? '#000000' : '#ffdcc6'}
            />
            <Text
              variant="labelSmall"
              style={{
                color: isGlare ? '#000000' : '#ffffff',
                fontWeight: '700',
                marginLeft: 4,
              }}
            >
              JazzCash / Raast
            </Text>
          </View>
        </View>
      </View>

      {/* Rotating Dynamic QR Pass */}
      <View style={{ marginBottom: spacing.six }}>
        <QrPass
          token={qrToken}
          expiresAt={qrExpiresAt}
          kind={role === 'student' ? 'student' : 'paygo'}
          onRefresh={handleRefreshQr}
        />
      </View>

      {/* Recent Transactions List */}
      <View>
        <Text
          variant="titleMedium"
          style={{
            color: colors.text,
            fontWeight: isGlare ? '800' : '700',
            marginBottom: spacing.two,
          }}
        >
          Recent Transactions
        </Text>

        {transactions.length === 0 ? (
          <StateView
            state="empty"
            emptyTitle="No Transactions Yet"
            emptyMessage="Your transit fares and balance top-ups will show here."
            emptyIcon="receipt-text-outline"
          />
        ) : (
          <AppCard variant="elevated" elevation={1}>
            {transactions.map((tx, idx) => {
              const isTopup = tx.type === 'topup';
              return (
                <View key={tx.id}>
                  <View style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <View
                        style={[
                          styles.txIconBubble,
                          {
                            backgroundColor: isTopup
                              ? colors.primaryContainer
                              : colors.surfaceVariant,
                            borderColor: isGlare ? colors.border : 'transparent',
                            borderWidth: isGlare ? 1.5 : 0,
                            borderRadius: borderRadius.md,
                          },
                        ]}
                      >
                        <Icon
                          source={isTopup ? 'arrow-down-left' : 'bus'}
                          size={18}
                          color={isTopup ? colors.primary : colors.textSecondary}
                        />
                      </View>
                      <View style={{ marginLeft: spacing.three }}>
                        <Text
                          variant="bodyMedium"
                          style={{
                            color: colors.text,
                            fontWeight: isGlare ? '700' : '600',
                          }}
                        >
                          {isTopup
                            ? `Top-Up (${tx.method?.toUpperCase() || 'MOCK'})`
                            : `Transit Fare (${tx.route_id || 'BUS'})`}
                        </Text>
                        <Text variant="labelSmall" style={{ color: colors.textMuted }}>
                          {formatTime(tx.created_at)}
                        </Text>
                      </View>
                    </View>

                    <Text
                      variant="titleMedium"
                      style={{
                        color: isTopup ? colors.primary : colors.text,
                        fontWeight: isGlare ? '800' : '700',
                      }}
                    >
                      {isTopup ? `+Rs. ${tx.amount_pkr}` : `-Rs. ${tx.amount_pkr}`}
                    </Text>
                  </View>
                  {idx < transactions.length - 1 && (
                    <Divider
                      style={{
                        marginVertical: spacing.two,
                        backgroundColor: colors.border,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </AppCard>
        )}
      </View>

      {/* Top-Up Sheet / Modal */}
      <TopUpModal
        visible={topUpModalVisible}
        onDismiss={() => setTopUpModalVisible(false)}
        onTopUp={handleTopUp}
        loading={loadingTopUp}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cashCardContainer: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cashCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashCardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  nfcBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cashCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  topUpPillBtn: {
    flex: 1,
    marginRight: 10,
    elevation: 2,
  },
  gatewayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconBubble: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
