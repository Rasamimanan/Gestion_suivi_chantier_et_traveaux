import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, RefreshControl, ScrollView,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDashboard } from '../../services/api';

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
  const COLORS = {
    blue:   { bg: '#EBF3FF', text: '#185FA5', bar: '#378ADD' },
    amber:  { bg: '#FAEEDA', text: '#854F0B', bar: '#BA7517' },
    green:  { bg: '#EAF3DE', text: '#3B6D11', bar: '#639922' },
    purple: { bg: '#EEEDFE', text: '#534AB7', bar: '#7F77DD' },
  };
  const c = COLORS[accent] || COLORS.blue;
  return (
    <View style={{
      flex: 1, backgroundColor: '#fff',
      borderRadius: 12, borderWidth: 0.5, borderColor: '#e5e7eb',
      padding: 14, gap: 6,
    }}>
      <View style={{
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '500', color: '#1a1a1a' }}>{value ?? 0}</Text>
      <Text style={{ fontSize: 12, color: '#6b7280' }}>{label}</Text>
    </View>
  );
}

// ── ActionBtn ─────────────────────────────────────────────────
function ActionBtn({ icon, title, sub, accentColor, onPress }) {
  const COLORS = {
    blue:   { bg: '#EBF3FF' },
    green:  { bg: '#EAF3DE' },
    purple: { bg: '#EEEDFE' },
    amber:  { bg: '#FAEEDA' },
  };
  const c = COLORS[accentColor] || COLORS.blue;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flex: 1, backgroundColor: '#fff',
        borderRadius: 12, borderWidth: 0.5, borderColor: '#e5e7eb',
        padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
      }}
    >
      <View style={{
        width: 36, height: 36, borderRadius: 8,
        backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#1a1a1a' }}>{title}</Text>
        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── SectionLabel ──────────────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <Text style={{
      fontSize: 12, fontWeight: '500', color: '#9ca3af',
      letterSpacing: 0.8, textTransform: 'uppercase',
      marginTop: 4, marginBottom: 8,
    }}>
      {text}
    </Text>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useAuth();
  const router   = useRouter();
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await getDashboard();
      setStats(res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          colors={['#2563eb']}
        />
      }
    >
      {/* ── Hero ── */}
      <View style={{
        backgroundColor: '#2563eb', borderRadius: 16,
        padding: 18, marginBottom: 20,
      }}>
        <Text style={{ fontSize: 17, fontWeight: '500', color: '#fff' }}>
          Bonjour, {user?.prenom} 👋
        </Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
          {stats?.chantiers?.en_cours ?? 0} chantier(s) actif(s) ce mois
        </Text>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
          📅 {today}
        </Text>
      </View>

      {/* ── Stats chantiers ── */}
      {stats && (
        <>
          <SectionLabel text="Chantiers" />
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <StatCard icon="🏗️" label="Total"    value={stats.chantiers?.total}    accent="blue"   />
            <StatCard icon="⚙️" label="En cours" value={stats.chantiers?.en_cours} accent="amber"  />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <StatCard icon="✅" label="Terminés"     value={stats.chantiers?.termine} accent="green"  />
            <StatCard icon="👷" label="Intervenants" value={stats.intervenants}        accent="purple" />
          </View>

          {/* Stats étapes */}
          <SectionLabel text="Étapes" />
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <StatCard icon="📋" label="Total"    value={stats.etapes?.total}    accent="blue"   />
            <StatCard icon="🔧" label="En cours" value={stats.etapes?.en_cours} accent="amber"  />
            <StatCard icon="✅" label="Terminées" value={stats.etapes?.termine} accent="green"  />
          </View>
        </>
      )}

      {/* ── Actions rapides ── */}
      <SectionLabel text="Actions rapides" />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <ActionBtn
          icon="➕" title="Nouveau chantier" sub="Créer un projet"
          accentColor="blue"
          onPress={() => router.push('/chantier/create')}
        />
        <ActionBtn
          icon="💰" title="Ajouter dépense" sub="Budget"
          accentColor="green"
          onPress={() => router.push('/budget/add-depense')}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <ActionBtn
          icon="👤" title="Intervenants" sub="Gérer"
          accentColor="purple"
          onPress={() => router.push('/(tabs)/intervenants')}
        />
        <ActionBtn
          icon="📷" title="Photo étape" sub="Documenter"
          accentColor="amber"
          onPress={() => router.push('/(tabs)/chantiers')}
        />
      </View>

      {/* ══ BOUTON VOIR TOUT ══ */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/chantiers')}
        activeOpacity={0.8}
        style={{
          backgroundColor: '#2563eb',
          borderRadius: 12,
          paddingVertical: 15,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
          Voir tous les chantiers
        </Text>
        <Text style={{ color: '#fff', fontSize: 15 }}>→</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}