import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Text, Switch, Button, Icon, Divider, List } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { useGlareMode } from '@/hooks/ui/useGlareMode';
import { AppCard } from '@/components/AppCard';
import { getProfile, Profile } from '@/services';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, isGlare, mode, toggleGlareMode } = useAppTheme();
  const { autoGlareEnabled, setAutoGlareEnabled, currentLux, sensorAvailable } = useGlareMode();

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const p = await getProfile();
        if (p) setProfile(p);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { supabase } = require('@/lib/supabase');
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch {
      // Fallback
    }
    router.replace('/(auth)/login' as any);
  };

  const isStudent = profile?.role === 'student';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.four,
        paddingBottom: insets.bottom + spacing.six,
        paddingHorizontal: spacing.four,
      }}
    >
      <Text
        variant="headlineMedium"
        style={{
          color: colors.text,
          fontWeight: isGlare ? '800' : '700',
          marginBottom: spacing.four,
        }}
      >
        Account & Settings
      </Text>

      {/* User Info Card (Stitch UI) */}
      <AppCard variant="elevated" elevation={2} style={{ marginBottom: spacing.four }}>
        <View style={styles.userHeaderRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../../assets/images/ayesha-avatar.png')}
              style={[
                styles.avatarImage,
                {
                  borderColor: isGlare ? colors.border : colors.borderStrong,
                  borderWidth: isGlare ? 2.5 : 1.5,
                  borderRadius: borderRadius.full,
                },
              ]}
              defaultSource={require('../../../assets/images/ayesha-avatar.png')}
            />
            <View
              style={[
                styles.verifiedCheckBadge,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.card,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Icon source="check" size={12} color="#ffffff" />
            </View>
          </View>

          <View style={{ marginLeft: spacing.three, flex: 1 }}>
            <View style={styles.nameStatusRow}>
              <Text
                variant="titleLarge"
                style={{
                  color: colors.text,
                  fontWeight: isGlare ? '900' : '800',
                }}
              >
                {profile?.full_name || 'Ayesha Khan'}
              </Text>
              <View
                style={[
                  styles.activePill,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: isGlare ? colors.border : colors.borderStrong,
                    borderWidth: 1,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: colors.primary,
                    fontWeight: '800',
                    fontSize: 10,
                  }}
                >
                  ACTIVE
                </Text>
              </View>
            </View>

            <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
              ayesha.khan@pu.edu.pk
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 1 }}>
              +92 300 1234567
            </Text>
          </View>
        </View>

        {/* Royal Purple Student Pass Banner (Stitch UI) */}
        <View
          style={[
            styles.studentBanner,
            {
              backgroundColor: isGlare ? '#000000' : colors.network.student,
              borderRadius: borderRadius.md,
              marginTop: spacing.three,
              padding: spacing.two,
            },
          ]}
        >
          <View style={styles.bannerLeft}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>🎓</Text>
            <Text
              variant="labelMedium"
              style={{
                color: '#ffffff',
                fontWeight: '800',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                flex: 1,
              }}
            >
              {isStudent
                ? 'VERIFIED STUDENT • ZERO FARE ELIGIBLE'
                : 'COMMUTER PASS • FARE DISCOUNTS ELIGIBLE'}
            </Text>
          </View>
          <View
            style={[
              styles.pmaTag,
              { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.full },
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

        {/* University Credentials Metadata */}
        <View
          style={[
            styles.studentInfoBox,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.md,
              marginTop: spacing.two,
              padding: spacing.two,
            },
          ]}
        >
          <View style={styles.eduRow}>
            <Icon source="school" size={20} color={colors.primary} />
            <View style={{ marginLeft: spacing.two, flex: 1 }}>
              <Text
                variant="bodyMedium"
                style={{ color: colors.text, fontWeight: isGlare ? '800' : '700' }}
              >
                {profile?.institution || 'University of the Punjab'}
              </Text>
              <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 1 }}>
                Roll # 2024-CS-41 • Valid thru Dec 2027
              </Text>
            </View>
          </View>
        </View>
      </AppCard>

      {/* Outdoor Glare Mode Settings */}
      <AppCard variant="elevated" elevation={1} style={{ marginBottom: spacing.five }}>
        <Text
          variant="titleMedium"
          style={{
            color: colors.text,
            fontWeight: isGlare ? '800' : '700',
            marginBottom: spacing.one,
          }}
        >
          ☀️ High-Contrast Glare Mode
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: colors.textSecondary, marginBottom: spacing.three }}
        >
          Maximizes contrast, sharpens borders, and boosts readability under harsh direct Pakistani
          sunlight at outdoor bus shelters.
        </Text>

        {/* Manual Glare Toggle */}
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text
              variant="bodyLarge"
              style={{ color: colors.text, fontWeight: isGlare ? '700' : '500' }}
            >
              Force Glare Mode
            </Text>
            <Text variant="labelSmall" style={{ color: colors.textMuted }}>
              Current theme: {mode.toUpperCase()}
            </Text>
          </View>
          <Switch
            value={isGlare}
            onValueChange={toggleGlareMode}
            color={colors.primary}
          />
        </View>

        <Divider style={{ marginVertical: spacing.three, backgroundColor: colors.border }} />

        {/* Auto Sensor Mode */}
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text
              variant="bodyLarge"
              style={{ color: colors.text, fontWeight: isGlare ? '700' : '500' }}
            >
              Auto Light Sensor Switch
            </Text>
            <Text variant="labelSmall" style={{ color: colors.textMuted }}>
              {sensorAvailable
                ? `Ambient sensor: ${currentLux !== null ? `${Math.round(currentLux)} lux` : 'Active'}`
                : 'Sensor simulated (triggers >10,000 lux outdoors)'}
            </Text>
          </View>
          <Switch
            value={autoGlareEnabled}
            onValueChange={setAutoGlareEnabled}
            color={colors.primary}
          />
        </View>
      </AppCard>

      {/* Verification & Modal Flows */}
      <AppCard variant="elevated" elevation={1} style={{ marginBottom: spacing.five }}>
        <Text
          variant="titleMedium"
          style={{
            color: colors.text,
            fontWeight: isGlare ? '800' : '700',
            marginBottom: spacing.two,
          }}
        >
          Special Modes & Verification
        </Text>

        <List.Item
          title="Student Card Verification"
          description={
            isStudent
              ? 'Student pass active with zero-fare transit'
              : 'Scan Student ID via Gemini OCR to unlock free rides'
          }
          left={(props) => (
            <List.Icon {...props} icon="school" color={colors.network.student} />
          )}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/student-verify' as any)}
        />

        <Divider style={{ backgroundColor: colors.border }} />

        <List.Item
          title="Conductor / Validator Mode"
          description="Ticket inspector camera scanner to validate boarding QRs"
          left={(props) => (
            <List.Icon {...props} icon="qrcode-scan" color={colors.primary} />
          )}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/validator' as any)}
        />
      </AppCard>

      {/* Sign Out Button */}
      <Button
        mode="outlined"
        icon="logout"
        onPress={handleSignOut}
        textColor={colors.error}
        style={[
          styles.signOutBtn,
          {
            borderColor: colors.error,
            borderRadius: borderRadius.md,
          },
          isGlare && { borderWidth: 2 },
        ]}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  avatarImage: {
    width: 64,
    height: 64,
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  studentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pmaTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  studentInfoBox: {
    marginTop: 8,
  },
  eduRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signOutBtn: {
    marginTop: 8,
  },
});
