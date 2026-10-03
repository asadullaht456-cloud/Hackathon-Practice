import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Pressable } from 'react-native';
import { useAppTheme } from '@/hooks/ui/useAppTheme';

export interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  elevation?: 1 | 2 | 3;
}

/**
 * AppCard: Standardized elevated/outlined card surface.
 * Adapts seamlessly to Light, Dark, and high-contrast Glare modes.
 */
export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  elevation = 1,
}) => {
  const { colors, spacing, borderRadius, isGlare, isDark } = useAppTheme();

  const getBackgroundColor = () => {
    if (variant === 'flat') return colors.surfaceVariant;
    if (elevation > 1) return colors.cardElevated;
    return colors.card;
  };

  const getBorderStyle = (): ViewStyle => {
    if (isGlare) {
      return {
        borderWidth: 2,
        borderColor: colors.border,
      };
    }

    if (variant === 'outlined') {
      return {
        borderWidth: 1,
        borderColor: colors.border,
      };
    }

    return {
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(0,0,0,0.06)',
    };
  };

  const getElevationStyle = (): ViewStyle => {
    if (isGlare || variant === 'flat' || variant === 'outlined') {
      return {};
    }

    if (elevation === 1) {
      return styles.elevation1;
    }
    if (elevation === 2) {
      return styles.elevation2;
    }
    return styles.elevation3;
  };

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: getBackgroundColor(),
      borderRadius: borderRadius.lg,
      padding: spacing.four,
    },
    getBorderStyle(),
    getElevationStyle(),
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  elevation1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  elevation2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  elevation3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },
});
