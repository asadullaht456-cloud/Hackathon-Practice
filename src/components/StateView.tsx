import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ActivityIndicator, Button, Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/ui/useAppTheme';

export type ViewState = 'loading' | 'empty' | 'error' | 'content';

export interface StateViewProps {
  state: ViewState;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
}

/**
 * StateView: Standardized state handler (loading, empty, error, content)
 * Required by AGENTS.md Rule 3 across all screens.
 */
export const StateView: React.FC<StateViewProps> = ({
  state,
  loadingMessage = 'Loading transit updates...',
  emptyTitle = 'No Information Found',
  emptyMessage = 'There is currently no transit data available for this view.',
  emptyIcon = 'bus-stop',
  emptyActionLabel,
  onEmptyAction,
  errorTitle = 'Connection Error',
  errorMessage = 'Could not load transit data. Please check your network and try again.',
  onRetry,
  style,
  children,
}) => {
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();

  if (state === 'content') {
    return <>{children}</>;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          padding: spacing.six,
        },
        style,
      ]}
    >
      {state === 'loading' && (
        <View style={styles.content}>
          <ActivityIndicator
            animating
            size="large"
            color={colors.primary}
            style={styles.spinner}
          />
          <Text
            variant="bodyLarge"
            style={[
              styles.textCenter,
              {
                color: colors.text,
                fontWeight: isGlare ? '700' : '500',
                marginTop: spacing.four,
              },
            ]}
          >
            {loadingMessage}
          </Text>
        </View>
      )}

      {state === 'empty' && (
        <View style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: isGlare ? colors.border : 'transparent',
                borderWidth: isGlare ? 2 : 0,
                borderRadius: borderRadius.full,
                marginBottom: spacing.four,
              },
            ]}
          >
            <Icon source={emptyIcon} size={48} color={colors.textSecondary} />
          </View>
          <Text
            variant="headlineSmall"
            style={[
              styles.textCenter,
              {
                color: colors.text,
                fontWeight: isGlare ? '800' : '700',
                marginBottom: spacing.two,
              },
            ]}
          >
            {emptyTitle}
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.textCenter,
              {
                color: colors.textSecondary,
                marginBottom: spacing.six,
                maxWidth: 320,
              },
            ]}
          >
            {emptyMessage}
          </Text>
          {emptyActionLabel && onEmptyAction && (
            <Button
              mode="contained"
              onPress={onEmptyAction}
              buttonColor={colors.primary}
              textColor={colors.onPrimary}
              style={[
                styles.button,
                isGlare && { borderWidth: 2, borderColor: colors.border },
              ]}
            >
              {emptyActionLabel}
            </Button>
          )}
        </View>
      )}

      {state === 'error' && (
        <View style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.errorContainer,
                borderColor: isGlare ? colors.border : colors.error,
                borderWidth: isGlare ? 2 : 1,
                borderRadius: borderRadius.full,
                marginBottom: spacing.four,
              },
            ]}
          >
            <Icon
              source="alert-circle-outline"
              size={48}
              color={isGlare ? colors.text : colors.error}
            />
          </View>
          <Text
            variant="headlineSmall"
            style={[
              styles.textCenter,
              {
                color: colors.text,
                fontWeight: isGlare ? '800' : '700',
                marginBottom: spacing.two,
              },
            ]}
          >
            {errorTitle}
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.textCenter,
              {
                color: colors.textSecondary,
                marginBottom: spacing.six,
                maxWidth: 320,
              },
            ]}
          >
            {errorMessage}
          </Text>
          {onRetry && (
            <Button
              mode="contained"
              onPress={onRetry}
              buttonColor={colors.primary}
              textColor={colors.onPrimary}
              icon="refresh"
              style={[
                styles.button,
                isGlare && { borderWidth: 2, borderColor: colors.border },
              ]}
            >
              Try Again
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  textCenter: {
    textAlign: 'center',
  },
  button: {
    minWidth: 150,
  },
});
