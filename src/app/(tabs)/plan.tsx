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
      {/* Title */}
      <Text
        variant="headlineMedium"
        style={{
          color: colors.text,
          fontWeight: isGlare ? '800' : '700',
          marginBottom: spacing.four,
        }}
      >
        Plan Multimodal Trip
      </Text>

      {/* Stop Selection Card */}
      <AppCard variant="elevated" elevation={2} style={{ marginBottom: spacing.four }}>
        {/* Origin Selector */}
        <Menu
          visible={originMenuVisible}
          onDismiss={() => setOriginMenuVisible(false)}
          anchor={
            <Pressable
              onPress={() => setOriginMenuVisible(true)}
              style={[
                styles.stopPickerRow,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: borderRadius.md,
                  borderColor: isGlare ? colors.border : 'transparent',
                  borderWidth: isGlare ? 1.5 : 0,
                  padding: spacing.three,
                },
              ]}
            >
              <View style={styles.row}>
                <Icon source="circle-slice-8" size={20} color={colors.primary} />
                <View style={{ marginLeft: spacing.two }}>
                  <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                    From (Origin)
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={{ color: colors.text, fontWeight: isGlare ? '700' : '600' }}
                  >
                    {getStopName(originStop)}
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

        {/* Swap Button */}
        <View style={styles.swapRow}>
          <Divider style={[styles.divider, { backgroundColor: colors.borderStrong }]} />
          <Pressable
            onPress={handleSwap}
            style={[
              styles.swapButton,
              {
                backgroundColor: colors.card,
                borderColor: isGlare ? colors.border : colors.borderStrong,
                borderWidth: isGlare ? 2 : 1,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Icon source="swap-vertical" size={20} color={colors.primary} />
          </Pressable>
          <Divider style={[styles.divider, { backgroundColor: colors.borderStrong }]} />
        </View>

        {/* Destination Selector */}
        <Menu
          visible={destMenuVisible}
          onDismiss={() => setDestMenuVisible(false)}
          anchor={
            <Pressable
              onPress={() => setDestMenuVisible(true)}
              style={[
                styles.stopPickerRow,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: borderRadius.md,
                  borderColor: isGlare ? colors.border : 'transparent',
                  borderWidth: isGlare ? 1.5 : 0,
                  padding: spacing.three,
                },
              ]}
            >
              <View style={styles.row}>
                <Icon source="map-marker" size={20} color={colors.error} />
                <View style={{ marginLeft: spacing.two }}>
                  <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                    To (Destination)
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={{ color: colors.text, fontWeight: isGlare ? '700' : '600' }}
                  >
                    {getStopName(destStop)}
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
      </AppCard>

      {/* Mode Toggle: Fastest vs Cheapest */}
      <View style={{ marginBottom: spacing.five }}>
        <SegmentedButtons
          value={mode}
          onValueChange={(val) => setMode(val as 'fastest' | 'cheapest')}
          buttons={[
            {
              value: 'fastest',
              label: '⚡ Fastest Route',
              style: isGlare ? { borderWidth: 2, borderColor: colors.border } : {},
            },
            {
              value: 'cheapest',
              label: '💰 Cheapest Route',
              style: isGlare ? { borderWidth: 2, borderColor: colors.border } : {},
            },
          ]}
        />
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
            Recommended Route ({itinerary.mode.toUpperCase()})
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
  stopPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  divider: {
    flex: 1,
  },
  swapButton: {
    padding: 8,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
