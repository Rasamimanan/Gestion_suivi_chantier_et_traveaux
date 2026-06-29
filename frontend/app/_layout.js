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
    const inTabs = segments[0] === '(tabs)';
    const onWelcome = segments[0] === 'welcome' || segments.length === 0;

    // 🔓 CONNECTÉ → redirige vers les tabs
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    // 🔐 NON CONNECTÉ → bloque l'accès aux tabs, renvoie au welcome
    if (!isAuthenticated && inTabs) {
      router.replace('/welcome');
      return;
    }

    // 🏠 Première visite → page welcome
    if (!isAuthenticated && segments.length === 0) {
      router.replace('/welcome');
    }

  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1a3a5c" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a3a5c' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* WELCOME / LANDING */}
      <Stack.Screen name="welcome" options={{ headerShown: false }} />

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

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}