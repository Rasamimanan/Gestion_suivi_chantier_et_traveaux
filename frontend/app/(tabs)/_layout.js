import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useRole } from '../../hooks/useRole';

export default function TabLayout() {
  const { isAdmin, isChef } = useRole();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a3a5c',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          elevation: 8,
          height: 62,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: '#1a3a5c' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerTitle: '🏗️ Suivi Chantier',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chantiers"
        options={{
          title: 'Chantiers',
          tabBarIcon: ({ color, size }) => <Ionicons name="construct" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recherche"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />,
        }}
      />
      {/* 🔒 ADMIN + CHEF uniquement */}
      <Tabs.Screen
        name="intervenants"
        options={{
          title: 'Équipe',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          href: isAdmin || isChef ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}