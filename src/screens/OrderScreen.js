import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiFetch } from '../services/api';

export default function OrdersScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Busca o histórico de pedidos na API
  const fetchPedidos = useCallback(async () => {
    try {
      // Consome GET /pedidos (retorna o objeto/array direto)
      const response = await apiFetch('/pedidos');

      if (Array.isArray(response)) {
        setPedidos(response);
      } else if (response && Array.isArray(response.dados)) {
        setPedidos(response.dados);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPedidos();
    }, [fetchPedidos])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPedidos();
  };

  // Mapeia visualmente as opções de status descritas no documento
  function renderStatusBadge(status) {
    const statusMap = {
      pendente: { label: 'Pendente', color: '#E63946' },
      preparo: { label: 'Em Preparo', color: '#F4A261' },
      pronto: { label: 'Pronto', color: '#2A9D8F' },
      entregue: { label: 'Entregue', color: '#457B9D' },
    };

    const config = statusMap[status?.toLowerCase()] || {
      label: status || 'Desconhecido',
      color: '#666',
    };

    return (
      <View style={[styles.badge, { backgroundColor: config.color }]}>
        <Text style={styles.badgeText}>{config.label}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={styles.loadingText}>A carregar os seus pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E63946']} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>Pedido #{item.id}</Text>
              {renderStatusBadge(item.status)}
            </View>

            <Text style={styles.clientText}>
              Cliente: {item.cliente || 'Não informado'}
            </Text>

            {item.total !== undefined && (
              <Text style={styles.totalText}>
                Total: R$ {Number(item.total).toFixed(2).replace('.', ',')}
              </Text>
            )}

            {item.created_at && (
              <Text style={styles.dateText}>
                Data: {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#666' },
  emptyText: { color: '#888', fontSize: 16 },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  clientText: { fontSize: 14, color: '#555', marginBottom: 4 },
  totalText: { fontSize: 15, fontWeight: 'bold', color: '#E63946', marginTop: 4 },
  dateText: { fontSize: 12, color: '#888', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});