import { Stack, useRouter, useSegments } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, loading, segments]);

  if (loading) return null; // Or a loading spinner

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="student-verify" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="validator" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
    </Stack>
  );
}

export default function RootLayout() {
  // CR to Dev2: provide useAppTheme here once available
  const theme = MD3LightTheme; // stub theme until Dev2's theme lands

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <AuthGate />
      </PaperProvider>
    </AuthProvider>
  );
}
