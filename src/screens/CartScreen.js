import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { apiFetch, getImageUrl } from '../services/api';

export default function CartScreen({ navigation }) {
  const [carrinho, setCarrinho] = useState([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [loading, setLoading] = useState(false);

  // Recarrega os dados do carrinho sempre que o ecrã ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarCarrinho();
    }, [])
  );

  async function carregarCarrinho() {
    try {
      const data = await AsyncStorage.getItem('@sabor_digital_carrinho');
      if (data) {
        setCarrinho(JSON.parse(data));
      } else {
        setCarrinho([]);
      }
    } catch (error) {
      console.error('Erro ao carregar o carrinho:', error);
    }
  }

  async function guardarCarrinho(novoCarrinho) {
    setCarrinho(novoCarrinho);
    await AsyncStorage.setItem('@sabor_digital_carrinho', JSON.stringify(novoCarrinho));
  }

  function alterarQuantidade(produto_id, delta) {
    const novoCarrinho = carrinho
      .map((item) => {
        if (item.produto_id === produto_id) {
          const novaQtd = item.quantidade + delta;
          return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
        }
        return item;
      })
      .filter(Boolean);

    guardarCarrinho(novoCarrinho);
  }

  function removerItem(produto_id) {
    const novoCarrinho = carrinho.filter((item) => item.produto_id !== produto_id);
    guardarCarrinho(novoCarrinho);
  }

  async function handleFinalizarPedido() {
    if (carrinho.length === 0) {
      Alert.alert('Carrinho Vazio', 'Adicione pelo menos um produto antes de finalizar.');
      return;
    }

    if (!nomeCliente.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o seu nome para o pedido.');
      return;
    }

    try {
      setLoading(true);

      // A API calcula o valor total; o app envia apenas o cliente e os itens
      const payload = {
        cliente: nomeCliente.trim(),
        itens: carrinho.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      };

      // Consome POST /pedidos
      await apiFetch('/pedidos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Limpa o carrinho local após o sucesso
      await AsyncStorage.removeItem('@sabor_digital_carrinho');
      setCarrinho([]);
      setNomeCliente('');

      Alert.alert('Sucesso', 'Pedido realizado com sucesso!', [
        {
          text: 'Ver Meus Pedidos',
          onPress: () => navigation.navigate('OrdersTab'),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro ao Finalizar',
        error.message || 'Não foi possível enviar o pedido. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  // Cálculo estimativo visual do total para exibição no app
  const totalEstimado = carrinho.reduce(
    (acc, item) => acc + Number(item.preco || 0) * item.quantidade,
    0
  );

  return (
    <View style={styles.container}>
      {carrinho.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>O seu carrinho está vazio.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={carrinho}
            keyExtractor={(item) => String(item.produto_id)}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemPreco}>
                    Unitário: R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                  </Text>
                  <Text style={styles.itemSubtotal}>
                    Subtotal: R$ {(Number(item.preco) * item.quantidade)
                      .toFixed(2)
                      .replace('.', ',')}
                  </Text>
                </View>

                <View style={styles.controls}>
                  <TouchableOpacity
                    style={styles.btnQty}
                    onPress={() => alterarQuantidade(item.produto_id, -1)}
                  >
                    <Text style={styles.btnQtyText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{item.quantidade}</Text>

                  <TouchableOpacity
                    style={styles.btnQty}
                    onPress={() => alterarQuantidade(item.produto_id, 1)}
                  >
                    <Text style={styles.btnQtyText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnRemove}
                    onPress={() => removerItem(item.produto_id)}
                  >
                    <Text style={styles.btnRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            <Text style={styles.labelInput}>Nome para Identificação do Pedido:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: João Silva"
              value={nomeCliente}
              onChangeText={setNomeCliente}
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Estimado:</Text>
              <Text style={styles.totalValue}>
                R$ {totalEstimado.toFixed(2).replace('.', ',')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.btnCheckout}
              onPress={handleFinalizarPedido}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnCheckoutText}>Confirmar e Enviar Pedido</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888' },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemInfo: { flex: 1 },
  itemNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemPreco: { fontSize: 12, color: '#666', marginTop: 2 },
  itemSubtotal: { fontSize: 14, fontWeight: 'bold', color: '#E63946', marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  btnQty: {
    width: 30,
    height: 30,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnQtyText: { fontSize: 16, fontWeight: 'bold' },
  qtyText: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 10 },
  btnRemove: { marginLeft: 12, padding: 6 },
  btnRemoveText: { color: '#D90429', fontSize: 16, fontWeight: 'bold' },
  footer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  labelInput: { fontSize: 14, fontWeight: 'bold', marginBottom: 6, color: '#333' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#E63946' },
  btnCheckout: {
    backgroundColor: '#E63946',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCheckoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});