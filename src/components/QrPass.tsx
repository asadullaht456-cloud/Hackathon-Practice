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
          padding: spacing.five,
        },
      ]}
    >
      {/* Pass Type Badge */}
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isGlare ? '#ffffff' : badgeColor,
              borderColor: isGlare ? colors.border : 'transparent',
              borderWidth: isGlare ? 2 : 0,
              borderRadius: borderRadius.full,
              paddingHorizontal: spacing.three,
              paddingVertical: spacing.one,
            },
          ]}
        >
          <Icon
            source={isStudent ? 'school' : 'transit-detour'}
            size={16}
            color={isGlare ? colors.text : '#ffffff'}
          />
          <Text
            variant="labelMedium"
            style={[
              styles.badgeText,
              {
                color: isGlare ? colors.text : '#ffffff',
                fontWeight: isGlare ? '800' : '700',
                marginLeft: spacing.one,
              },
            ]}
          >
            {isStudent ? 'STUDENT ZERO-FARE PASS' : 'PAY-AS-YOU-GO PASS'}
          </Text>
        </View>

        <Pressable
          onPress={onRefresh}
          disabled={loading}
          style={({ pressed }) => [styles.refreshButton, pressed && { opacity: 0.6 }]}
        >
          <Icon
            source="refresh"
            size={20}
            color={isGlare ? colors.text : colors.primary}
          />
        </Pressable>
      </View>

      {/* QR Code Container */}
      <View
        style={[
          styles.qrWrapper,
          {
            backgroundColor: '#ffffff',
            borderColor: isGlare ? '#000000' : 'rgba(0,0,0,0.08)',
            borderWidth: isGlare ? 2 : 1,
            borderRadius: borderRadius.lg,
            padding: spacing.four,
            marginVertical: spacing.four,
          },
        ]}
      >
        {renderQrVisual()}
      </View>

      {/* Countdown and Expiry */}
      <View style={styles.footer}>
        <View style={styles.footerTextRow}>
          <Text
            variant="bodySmall"
            style={{
              color: colors.textSecondary,
              fontWeight: isGlare ? '700' : '500',
            }}
          >
            Refreshes in {secondsRemaining}s
          </Text>
          <Text
            variant="bodySmall"
            style={{
              color: colors.textMuted,
            }}
          >
            Valid on MB, OL & Speedo
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color={isGlare ? '#000000' : badgeColor}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 6,
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
  progressBar: {
    width: '100%',
  },
});
