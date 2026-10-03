import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { AppCard } from '@/components/AppCard';

export interface ItineraryLeg {
  route_id: string;
  from: string;
  to: string;
  minutes: number;
  fare_pkr: number;
  walk_minutes_after?: number;
}

export interface Itinerary {
  mode: 'fastest' | 'cheapest';
  total_minutes: number;
  total_fare_pkr: number;
  transfers: number;
  legs: ItineraryLeg[];
}

export interface ItineraryCardProps {
  itinerary: Itinerary;
  onSelect?: () => void;
}

/**
 * ItineraryCard: Displays journey summary and step-by-step transit legs.
 */
export const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary, onSelect }) => {
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();

  const getNetworkForRoute = (routeId: string) => {
    if (routeId.startsWith('MB')) return 'metrobus';
    if (routeId.startsWith('OL')) return 'orange';
    return 'speedo';
  };

  return (
    <AppCard
      variant="elevated"
      elevation={2}
      onPress={onSelect}
      style={{ marginBottom: spacing.four }}
    >
      {/* Summary Header */}
      <View style={styles.headerRow}>
        <View style={styles.timeFareContainer}>
          <Text
            variant="headlineSmall"
            style={{
              color: colors.primary,
              fontWeight: isGlare ? '800' : '700',
            }}
          >
            {itinerary.total_minutes} mins
          </Text>
          <Text
            variant="titleMedium"
            style={{
              color: colors.textSecondary,
              marginLeft: spacing.two,
              fontWeight: '600',
            }}
          >
            • Rs. {itinerary.total_fare_pkr}
          </Text>
        </View>

        <View
          style={[
            styles.modeBadge,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: isGlare ? colors.border : 'transparent',
              borderWidth: isGlare ? 1.5 : 0,
              borderRadius: borderRadius.sm,
              paddingHorizontal: spacing.two,
              paddingVertical: spacing.half,
            },
          ]}
        >
          <Text
            variant="labelSmall"
            style={{
              color: colors.text,
              fontWeight: isGlare ? '700' : '600',
              textTransform: 'uppercase',
            }}
          >
            {itinerary.transfers === 0
              ? 'Direct'
              : `${itinerary.transfers} Transfer${itinerary.transfers > 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* Route Legs */}
      <View style={[styles.legsContainer, { marginTop: spacing.four }]}>
        {itinerary.legs.map((leg, index) => {
          const network = getNetworkForRoute(leg.route_id);
          const networkColor = colors.network[network];

          return (
            <View key={`${leg.route_id}-${index}`} style={styles.legWrapper}>
              <View style={styles.legStepRow}>
                {/* Network Indicator Pill */}
                <View
                  style={[
                    styles.networkPill,
                    {
                      backgroundColor: isGlare ? '#ffffff' : networkColor,
                      borderColor: isGlare ? colors.border : 'transparent',
                      borderWidth: isGlare ? 2 : 0,
                      borderRadius: borderRadius.sm,
                      paddingHorizontal: spacing.two,
                      paddingVertical: spacing.half,
                    },
                  ]}
                >
                  <Icon
                    source={
                      network === 'orange'
                        ? 'train'
                        : network === 'metrobus'
                        ? 'bus-articulated-front'
                        : 'bus'
                    }
                    size={14}
                    color={isGlare ? colors.text : '#ffffff'}
                  />
                  <Text
                    variant="labelSmall"
                    style={{
                      color: isGlare ? colors.text : '#ffffff',
                      fontWeight: isGlare ? '800' : '700',
                      marginLeft: spacing.one,
                    }}
                  >
                    {leg.route_id}
                  </Text>
                </View>

                {/* From / To description */}
                <View style={[styles.legDetails, { marginLeft: spacing.three }]}>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: colors.text,
                      fontWeight: isGlare ? '700' : '600',
                    }}
                  >
                    {leg.from} → {leg.to}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: colors.textSecondary,
                      marginTop: spacing.half,
                    }}
                  >
                    {leg.minutes} mins • Rs. {leg.fare_pkr}
                  </Text>
                </View>
              </View>

              {/* Transfer walk if applicable */}
              {leg.walk_minutes_after !== undefined && leg.walk_minutes_after > 0 && (
                <View
                  style={[
                    styles.walkRow,
                    {
                      marginLeft: spacing.four,
                      paddingLeft: spacing.four,
                      borderLeftWidth: 2,
                      borderLeftColor: colors.borderStrong,
                      paddingVertical: spacing.two,
                    },
                  ]}
                >
                  <Icon source="walk" size={16} color={colors.textSecondary} />
                  <Text
                    variant="labelSmall"
                    style={{
                      color: colors.textSecondary,
                      marginLeft: spacing.one,
                    }}
                  >
                    Walk {leg.walk_minutes_after} min to transfer
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeFareContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  modeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legsContainer: {
    width: '100%',
  },
  legWrapper: {
    marginBottom: 6,
  },
  legStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legDetails: {
    flex: 1,
  },
  walkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
