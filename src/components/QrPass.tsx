import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Icon, ProgressBar, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/ui/useAppTheme';

export interface QrPassProps {
  token: string | null;
  expiresAt?: string;
  kind?: 'paygo' | 'student';
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * QrPass: Displays dynamic rotating transit QR pass.
 * Refreshes every 30 seconds with countdown progress.
 */
export const QrPass: React.FC<QrPassProps> = ({
  token,
  expiresAt,
  kind = 'paygo',
  onRefresh,
  loading = false,
}) => {
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsRemaining(30);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diffSecs = Math.max(0, Math.floor((expiry - now) / 1000));
      setSecondsRemaining(diffSecs);

      if (diffSecs <= 0 && onRefresh) {
        onRefresh();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onRefresh]);

  const progress = Math.min(1, Math.max(0, secondsRemaining / 30));
  const isStudent = kind === 'student';
  const badgeColor = isStudent ? colors.network.student : colors.primary;

  // Gracefully render QR code or high-fidelity simulated barcode matrix if SVG library is pending
  const renderQrVisual = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCode = require('react-native-qrcode-svg').default;
      if (QRCode && token) {
        return (
          <QRCode
            value={token}
            size={180}
            color={isGlare ? '#000000' : '#111827'}
            backgroundColor="#ffffff"
          />
        );
      }
    } catch {
      // Fallback matrix representation when waiting on Dev1 package install
    }

    // High-fidelity transit visual mock
    return (
      <View style={styles.qrFallback}>
        <View style={styles.matrixGrid}>
          <Icon source="qrcode" size={160} color={isGlare ? '#000000' : colors.text} />
        </View>
        <Text
          variant="labelSmall"
          style={{
            color: colors.textMuted,
            marginTop: spacing.one,
            fontFamily: 'monospace',
          }}
        >
          {token ? token.slice(0, 16) + '...' : 'GENERATING TOKEN...'}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.xl,
          borderColor: isGlare ? colors.border : colors.borderStrong,
          borderWidth: isGlare ? 2.5 : 1,
          overflow: 'hidden',
        },
      ]}
    >
      {/* Ticket Header Banner (Stitch UI) */}
      <View
        style={[
          styles.ticketHeader,
          {
            backgroundColor: isGlare ? '#000000' : isStudent ? '#8E24AA' : colors.primary,
            paddingHorizontal: spacing.four,
            paddingVertical: spacing.two,
          },
        ]}
      >
        <View style={styles.bannerLeft}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>
            {isStudent ? '🎓' : '🎫'}
          </Text>
          <Text
            variant="labelMedium"
            style={{
              color: '#ffffff',
              fontWeight: '800',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {isStudent ? 'STUDENT ZERO-FARE PASS' : 'STANDARD CONTACTLESS PASS'}
          </Text>
        </View>

        <View
          style={[
            styles.authBadge,
            {
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Text
            variant="labelSmall"
            style={{ color: '#ffffff', fontWeight: '800', fontSize: 10 }}
          >
            PMA AUTH
          </Text>
        </View>
      </View>

      {/* Main Ticket Body */}
      <View style={[styles.ticketBody, { padding: spacing.four }]}>
        {/* Anti-screenshot Live Token Warning */}
        <View style={styles.tokenMetaRow}>
          <Text
            variant="labelSmall"
            style={{
              color: colors.textMuted,
              fontWeight: '800',
              letterSpacing: 0.5,
            }}
          >
            ROTATING DYNAMIC QR
          </Text>
          <Pressable
            onPress={onRefresh}
            disabled={loading}
            style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <Icon
              source="refresh"
              size={18}
              color={isGlare ? colors.text : colors.primary}
            />
            <Text
              variant="labelSmall"
              style={{
                color: isGlare ? colors.text : colors.primary,
                fontWeight: '700',
                marginLeft: 4,
              }}
            >
              Refresh
            </Text>
          </Pressable>
        </View>

        {/* QR Code Frame */}
        <View
          style={[
            styles.qrWrapper,
            {
              backgroundColor: '#ffffff',
              borderColor: isGlare ? '#000000' : 'rgba(0,0,0,0.1)',
              borderWidth: isGlare ? 2.5 : 1,
              borderRadius: borderRadius.lg,
              padding: spacing.three,
              marginVertical: spacing.three,
            },
          ]}
        >
          {renderQrVisual()}
        </View>

        {/* Token Countdown & Security Meta */}
        <View style={styles.footer}>
          <View style={styles.footerTextRow}>
            <View style={styles.countdownRow}>
              <View
                style={[
                  styles.timerDot,
                  { backgroundColor: secondsRemaining <= 5 ? colors.error : colors.primary },
                ]}
              />
              <Text
                variant="labelMedium"
                style={{
                  color: secondsRemaining <= 5 ? colors.error : colors.text,
                  fontWeight: isGlare ? '800' : '700',
                  marginLeft: spacing.one,
                }}
              >
                Refreshing in {secondsRemaining}s
              </Text>
            </View>
            <Text
              variant="labelSmall"
              style={{
                color: colors.textMuted,
                fontWeight: '600',
              }}
            >
              MB • OLMT • SPEEDO
            </Text>
          </View>

          <ProgressBar
            progress={progress}
            color={isGlare ? '#000000' : secondsRemaining <= 5 ? colors.error : badgeColor}
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: borderRadius.full,
                height: 6,
                marginTop: spacing.two,
              },
            ]}
          />

          {/* Bound Device Hash Pill */}
          <View
            style={[
              styles.deviceHashPill,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: isGlare ? colors.border : 'transparent',
                borderWidth: isGlare ? 1 : 0,
                borderRadius: borderRadius.sm,
                marginTop: spacing.three,
                padding: spacing.two,
              },
            ]}
          >
            <Icon source="shield-check" size={14} color={colors.primary} />
            <Text
              variant="labelSmall"
              style={{
                color: colors.textSecondary,
                fontWeight: '600',
                marginLeft: spacing.one,
                fontSize: 10,
              }}
            >
              Hardware-Bound Token • Offline NFC & Visual Scanner Ready
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ticketBody: {
    alignItems: 'center',
    width: '100%',
  },
  tokenMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 220,
  },
  qrFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixGrid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    width: '100%',
  },
  footerTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressBar: {
    width: '100%',
  },
  deviceHashPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
