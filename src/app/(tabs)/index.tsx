import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Text, Icon, Chip, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { StateView } from '@/components/StateView';
import { AppCard } from '@/components/AppCard';
import { VehicleMarker } from '@/components/VehicleMarker';

export interface VehicleData {
  id: string;
  route_id: string;
  dir: number;
  seq: number;
  progress: number;
  lat: number;
  lng: number;
  heading: number;
  updated_at: string;
}

export interface StopData {
  id: string;
  name: string;
  network: 'metrobus' | 'orange' | 'speedo';
  lat: number;
  lng: number;
}

// Fallback seed stops per ARCHITECTURE.md §3 & §6
const DEFAULT_STOPS: StopData[] = [
  { id: 'gajju_matta', name: 'Gajju Matta', network: 'metrobus', lat: 31.404, lng: 74.235 },
  { id: 'kalma_chowk', name: 'Kalma Chowk', network: 'metrobus', lat: 31.504, lng: 74.33 },
  { id: 'chauburji_mb', name: 'Chauburji (Metrobus)', network: 'metrobus', lat: 31.556, lng: 74.305 },
  { id: 'shahdara', name: 'Shahdara', network: 'metrobus', lat: 31.619, lng: 74.295 },
  { id: 'ali_town', name: 'Ali Town', network: 'orange', lat: 31.443, lng: 74.249 },
  { id: 'wahdat_road', name: 'Wahdat Road', network: 'orange', lat: 31.51, lng: 74.29 },
  { id: 'chauburji_ol', name: 'Chauburji (Orange)', network: 'orange', lat: 31.5565, lng: 74.3035 },
  { id: 'sp_kalma', name: 'Kalma Chowk (Speedo)', network: 'speedo', lat: 31.5042, lng: 74.3302 },
  { id: 'sp_liberty', name: 'Liberty Market', network: 'speedo', lat: 31.511, lng: 74.344 },
  { id: 'sp_gulberg', name: 'Gulberg Main', network: 'speedo', lat: 31.52, lng: 74.35 },
];

const INITIAL_VEHICLES: VehicleData[] = [
  { id: 'MB-1', route_id: 'MB', dir: 1, seq: 2, progress: 0.4, lat: 31.51, lng: 74.33, heading: 35, updated_at: new Date().toISOString() },
  { id: 'MB-2', route_id: 'MB', dir: -1, seq: 3, progress: 0.7, lat: 31.57, lng: 74.3, heading: 215, updated_at: new Date().toISOString() },
  { id: 'OL-1', route_id: 'OL', dir: 1, seq: 1, progress: 0.6, lat: 31.47, lng: 74.27, heading: 45, updated_at: new Date().toISOString() },
  { id: 'OL-2', route_id: 'OL', dir: -1, seq: 2, progress: 0.2, lat: 31.53, lng: 74.295, heading: 225, updated_at: new Date().toISOString() },
  { id: 'SP1-1', route_id: 'SP1', dir: 1, seq: 1, progress: 0.8, lat: 31.507, lng: 74.337, heading: 70, updated_at: new Date().toISOString() },
  { id: 'SP1-2', route_id: 'SP1', dir: -1, seq: 2, progress: 0.3, lat: 31.515, lng: 74.347, heading: 250, updated_at: new Date().toISOString() },
];

export default function LiveMapScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [vehicles, setVehicles] = useState<VehicleData[]>(INITIAL_VEHICLES);
  const [stops] = useState<StopData[]>(DEFAULT_STOPS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'metrobus' | 'orange' | 'speedo'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [hasMapLibrary, setHasMapLibrary] = useState<boolean>(false);
  const [pulse, setPulse] = useState<boolean>(false);

  // Dynamic import react-native-maps to avoid breaking if not yet installed
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

  // Subscribe to vehicle updates via @/services or high-fidelity local simulator
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let localTimer: any = null;

    async function loadData() {
      try {
        setLoading(true);
        // Attempt to load from @/services if ready
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const services = require('@/services');
          if (services?.getVehicles) {
            const vList = await services.getVehicles();
            if (vList?.length) setVehicles(vList);
          }
          if (services?.subscribeVehicles) {
            unsubscribe = services.subscribeVehicles((updatedV: VehicleData) => {
              setVehicles((prev) =>
                prev.map((v) => (v.id === updatedV.id ? updatedV : v))
              );
              setPulse((p) => !p);
            });
          }
        } catch {
          // If @/services not yet created, use built-in 1-second mock simulator per ARCHITECTURE.md §3
          localTimer = setInterval(() => {
            setVehicles((prevVehicles) =>
              prevVehicles.map((v) => {
                let nextProgress = v.progress + 0.05;
                let nextDir = v.dir;
                let nextHeading = v.heading;

                if (nextProgress >= 1) {
                  nextProgress = 0;
                  nextDir = nextDir === 1 ? -1 : 1;
                  nextHeading = (nextHeading + 180) % 360;
                }

                // Approximate coordinate offset along line
                const deltaLat = (nextDir * 0.001) * (nextProgress + 0.1);
                const deltaLng = (nextDir * 0.0008) * (nextProgress + 0.1);

                return {
                  ...v,
                  progress: nextProgress,
                  dir: nextDir,
                  heading: nextHeading,
                  lat: v.lat + (nextDir === 1 ? 0.0005 : -0.0005),
                  lng: v.lng + (nextDir === 1 ? 0.0004 : -0.0004),
                  updated_at: new Date().toISOString(),
                };
              })
            );
            setPulse((p) => !p);
          }, 1000);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
      if (localTimer) clearInterval(localTimer);
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
        /* Visual Interactive Radar Grid when native Google Maps library is pending */
        <View style={[styles.visualRadar, { backgroundColor: isGlare ? '#ffffff' : '#0f172a' }]}>
          <View style={styles.radarGrid}>
            {/* Stops points */}
            {stops.map((s) => (
              <View
                key={s.id}
                style={[
                  styles.radarStopPoint,
                  {
                    left: `${((s.lng - 74.22) / 0.16) * 90 + 5}%`,
                    top: `${((31.63 - s.lat) / 0.25) * 85 + 5}%`,
                    backgroundColor: colors.network[s.network],
                    borderColor: isGlare ? '#000000' : '#ffffff',
                    borderWidth: isGlare ? 2 : 1,
                  },
                ]}
              />
            ))}

            {/* Vehicle Markers */}
            {filteredVehicles.map((v) => {
              const leftPct = `${Math.min(92, Math.max(5, ((v.lng - 74.22) / 0.16) * 90 + 5))}%`;
              const topPct = `${Math.min(90, Math.max(5, ((31.63 - v.lat) / 0.25) * 85 + 5))}%`;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setSelectedVehicle(v)}
                  style={[styles.radarVehicleAnchor, { left: leftPct, top: topPct }]}
                >
                  <VehicleMarker
                    id={v.id}
                    routeId={v.route_id}
                    heading={v.heading}
                    selected={selectedVehicle?.id === v.id}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Floating Header: Live Latency Badge & Filter Pills */}
      <View style={[styles.headerOverlay, { top: insets.top + spacing.two }]}>
        {/* Latency & Status Badge */}
        <View
          style={[
            styles.latencyBadge,
            {
              backgroundColor: colors.card,
              borderColor: isGlare ? colors.border : colors.borderStrong,
              borderWidth: isGlare ? 2 : 1,
              borderRadius: borderRadius.full,
              paddingHorizontal: spacing.three,
              paddingVertical: spacing.one,
              marginBottom: spacing.two,
            },
          ]}
        >
          <View
            style={[
              styles.pulseDot,
              {
                backgroundColor: pulse ? colors.success : '#22c55e',
                transform: [{ scale: pulse ? 1.2 : 1.0 }],
              },
            ]}
          />
          <Text
            variant="labelMedium"
            style={{
              color: colors.text,
              fontWeight: isGlare ? '800' : '700',
              marginLeft: spacing.one,
            }}
          >
            Live • 1s Feed • {filteredVehicles.length} Vehicles
          </Text>
        </View>

        {/* Network Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
          <Chip
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            style={[
              styles.chip,
              selectedFilter === 'all' && { backgroundColor: colors.primary },
              isGlare && { borderWidth: 1.5, borderColor: colors.border },
            ]}
            textStyle={{ color: selectedFilter === 'all' ? '#ffffff' : colors.text }}
          >
            All Networks
          </Chip>
          <Chip
            selected={selectedFilter === 'metrobus'}
            onPress={() => setSelectedFilter('metrobus')}
            style={[
              styles.chip,
              selectedFilter === 'metrobus' && { backgroundColor: colors.network.metrobus },
              isGlare && { borderWidth: 1.5, borderColor: colors.border },
            ]}
            textStyle={{ color: selectedFilter === 'metrobus' ? '#ffffff' : colors.text }}
          >
            Metrobus
          </Chip>
          <Chip
            selected={selectedFilter === 'orange'}
            onPress={() => setSelectedFilter('orange')}
            style={[
              styles.chip,
              selectedFilter === 'orange' && { backgroundColor: colors.network.orange },
              isGlare && { borderWidth: 1.5, borderColor: colors.border },
            ]}
            textStyle={{ color: selectedFilter === 'orange' ? '#ffffff' : colors.text }}
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
            textStyle={{ color: selectedFilter === 'speedo' ? '#ffffff' : colors.text }}
          >
            Speedo
          </Chip>
        </ScrollView>
      </View>

      {/* Selected Vehicle Info Card */}
      {selectedVehicle && (
        <View style={[styles.bottomSheetContainer, { bottom: spacing.four }]}>
          <AppCard elevation={3} variant="elevated">
            <View style={styles.vehicleCardHeader}>
              <View style={styles.row}>
                <Icon
                  source={
                    selectedVehicle.route_id.startsWith('OL')
                      ? 'train'
                      : selectedVehicle.route_id.startsWith('MB')
                      ? 'bus-articulated-front'
                      : 'bus'
                  }
                  size={24}
                  color={colors.primary}
                />
                <View style={{ marginLeft: spacing.two }}>
                  <Text
                    variant="titleMedium"
                    style={{ color: colors.text, fontWeight: isGlare ? '800' : '700' }}
                  >
                    Vehicle {selectedVehicle.id}
                  </Text>
                  <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                    Route {selectedVehicle.route_id} • Heading {Math.round(selectedVehicle.heading)}°
                  </Text>
                </View>
              </View>

              <Pressable onPress={() => setSelectedVehicle(null)} style={styles.closeBtn}>
                <Icon source="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={[styles.vehicleStatsRow, { marginTop: spacing.three }]}>
              <View style={styles.statBox}>
                <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                  Progress
                </Text>
                <Text
                  variant="bodyLarge"
                  style={{ color: colors.text, fontWeight: isGlare ? '800' : '700' }}
                >
                  {Math.round(selectedVehicle.progress * 100)}%
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                  Standard Fare
                </Text>
                <Text
                  variant="bodyLarge"
                  style={{ color: colors.primary, fontWeight: isGlare ? '800' : '700' }}
                >
                  {selectedVehicle.route_id.startsWith('OL')
                    ? 'Rs. 40'
                    : selectedVehicle.route_id.startsWith('MB')
                    ? 'Rs. 30'
                    : 'Rs. 20'}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                  Student Fare
                </Text>
                <Text
                  variant="bodyLarge"
                  style={{ color: colors.network.student, fontWeight: isGlare ? '800' : '700' }}
                >
                  Rs. 0 (Free)
                </Text>
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
            bottom: selectedVehicle ? 180 : 20,
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
  visualRadar: {
    ...StyleSheet.absoluteFillObject,
  },
  radarGrid: {
    flex: 1,
    position: 'relative',
    margin: 20,
  },
  radarStopPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    marginTop: -5,
  },
  radarVehicleAnchor: {
    position: 'absolute',
    marginLeft: -25,
    marginTop: -20,
  },
  headerOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  latencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  vehicleStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
  },
  recenterFab: {
    position: 'absolute',
    right: 16,
    zIndex: 12,
  },
});
