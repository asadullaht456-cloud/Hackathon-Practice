import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/ui/useAppTheme';

export interface VehicleMarkerProps {
  id: string;
  routeId: string;
  network?: 'metrobus' | 'orange' | 'speedo';
  heading?: number;
  selected?: boolean;
}

/**
 * VehicleMarker: Custom transit vehicle marker for live map.
 * Memoized with React.memo to ensure 60 FPS during Realtime updates.
 */
export const VehicleMarker: React.FC<VehicleMarkerProps> = React.memo(
  ({ id, routeId, network, heading = 0, selected = false }) => {
    const { colors, spacing, borderRadius, isGlare } = useAppTheme();

    const resolvedNetwork =
      network ||
      (routeId.startsWith('MB')
        ? 'metrobus'
        : routeId.startsWith('OL')
        ? 'orange'
        : 'speedo');

    const networkColor = colors.network[resolvedNetwork];

    const getVehicleIcon = () => {
      switch (resolvedNetwork) {
        case 'orange':
          return 'train';
        case 'metrobus':
          return 'bus-articulated-front';
        case 'speedo':
        default:
          return 'bus';
      }
    };

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isGlare ? '#ffffff' : networkColor,
              borderColor: isGlare ? '#000000' : selected ? '#ffffff' : 'rgba(0,0,0,0.15)',
              borderWidth: isGlare ? 2.5 : selected ? 2.5 : 1,
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.two,
              paddingVertical: spacing.one,
            },
            selected && styles.selectedShadow,
          ]}
        >
          <View style={styles.row}>
            <Icon
              source={getVehicleIcon()}
              size={16}
              color={isGlare ? networkColor : '#ffffff'}
            />
            <Text
              variant="labelSmall"
              style={[
                styles.badgeText,
                {
                  color: isGlare ? '#000000' : '#ffffff',
                  fontWeight: isGlare ? '800' : '700',
                  marginLeft: spacing.one,
                },
              ]}
            >
              {routeId}
            </Text>
            {heading !== undefined && (
              <View
                style={[
                  styles.headingIndicator,
                  {
                    transform: [{ rotate: `${heading}deg` }],
                    marginLeft: spacing.one,
                  },
                ]}
              >
                <Icon
                  source="navigation-variant"
                  size={12}
                  color={isGlare ? '#000000' : '#ffffff'}
                />
              </View>
            )}
          </View>
        </View>

        {/* Pin pointer tip */}
        <View
          style={[
            styles.triangle,
            {
              borderTopColor: isGlare ? '#000000' : networkColor,
            },
          ]}
        />
      </View>
    );
  },
  (prev, next) =>
    prev.id === next.id &&
    prev.routeId === next.routeId &&
    prev.network === next.network &&
    prev.heading === next.heading &&
    prev.selected === next.selected
);

VehicleMarker.displayName = 'VehicleMarker';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    letterSpacing: 0.5,
  },
  headingIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  selectedShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
});
