import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { AppCard } from '@/components/AppCard';
import { Itinerary, Leg, NetworkType } from '@/services/types';

export interface ItineraryCardProps {
  itinerary: Itinerary;
  onSelect?: () => void;
}

/**
 * ItineraryCard: Displays journey summary and step-by-step transit legs
 * directly typed against services/types.ts.
 */
export const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary, onSelect }) => {
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();

  const resolveNetwork = (leg: Leg): NetworkType => {
    if (leg.network) return leg.network;
    if (leg.route_id.startsWith('MB')) return 'metrobus';
    if (leg.route_id.startsWith('OL')) return 'orange';
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
          const network = resolveNetwork(leg);
          const networkColor = colors.network[network];
          const fromName = leg.from_name || leg.from;
          const toName = leg.to_name || leg.to;
          const routeTitle = leg.route_name || leg.route_id;

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
                    {fromName} → {toName}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: colors.textSecondary,
                      marginTop: spacing.half,
                    }}
                  >
                    {routeTitle} • {leg.minutes} mins • Rs. {leg.fare_pkr}
                  </Text>
                </View>
              </View>

              {/* Transfer walk if subsequent legs exist */}
              {index < itinerary.legs.length - 1 && (
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
                    Transfer connection (2-3 min walk)
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
