import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Switch, Button, Icon, Divider, List } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { useGlareMode } from '@/hooks/ui/useGlareMode';
import { AppCard } from '@/components/AppCard';

interface UserProfile {
  id: string;
  full_name: string;
  role: 'citizen' | 'student';
  institution?: string | null;
  student_verified_at?: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, isGlare, mode, toggleGlareMode } = useAppTheme();
  const { autoGlareEnabled, setAutoGlareEnabled, currentLux, sensorAvailable } = useGlareMode();

  const [profile, setProfile] = useState<UserProfile>({
    id: 'u1',
    full_name: 'Ayesha Khan',
    role: 'citizen',
    institution: null,
    student_verified_at: null,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const services = require('@/services');
        if (services?.getProfile) {
          const p = await services.getProfile();
          if (p) setProfile(p);
        }
      } catch {
        // Keep initial profile state
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

  const isStudent = profile.role === 'student';

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

      {/* User Info Card */}
      <AppCard variant="elevated" elevation={2} style={{ marginBottom: spacing.five }}>
        <View style={styles.userHeaderRow}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isStudent ? colors.network.student : colors.primary,
                borderColor: isGlare ? colors.border : 'transparent',
                borderWidth: isGlare ? 2 : 0,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Icon source="account" size={36} color="#ffffff" />
          </View>

          <View style={{ marginLeft: spacing.three, flex: 1 }}>
            <Text
              variant="titleLarge"
              style={{
                color: colors.text,
                fontWeight: isGlare ? '800' : '700',
              }}
            >
              {profile.full_name}
            </Text>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.roleTag,
                  {
                    backgroundColor: isStudent
                      ? colors.network.student
                      : colors.primaryContainer,
                    borderRadius: borderRadius.sm,
                    borderColor: isGlare ? colors.border : 'transparent',
                    borderWidth: isGlare ? 1.5 : 0,
                    paddingHorizontal: spacing.two,
                    paddingVertical: spacing.half,
                  },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: isStudent ? '#ffffff' : colors.onPrimaryContainer,
                    fontWeight: '700',
                  }}
                >
                  {isStudent ? 'VERIFIED STUDENT (FREE)' : 'STANDARD CITIZEN'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isStudent && profile.institution && (
          <View
            style={[
              styles.studentInfoBox,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: borderRadius.md,
                marginTop: spacing.three,
                padding: spacing.three,
              },
            ]}
          >
            <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
              Registered Institution
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: colors.text, fontWeight: isGlare ? '700' : '600' }}
            >
              {profile.institution}
            </Text>
          </View>
        )}
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
          sunlight at outdoor bus stops.
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
  avatar: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  roleTag: {
    alignSelf: 'flex-start',
  },
  studentInfoBox: {
    marginTop: 10,
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
