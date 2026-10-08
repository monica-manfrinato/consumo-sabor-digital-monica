import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { apiFetch } from '../services/api';

export default function OrderDetailScreen({ route, navigation }) {
  const { pedidoId } = route.params || {};
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadPedido = useCallback(async () => {
    try {
      // Consome GET /pedidos/:id
      const response = await apiFetch(`/pedidos/${pedidoId}`);
      setPedido(response);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do pedido.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [pedidoId, navigation]);

  useEffect(() => {
    if (pedidoId) {
      loadPedido();
    }
  }, [pedidoId, loadPedido]);

  // Função para alterar o status do pedido (PATCH /pedidos/:id/status)
  async function handleUpdateStatus(novoStatus) {
    try {
      setUpdating(true);
      await apiFetch(`/pedidos/${pedidoId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: novoStatus }),
      });

      Alert.alert('Sucesso', `Estado alterado para "${novoStatus}"!`);
      loadPedido(); // Recarrega os dados atualizados
    } catch (error) {
      Alert.alert(
        'Erro ao atualizar',
        error.message || 'Verifique se a sua conta tem permissões de admin.'
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Pedido não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Informações Principais do Pedido */}
      <View style={styles.headerCard}>
        <Text style={styles.orderId}>Pedido #{pedido.id}</Text>
        <Text style={styles.clientText}>Cliente: {pedido.cliente || 'Não informado'}</Text>
        <Text style={styles.statusText}>
          Estado atual: <Text style={styles.statusHighlight}>{pedido.status}</Text>
        </Text>
        {pedido.total !== undefined && (
          <Text style={styles.totalText}>
            Total: R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
          </Text>
        )}
      </View>

      {/* Lista de Itens do Pedido */}
      <Text style={styles.sectionTitle}>Itens Solicitados</Text>
      <View style={styles.itemsCard}>
        {Array.isArray(pedido.itens) && pedido.itens.length > 0 ? (
          pedido.itens.map((item, index) => (
            <View key={item.id || index} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.produto?.nome || item.nome || `Produto #${item.produto_id}`}
              </Text>
              <Text style={styles.itemQty}>x{item.quantidade}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhum item detalhado retornado.</Text>
        )}
      </View>

      {/* Painel de Alteração de Estado (Admin) */}
      <Text style={styles.sectionTitle}>Atualizar Estado do Pedido (Admin)</Text>
      <View style={styles.statusButtonsContainer}>
        {['pendente', 'preparo', 'pronto', 'entregue'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[
              styles.statusBtn,
              pedido.status === st && styles.statusBtnActive,
            ]}
            onPress={() => handleUpdateStatus(st)}
            disabled={updating}
          >
            <Text
              style={[
                styles.statusBtnText,
                pedido.status === st && styles.statusBtnTextActive,
              ]}
            >
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  headerCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  orderId: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  clientText: { fontSize: 15, color: '#555', marginBottom: 4 },
  statusText: { fontSize: 15, color: '#555', marginBottom: 4 },
  statusHighlight: { fontWeight: 'bold', color: '#E63946' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#E63946', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  itemsCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemName: { fontSize: 14, color: '#333', flex: 1 },
  itemQty: { fontSize: 14, fontWeight: 'bold', color: '#E63946', marginLeft: 12 },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusBtn: {
    width: '48%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBtnActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
  statusBtnText: { fontSize: 14, color: '#333', textTransform: 'capitalize' },
  statusBtnTextActive: { color: '#FFF', fontWeight: 'bold' },
});