import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, SegmentedButtons, Icon, Menu, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { StateView } from '@/components/StateView';
import { AppCard } from '@/components/AppCard';
import { ItineraryCard } from '@/components/ItineraryCard';
import { getStops, planTrip, Stop, Itinerary } from '@/services';

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();

  const [stops, setStops] = useState<Stop[]>([]);
  const [originStop, setOriginStop] = useState<string>('kalma_chowk');
  const [destStop, setDestStop] = useState<string>('chauburji_ol');
  const [mode, setMode] = useState<'fastest' | 'cheapest'>('fastest');
  const [originMenuVisible, setOriginMenuVisible] = useState<boolean>(false);
  const [destMenuVisible, setDestMenuVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  // Fetch stops list on mount
  useEffect(() => {
    async function loadStops() {
      try {
        const fetched = await getStops();
        if (fetched?.length) {
          setStops(fetched);
          if (!originStop) setOriginStop(fetched[0].id);
          if (!destStop && fetched.length > 1) setDestStop(fetched[1].id);
        }
      } catch (err) {
        console.error('Error fetching stops:', err);
      }
    }
    loadStops();
  }, []);

  // Compute route through backend planner service
  const calculateRoute = async (fromId: string, toId: string, selectedMode: 'fastest' | 'cheapest') => {
    if (!fromId || !toId || fromId === toId) {
      setItinerary(null);
      return;
    }

    setLoading(true);
    try {
      const res = await planTrip(fromId, toId, selectedMode);
      setItinerary(res);
    } catch (err) {
      console.error('Error planning trip:', err);
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (originStop && destStop) {
      calculateRoute(originStop, destStop, mode);
    }
  }, [originStop, destStop, mode]);

  const handleSwap = () => {
    const temp = originStop;
    setOriginStop(destStop);
    setDestStop(temp);
  };

  const getStopName = (id: string) => {
    return stops.find((s) => s.id === id)?.name || id;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.four,
        paddingBottom: insets.bottom + spacing.six,
        paddingHorizontal: spacing.four,
      }}
    >
      {/* Screen Heading with Live Status (Stitch UI) */}
      <View style={{ marginBottom: spacing.four }}>
        <View style={styles.headingRow}>
          <Text
            variant="headlineSmall"
            style={{
              color: colors.text,
              fontWeight: isGlare ? '900' : '800',
              letterSpacing: -0.5,
            }}
          >
            Plan Multimodal Trip
          </Text>
          <View
            style={[
              styles.syncdBadge,
              {
                backgroundColor: isGlare ? '#ffffff' : colors.surfaceVariant,
                borderColor: isGlare ? colors.border : colors.borderStrong,
                borderWidth: isGlare ? 1.5 : 1,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.two,
                paddingVertical: spacing.half,
              },
            ]}
          >
            <View
              style={[
                styles.syncdDot,
                { backgroundColor: colors.primary },
              ]}
            />
            <Text
              variant="labelSmall"
              style={{
                color: isGlare ? colors.text : colors.primary,
                fontWeight: '800',
                marginLeft: spacing.one,
                letterSpacing: 0.5,
              }}
            >
              SYNCD
            </Text>
          </View>
        </View>
        <Text
          variant="bodySmall"
          style={{ color: colors.textSecondary, marginTop: spacing.half }}
        >
          Real-time transfers across Lahore Metro, Orange Line & Speedo
        </Text>
      </View>

      {/* Origin / Destination Interactive Card (Stitch UI) */}
      <AppCard variant="elevated" elevation={2} style={{ marginBottom: spacing.four }}>
        {/* Origin Selector */}
        <Menu
          visible={originMenuVisible}
          onDismiss={() => setOriginMenuVisible(false)}
          anchor={
            <Pressable
              onPress={() => setOriginMenuVisible(true)}
              style={[
                styles.stopNodeRow,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: borderRadius.md,
                  borderColor: isGlare ? colors.border : 'transparent',
                  borderWidth: isGlare ? 1.5 : 0,
                  padding: spacing.three,
                },
              ]}
            >
              <View style={styles.nodeLeft}>
                <View
                  style={[
                    styles.nodeIconBubble,
                    {
                      backgroundColor: isGlare ? '#000000' : colors.primaryContainer,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Icon
                    source="circle-double"
                    size={18}
                    color={isGlare ? '#ffffff' : colors.primary}
                  />
                </View>
                <View style={{ marginLeft: spacing.two, flex: 1 }}>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: colors.textMuted,
                      fontWeight: '800',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    Origin
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={{
                      color: colors.text,
                      fontWeight: isGlare ? '800' : '700',
                      marginTop: spacing.half,
                    }}
                  >
                    {getStopName(originStop)}
                  </Text>
                  <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                    {stops.find((s) => s.id === originStop)?.network.toUpperCase() || 'METRO'} Station
                  </Text>
                </View>
              </View>
              <Icon source="chevron-down" size={20} color={colors.textSecondary} />
            </Pressable>
          }
        >
          {stops.map((s) => (
            <Menu.Item
              key={s.id}
              onPress={() => {
                setOriginStop(s.id);
                setOriginMenuVisible(false);
              }}
              title={`${s.name} (${s.network.toUpperCase()})`}
            />
          ))}
        </Menu>

        {/* Swap Action Rail */}
        <View style={styles.swapActionRail}>
          <Divider style={[styles.railLine, { backgroundColor: colors.border }]} />
          <Pressable
            onPress={handleSwap}
            style={[
              styles.swapButtonCircle,
              {
                backgroundColor: colors.card,
                borderColor: isGlare ? colors.border : colors.borderStrong,
                borderWidth: isGlare ? 2 : 1,
                borderRadius: borderRadius.full,
              },
            ]}
            hitSlop={8}
          >
            <Icon source="swap-vertical" size={20} color={colors.primary} />
          </Pressable>
          <Divider style={[styles.railLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Destination Selector */}
        <Menu
          visible={destMenuVisible}
          onDismiss={() => setDestMenuVisible(false)}
          anchor={
            <Pressable
              onPress={() => setDestMenuVisible(true)}
              style={[
                styles.stopNodeRow,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: borderRadius.md,
                  borderColor: isGlare ? colors.border : 'transparent',
                  borderWidth: isGlare ? 1.5 : 0,
                  padding: spacing.three,
                },
              ]}
            >
              <View style={styles.nodeLeft}>
                <View
                  style={[
                    styles.nodeIconBubble,
                    {
                      backgroundColor: isGlare ? '#000000' : '#ffdcc6',
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Icon
                    source="map-marker"
                    size={18}
                    color={isGlare ? '#ffffff' : '#b45900'}
                  />
                </View>
                <View style={{ marginLeft: spacing.two, flex: 1 }}>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: colors.textMuted,
                      fontWeight: '800',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    Destination
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={{
                      color: colors.text,
                      fontWeight: isGlare ? '800' : '700',
                      marginTop: spacing.half,
                    }}
                  >
                    {getStopName(destStop)}
                  </Text>
                  <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                    {stops.find((s) => s.id === destStop)?.network.toUpperCase() || 'ORANGE'} Station
                  </Text>
                </View>
              </View>
              <Icon source="chevron-down" size={20} color={colors.textSecondary} />
            </Pressable>
          }
        >
          {stops.map((s) => (
            <Menu.Item
              key={s.id}
              onPress={() => {
                setDestStop(s.id);
                setDestMenuVisible(false);
              }}
              title={`${s.name} (${s.network.toUpperCase()})`}
            />
          ))}
        </Menu>

        {/* Departure Meta bar */}
        <View
          style={[
            styles.departNowBar,
            {
              backgroundColor: colors.background,
              borderRadius: borderRadius.sm,
              marginTop: spacing.two,
              padding: spacing.two,
            },
          ]}
        >
          <View style={styles.departLeft}>
            <Icon source="clock-outline" size={16} color={colors.primary} />
            <Text
              variant="labelMedium"
              style={{
                color: colors.text,
                fontWeight: isGlare ? '800' : '600',
                marginLeft: spacing.one,
              }}
            >
              Depart Now
            </Text>
          </View>
          <Text
            variant="labelSmall"
            style={{ color: colors.textSecondary, fontWeight: '600' }}
          >
            Step-free access priority
          </Text>
        </View>
      </AppCard>

      {/* Dual Strategy Cards: Fastest vs Cheapest (Stitch UI) */}
      <View style={[styles.strategyRow, { marginBottom: spacing.four }]}>
        <Pressable
          onPress={() => setMode('fastest')}
          style={[
            styles.strategyCard,
            {
              backgroundColor: mode === 'fastest' ? colors.cardElevated : colors.card,
              borderColor:
                mode === 'fastest'
                  ? colors.primary
                  : isGlare
                  ? colors.border
                  : colors.borderStrong,
              borderWidth: mode === 'fastest' ? (isGlare ? 3 : 2) : 1,
              borderRadius: borderRadius.lg,
              padding: spacing.three,
            },
          ]}
        >
          <View style={styles.strategyHeader}>
            <Text
              variant="labelSmall"
              style={{
                color: mode === 'fastest' ? colors.primary : colors.textMuted,
                fontWeight: '800',
                letterSpacing: 0.5,
              }}
            >
              ⚡ FASTEST
            </Text>
            {mode === 'fastest' && (
              <View
                style={[
                  styles.activeDot,
                  { backgroundColor: colors.primary, borderRadius: borderRadius.full },
                ]}
              />
            )}
          </View>
          <Text
            variant="titleLarge"
            style={{
              color: colors.text,
              fontWeight: isGlare ? '900' : '800',
              marginTop: spacing.one,
            }}
          >
            {itinerary && mode === 'fastest' ? `${itinerary.total_minutes}m` : '~28m'}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: colors.textSecondary, marginTop: spacing.half }}
          >
            {itinerary && mode === 'fastest'
              ? `${itinerary.transfers} transfers • Rs. ${itinerary.total_fare_pkr}`
              : 'Direct / 1 transfer'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode('cheapest')}
          style={[
            styles.strategyCard,
            {
              backgroundColor: mode === 'cheapest' ? colors.cardElevated : colors.card,
              borderColor:
                mode === 'cheapest'
                  ? colors.primary
                  : isGlare
                  ? colors.border
                  : colors.borderStrong,
              borderWidth: mode === 'cheapest' ? (isGlare ? 3 : 2) : 1,
              borderRadius: borderRadius.lg,
              padding: spacing.three,
            },
          ]}
        >
          <View style={styles.strategyHeader}>
            <Text
              variant="labelSmall"
              style={{
                color: mode === 'cheapest' ? colors.primary : colors.textMuted,
                fontWeight: '800',
                letterSpacing: 0.5,
              }}
            >
              💰 CHEAPEST
            </Text>
            {mode === 'cheapest' && (
              <View
                style={[
                  styles.activeDot,
                  { backgroundColor: colors.primary, borderRadius: borderRadius.full },
                ]}
              />
            )}
          </View>
          <Text
            variant="titleLarge"
            style={{
              color: colors.text,
              fontWeight: isGlare ? '900' : '800',
              marginTop: spacing.one,
            }}
          >
            {itinerary && mode === 'cheapest' ? `${itinerary.total_minutes}m` : '~35m'}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: colors.textSecondary, marginTop: spacing.half }}
          >
            {itinerary && mode === 'cheapest'
              ? `Rs. ${itinerary.total_fare_pkr} (Student Free)`
              : 'Min fare route'}
          </Text>
        </Pressable>
      </View>

      {/* Route Results */}
      {loading ? (
        <StateView state="loading" loadingMessage="Searching optimal connections..." />
      ) : originStop === destStop ? (
        <StateView
          state="empty"
          emptyTitle="Same Origin and Destination"
          emptyMessage="Please select different departure and arrival stops to plan your route."
          emptyIcon="map-marker-distance"
        />
      ) : itinerary ? (
        <View>
          <Text
            variant="titleMedium"
            style={{
              color: colors.text,
              fontWeight: isGlare ? '800' : '700',
              marginBottom: spacing.two,
            }}
          >
            Optimal Route Itinerary ({mode.toUpperCase()})
          </Text>
          <ItineraryCard itinerary={itinerary} />
        </View>
      ) : (
        <StateView
          state="empty"
          emptyTitle="No Route Found"
          emptyMessage="No direct or transfer route found between these stations."
          emptyIcon="routes"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  syncdDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stopNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nodeIconBubble: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapActionRail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  railLine: {
    flex: 1,
  },
  swapButtonCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  departNowBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  departLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  strategyCard: {
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
  },
});
