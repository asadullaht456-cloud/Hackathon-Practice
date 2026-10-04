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
      <Text
        variant="headlineMedium"
        style={{
          color: colors.text,
          fontWeight: isGlare ? '800' : '700',
          marginBottom: spacing.four,
        }}
      >
        Transit Wallet & Pass
      </Text>

      {/* Balance Card */}
      <AppCard variant="elevated" elevation={2} style={{ marginBottom: spacing.five }}>
        <View style={styles.balanceHeaderRow}>
          <View>
            <Text variant="labelMedium" style={{ color: colors.textSecondary }}>
              Current Balance
            </Text>
            <Text
              variant="displaySmall"
              style={{
                color: colors.primary,
                fontWeight: isGlare ? '800' : '700',
                marginTop: spacing.one,
              }}
            >
              Rs. {balance}
            </Text>
          </View>

          <Button
            mode="contained"
            icon="plus-circle"
            onPress={() => setTopUpModalVisible(true)}
            buttonColor={colors.primary}
            textColor={colors.onPrimary}
            style={[
              styles.topUpBtn,
              isGlare && { borderWidth: 2, borderColor: colors.border },
            ]}
          >
            Top Up
          </Button>
        </View>

        <Divider style={{ marginVertical: spacing.three, backgroundColor: colors.border }} />

        <View style={styles.roleBannerRow}>
          <View
            style={[
              styles.roleDot,
              { backgroundColor: role === 'student' ? colors.network.student : colors.primary },
            ]}
          />
          <Text
            variant="bodySmall"
            style={{ color: colors.text, fontWeight: isGlare ? '700' : '500' }}
          >
            Account Type:{' '}
            <Text
              style={{
                color: role === 'student' ? colors.network.student : colors.primary,
                fontWeight: '700',
              }}
            >
              {role === 'student' ? 'Student Zero-Fare Pass' : 'Standard Citizen Pass'}
            </Text>
          </Text>
        </View>
      </AppCard>

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
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topUpBtn: {
    borderRadius: 20,
  },
  roleBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
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
  },
  txIconBubble: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
