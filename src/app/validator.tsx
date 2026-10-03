import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function ValidatorScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Validator Mode</Text>
      <Text variant="bodyLarge" style={styles.text}>Mock flow for validator.</Text>
      <Button mode="contained" onPress={() => router.back()} style={styles.button}>
        Close
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  text: { marginVertical: 20 },
  button: { marginTop: 10 }
});
