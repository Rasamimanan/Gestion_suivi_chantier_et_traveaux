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

    const inAuthGroup = segments[0] === '(auth)';

    // 🔐 NON CONNECTÉ → bloqué hors auth
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }

    // 🔓 CONNECTÉ → bloque accès login/register
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }

  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* AUTH GROUP */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* APP TABS */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* PROTECTED SCREENS */}
      <Stack.Screen name="chantier/[id]" options={{ title: 'Chantier' }} />
      <Stack.Screen name="chantier/[id]/etapes" options={{ title: 'Étapes' }} />
      <Stack.Screen name="chantier/[id]/budget" options={{ title: 'Budget' }} />
      <Stack.Screen name="chantier/[id]/depenses" options={{ title: 'Budget' }} />
      <Stack.Screen name="chantier/create" options={{ title: 'Nouveau Chantier' }} />
      <Stack.Screen name="chantier/edit/[id]" options={{ title: 'Modifier Chantier' }} />
      <Stack.Screen name="etape/[id]" options={{ title: 'Étape' }} />
      <Stack.Screen name="etape/[id]/commentaires" options={{ title: 'Commentaires' }} />
      <Stack.Screen name="etape/create" options={{ title: 'Nouvelle Étape' }} />
      <Stack.Screen name="admin/utilisateurs" options={{ title: 'Gestion des utilisateurs' }} />
      <Stack.Screen name="budget/add-depense" options={{ title: 'Nouvelle dépense' }} />
      <Stack.Screen name="budget/add-revenu" options={{ title: 'Nouveau revenu' }} />
    </Stack>
  );
}

// ================= ROOT =================
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}