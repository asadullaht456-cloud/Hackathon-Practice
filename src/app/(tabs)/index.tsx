import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Text, Icon, Chip, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { StateView } from '@/components/StateView';
import { AppCard } from '@/components/AppCard';
import { VehicleMarker } from '@/components/VehicleMarker';
import { LahoreTransitSvgMap } from '@/components/LahoreTransitSvgMap';
import { getStops, getVehicles, subscribeVehicles, Stop, Vehicle } from '@/services';

export default function LiveMapScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'metrobus' | 'orange' | 'speedo'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [hasMapLibrary, setHasMapLibrary] = useState<boolean>(false);
  const [pulse, setPulse] = useState<boolean>(false);

  // Dynamic import react-native-maps to avoid breaking if native library isn't compiled
  const MapComponents = useRef<any>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Maps = require('react-native-maps');
      if (Maps?.default) {
        MapComponents.current = {
          MapView: Maps.default,
          Marker: Maps.Marker,
          PROVIDER_GOOGLE: Maps.PROVIDER_GOOGLE,
        };
        setHasMapLibrary(true);
      }
    } catch {
      setHasMapLibrary(false);
    }
  }, []);

  const loadTransitData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedStops, fetchedVehicles] = await Promise.all([
        getStops(),
        getVehicles(),
      ]);
      setStops(fetchedStops);
      setVehicles(fetchedVehicles);
    } catch (err: any) {
      setError(err?.message || 'Failed to load transit fleet');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time 1s vehicle telemetry from services
  useEffect(() => {
    loadTransitData();

    const unsubscribe = subscribeVehicles((updatedV: Vehicle) => {
      setVehicles((prev) =>
        prev.map((v) => (v.id === updatedV.id ? updatedV : v))
      );
      setPulse((p) => !p);

      // Keep selected vehicle stats in sync
      setSelectedVehicle((curr) => (curr?.id === updatedV.id ? updatedV : curr));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    if (selectedFilter === 'all') return vehicles;
    return vehicles.filter((v) => {
      if (selectedFilter === 'metrobus') return v.route_id.startsWith('MB');
      if (selectedFilter === 'orange') return v.route_id.startsWith('OL');
      return v.route_id.startsWith('SP');
    });
  }, [vehicles, selectedFilter]);

  if (loading) {
    return <StateView state="loading" loadingMessage="Connecting to Lahore transit radar..." />;
  }

  if (error) {
    return (
      <StateView
        state="error"
        errorTitle="Radar Offline"
        errorMessage={error}
        onRetry={loadTransitData}
      />
    );
  }

  const MapView = MapComponents.current?.MapView;
  const Marker = MapComponents.current?.Marker;

  return (
    <View style={styles.container}>
      {/* Native Map or Visual Transit Radar */}
      {hasMapLibrary && MapView ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 31.5204,
            longitude: 74.3587,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
        >
          {filteredVehicles.map((v) => (
            <Marker
              key={v.id}
              coordinate={{ latitude: v.lat, longitude: v.lng }}
              onPress={() => setSelectedVehicle(v)}
            >
              <VehicleMarker
                id={v.id}
                routeId={v.route_id}
                heading={v.heading}
                selected={selectedVehicle?.id === v.id}
              />
            </Marker>
          ))}
        </MapView>
      ) : (
        /* High-fidelity Vector Transit Radar matching Stitch design suite */
        <LahoreTransitSvgMap
          vehicles={filteredVehicles}
          stops={stops}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={setSelectedVehicle}
        />
      )}

      {/* Floating Header: Stitch Brandmark, LHE Live Pulse & Filter Pills */}
      <View style={[styles.headerOverlay, { top: insets.top + spacing.two }]}>
        <View style={styles.topBrandRow}>
          <View style={styles.brandTitleWrap}>
            <Text
              variant="headlineSmall"
              style={{
                color: colors.text,
                fontWeight: isGlare ? '900' : '800',
                letterSpacing: -0.5,
              }}
            >
              Chalo
            </Text>
            <View
              style={[
                styles.liveTag,
                {
                  backgroundColor: isGlare ? '#ffffff' : colors.primaryContainer,
                  borderColor: isGlare ? colors.border : 'transparent',
                  borderWidth: isGlare ? 1.5 : 0,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.two,
                  paddingVertical: spacing.half,
                  marginLeft: spacing.two,
                },
              ]}
            >
              <View
                style={[
                  styles.pulseDot,
                  {
                    backgroundColor: pulse ? colors.primary : colors.success,
                    transform: [{ scale: pulse ? 1.25 : 1.0 }],
                  },
                ]}
              />
              <Text
                variant="labelSmall"
                style={{
                  color: isGlare ? colors.text : colors.onPrimaryContainer,
                  fontWeight: '800',
                  marginLeft: spacing.one,
                  letterSpacing: 0.5,
                }}
              >
                LHE LIVE
              </Text>
            </View>
          </View>

          {/* Real-time telemetry pill */}
          <View
            style={[
              styles.latencyBadge,
              {
                backgroundColor: colors.card,
                borderColor: isGlare ? colors.border : colors.borderStrong,
                borderWidth: isGlare ? 2 : 1,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.three,
                paddingVertical: spacing.half,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: colors.textSecondary,
                fontWeight: isGlare ? '800' : '600',
              }}
            >
              1s Telemetry • {filteredVehicles.length} Active
            </Text>
          </View>
        </View>

        {/* Network Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.pillScroll, { marginTop: spacing.two }]}
        >
          <Chip
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            style={[
              styles.chip,
              selectedFilter === 'all' && { backgroundColor: colors.primary },
              isGlare && { borderWidth: 1.5, borderColor: colors.border },
            ]}
            textStyle={{
              color: selectedFilter === 'all' ? '#ffffff' : colors.text,
              fontWeight: isGlare ? '800' : '600',
            }}
          >
            All Lines
          </Chip>
          <Chip
            selected={selectedFilter === 'metrobus'}
            onPress={() => setSelectedFilter('metrobus')}
            style={[
              styles.chip,
              selectedFilter === 'metrobus' && { backgroundColor: colors.network.metrobus },
              isGlare && { borderWidth: 1.5, borderColor: colors.border },
            ]}
            textStyle={{
              color: selectedFilter === 'metrobus' ? '#ffffff' : colors.text,
              fontWeight: isGlare ? '800' : '600',
            }}
          >
            Metrobus Red
          </Chip>
          <Chip
            selected={selectedFilter === 'orange'}
            onPress={() => setSelectedFilter('orange')}
            style={[
              styles.chip,
              selectedFilter === 'orange' && { backgroundColor: colors.network.orange },
              isGlare && { borderWidth: 1.5, borderColor: colors.border },
            ]}
            textStyle={{
              color: selectedFilter === 'orange' ? '#ffffff' : colors.text,
              fontWeight: isGlare ? '800' : '600',
            }}
          >
            Orange Line
          </Chip>
          <Chip
            selected={selectedFilter === 'speedo'}
            onPress={() => setSelectedFilter('speedo')}
            style={[
              styles.chip,
              selectedFilter === 'speedo' && { backgroundColor: colors.network.speedo },
              isGlare && { borderWidth: 1.5, borderColor: colors.border },
            ]}
            textStyle={{
              color: selectedFilter === 'speedo' ? '#ffffff' : colors.text,
              fontWeight: isGlare ? '800' : '600',
            }}
          >
            Speedo Feeder
          </Chip>
        </ScrollView>
      </View>

      {/* Selected Vehicle Info Card (Styled after Stitch Transit Radar Card) */}
      {selectedVehicle && (
        <View style={[styles.bottomSheetContainer, { bottom: spacing.four }]}>
          <AppCard elevation={3} variant="elevated">
            {/* Header row with solid identification badges */}
            <View style={styles.vehicleCardHeader}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.vehiclePill,
                    {
                      backgroundColor: isGlare
                        ? '#000000'
                        : selectedVehicle.route_id.startsWith('OL')
                        ? colors.network.orange
                        : selectedVehicle.route_id.startsWith('MB')
                        ? colors.network.metrobus
                        : colors.network.speedo,
                      borderColor: isGlare ? '#000000' : 'transparent',
                      borderWidth: isGlare ? 2 : 0,
                    },
                  ]}
                >
                  <Icon
                    source={
                      selectedVehicle.route_id.startsWith('OL')
                        ? 'train'
                        : selectedVehicle.route_id.startsWith('MB')
                        ? 'bus-articulated-front'
                        : 'bus'
                    }
                    size={16}
                    color="#ffffff"
                  />
                  <Text
                    variant="labelMedium"
                    style={{
                      color: '#ffffff',
                      fontWeight: '800',
                      marginLeft: spacing.one,
                      letterSpacing: 0.5,
                    }}
                  >
                    {selectedVehicle.route_id.startsWith('OL')
                      ? 'TRAIN'
                      : selectedVehicle.route_id.startsWith('MB')
                      ? 'METRO'
                      : 'BUS'}{' '}
                    {selectedVehicle.id}
                  </Text>
                </View>

                <View
                  style={[
                    styles.networkTag,
                    {
                      backgroundColor: isGlare ? '#ffffff' : colors.surfaceVariant,
                      borderColor: isGlare ? '#000000' : colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    variant="labelSmall"
                    style={{
                      color: isGlare ? '#000000' : colors.textSecondary,
                      fontWeight: '800',
                      letterSpacing: 0.5,
                    }}
                  >
                    {selectedVehicle.route_id.startsWith('OL')
                      ? 'ORANGE LINE'
                      : selectedVehicle.route_id.startsWith('MB')
                      ? 'METROBUS BRT'
                      : 'SPEEDO FEEDER'}
                  </Text>
                </View>
              </View>

              <Pressable onPress={() => setSelectedVehicle(null)} hitSlop={10} style={styles.closeBtn}>
                <Icon source="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Approaching stop / waypoint */}
            <View style={{ marginTop: spacing.two }}>
              <Text
                variant="labelSmall"
                style={{
                  color: colors.textMuted,
                  fontWeight: '800',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                Next Approaching Stop
              </Text>
              <Text
                variant="titleLarge"
                style={{
                  color: colors.text,
                  fontWeight: isGlare ? '900' : '800',
                  marginTop: spacing.half,
                }}
              >
                {selectedVehicle.route_id.startsWith('OL')
                  ? 'Chauburji Station'
                  : selectedVehicle.route_id.startsWith('MB')
                  ? 'Kalma Chowk Hub'
                  : 'Liberty Market'}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: colors.textSecondary, marginTop: spacing.half }}
              >
                Platform 2 • Live GPS Telemetry
              </Text>
            </View>

            {/* High-Glanceability Countdown & Fare Block (Stitch UI) */}
            <View style={[styles.glanceGrid, { marginTop: spacing.three }]}>
              <View
                style={[
                  styles.glanceBox,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: isGlare ? '#000000' : colors.border,
                    borderWidth: isGlare ? 2 : 1,
                    borderRadius: borderRadius.md,
                    padding: spacing.two,
                  },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: colors.textMuted,
                    fontWeight: '800',
                    letterSpacing: 0.5,
                  }}
                >
                  ARRIVAL ETA
                </Text>
                <Text
                  variant="headlineSmall"
                  style={{
                    color: colors.primary,
                    fontWeight: '900',
                    marginVertical: spacing.half,
                    letterSpacing: -0.5,
                  }}
                >
                  {Math.max(1, Math.round((1 - selectedVehicle.progress) * 8))} MIN
                </Text>
                <Text
                  variant="labelSmall"
                  style={{
                    color: isGlare ? '#000000' : colors.primary,
                    fontWeight: '700',
                  }}
                >
                  ON SCHEDULE
                </Text>
              </View>

              <View
                style={[
                  styles.glanceBox,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: isGlare ? '#000000' : colors.border,
                    borderWidth: isGlare ? 2 : 1,
                    borderRadius: borderRadius.md,
                    padding: spacing.two,
                  },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: colors.textMuted,
                    fontWeight: '800',
                    letterSpacing: 0.5,
                  }}
                >
                  CORRIDOR FARE
                </Text>
                <Text
                  variant="headlineSmall"
                  style={{
                    color: colors.text,
                    fontWeight: '900',
                    marginVertical: spacing.half,
                    letterSpacing: -0.5,
                  }}
                >
                  RS. 0
                </Text>
                <View
                  style={[
                    styles.studentChip,
                    { backgroundColor: colors.network.student, borderRadius: borderRadius.xs },
                  ]}
                >
                  <Text
                    variant="labelSmall"
                    style={{ color: '#ffffff', fontWeight: '800', fontSize: 10 }}
                  >
                    STUDENT PASS
                  </Text>
                </View>
              </View>
            </View>
          </AppCard>
        </View>
      )}

      {/* Recenter Location FAB */}
      <FAB
        icon="crosshairs-gps"
        style={[
          styles.recenterFab,
          {
            backgroundColor: colors.card,
            borderColor: isGlare ? colors.border : 'transparent',
            borderWidth: isGlare ? 2 : 0,
            bottom: selectedVehicle ? 260 : 20,
          },
        ]}
        color={colors.primary}
        onPress={() => setSelectedVehicle(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  topBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  latencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillScroll: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
  },
  bottomSheetContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 15,
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  networkTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  closeBtn: {
    padding: 6,
  },
  glanceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  glanceBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recenterFab: {
    position: 'absolute',
    right: 16,
    zIndex: 12,
  },
});

