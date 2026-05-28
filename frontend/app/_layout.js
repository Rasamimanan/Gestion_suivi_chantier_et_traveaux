import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import '../global.css';

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) router.replace('/(auth)/login');
    else if (isAuthenticated && inAuth) router.replace('/(tabs)');
  }, [isAuthenticated, loading, segments]);

  if (loading) return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#3b82f6' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chantier/[id]" options={{ title: 'Chantier' }} />
      <Stack.Screen name="chantier/[id]/etapes" options={{ title: 'Étapes' }} />
      <Stack.Screen name="chantier/[id]/depenses" options={{ title: 'Dépenses' }} />
      <Stack.Screen name="chantier/create" options={{ title: 'Nouveau Chantier' }} />
      <Stack.Screen name="chantier/edit/[id]" options={{ title: 'Modifier Chantier' }} />
      <Stack.Screen name="etape/[id]" options={{ title: 'Étape' }} />
      <Stack.Screen name="etape/[id]/commentaires" options={{ title: 'Commentaires' }} />
      <Stack.Screen name="etape/create" options={{ title: 'Nouvelle Étape' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return <AuthProvider><RootNavigator /></AuthProvider>;
}
