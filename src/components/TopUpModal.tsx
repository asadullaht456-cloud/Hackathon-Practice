import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Button, Modal, Portal, Text, Icon } from 'react-native-paper';
import { useAppTheme } from '@/hooks/ui/useAppTheme';

export interface TopUpModalProps {
  visible: boolean;
  onDismiss: () => void;
  onTopUp: (amount: number, method: 'jazzcash' | 'raast') => Promise<void>;
  loading?: boolean;
}

const PRESET_AMOUNTS = [100, 200, 500, 1000];

/**
 * TopUpModal: Bottom sheet / modal for mock PKR top-ups via JazzCash or RAAST.
 */
export const TopUpModal: React.FC<TopUpModalProps> = ({
  visible,
  onDismiss,
  onTopUp,
  loading = false,
}) => {
  const { colors, spacing, borderRadius, isGlare } = useAppTheme();
  const [selectedAmount, setSelectedAmount] = useState<number>(200);
  const [selectedMethod, setSelectedMethod] = useState<'jazzcash' | 'raast'>('jazzcash');

  const handleConfirm = async () => {
    await onTopUp(selectedAmount, selectedMethod);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          {
            backgroundColor: colors.card,
            borderRadius: borderRadius.xl,
            borderColor: isGlare ? colors.border : colors.borderStrong,
            borderWidth: isGlare ? 2 : 1,
            padding: spacing.six,
          },
        ]}
      >
        <Text
          variant="headlineSmall"
          style={[
            styles.title,
            {
              color: colors.text,
              fontWeight: isGlare ? '800' : '700',
              marginBottom: spacing.four,
            },
          ]}
        >
          Add Transit Balance
        </Text>

        {/* Payment Method Selector */}
        <Text
          variant="labelMedium"
          style={{
            color: colors.textSecondary,
            fontWeight: isGlare ? '700' : '600',
            marginBottom: spacing.two,
          }}
        >
          Select Payment Method (Mock)
        </Text>
        <View style={[styles.row, { marginBottom: spacing.five }]}>
          <Pressable
            onPress={() => setSelectedMethod('jazzcash')}
            style={[
              styles.methodCard,
              {
                backgroundColor:
                  selectedMethod === 'jazzcash'
                    ? colors.primaryContainer
                    : colors.surfaceVariant,
                borderColor:
                  selectedMethod === 'jazzcash'
                    ? colors.primary
                    : isGlare
                    ? colors.border
                    : 'transparent',
                borderWidth: isGlare || selectedMethod === 'jazzcash' ? 2 : 1,
                borderRadius: borderRadius.md,
                padding: spacing.three,
                marginRight: spacing.two,
              },
            ]}
          >
            <Icon
              source="cellphone"
              size={20}
              color={selectedMethod === 'jazzcash' ? colors.primary : colors.textSecondary}
            />
            <Text
              variant="labelLarge"
              style={{
                color: colors.text,
                fontWeight: isGlare || selectedMethod === 'jazzcash' ? '700' : '500',
                marginLeft: spacing.one,
              }}
            >
              JazzCash
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedMethod('raast')}
            style={[
              styles.methodCard,
              {
                backgroundColor:
                  selectedMethod === 'raast'
                    ? colors.primaryContainer
                    : colors.surfaceVariant,
                borderColor:
                  selectedMethod === 'raast'
                    ? colors.primary
                    : isGlare
                    ? colors.border
                    : 'transparent',
                borderWidth: isGlare || selectedMethod === 'raast' ? 2 : 1,
                borderRadius: borderRadius.md,
                padding: spacing.three,
                marginLeft: spacing.two,
              },
            ]}
          >
            <Icon
              source="bank-transfer"
              size={20}
              color={selectedMethod === 'raast' ? colors.primary : colors.textSecondary}
            />
            <Text
              variant="labelLarge"
              style={{
                color: colors.text,
                fontWeight: isGlare || selectedMethod === 'raast' ? '700' : '500',
                marginLeft: spacing.one,
              }}
            >
              RAAST (Instant)
            </Text>
          </Pressable>
        </View>

        {/* Amount Selector */}
        <Text
          variant="labelMedium"
          style={{
            color: colors.textSecondary,
            fontWeight: isGlare ? '700' : '600',
            marginBottom: spacing.two,
          }}
        >
          Select Amount (PKR)
        </Text>
        <View style={[styles.grid, { marginBottom: spacing.six }]}>
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = selectedAmount === amt;
            return (
              <Pressable
                key={amt}
                onPress={() => setSelectedAmount(amt)}
                style={[
                  styles.amountCard,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surfaceVariant,
                    borderColor: isGlare ? colors.border : isSelected ? colors.primary : 'transparent',
                    borderWidth: isGlare ? 2 : 1,
                    borderRadius: borderRadius.md,
                    paddingVertical: spacing.three,
                  },
                ]}
              >
                <Text
                  variant="titleMedium"
                  style={{
                    color: isSelected ? '#ffffff' : colors.text,
                    fontWeight: isGlare || isSelected ? '800' : '600',
                  }}
                >
                  Rs. {amt}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            textColor={colors.textSecondary}
            style={[styles.actionBtn, { marginRight: spacing.two }]}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            loading={loading}
            disabled={loading}
            buttonColor={colors.primary}
            textColor={colors.onPrimary}
            style={[
              styles.actionBtn,
              { marginLeft: spacing.two },
              isGlare && { borderWidth: 2, borderColor: colors.border },
            ]}
          >
            Pay Rs. {selectedAmount}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    maxWidth: 480,
    alignSelf: 'center',
    width: '90%',
  },
  title: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
  },
});
