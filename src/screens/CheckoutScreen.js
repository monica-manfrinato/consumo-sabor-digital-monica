import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const [carrinho, setCarrinho] = useState([]);
  const [cliente, setCliente] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarCarrinho() {
      try {
        const data = await AsyncStorage.getItem('@sabor_digital_carrinho');
        if (data) {
          setCarrinho(JSON.parse(data));
        }
      } catch (error) {
        console.error('Erro ao carregar os itens para o checkout:', error);
      }
    }

    carregarCarrinho();
  }, []);

  const totalCalculado = carrinho.reduce(
    (acc, item) => acc + Number(item.preco || 0) * item.quantidade,
    0
  );

  async function handleConfirmarPedido() {
    if (!cliente.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe o seu nome para identificar o pedido.');
      return;
    }

    if (carrinho.length === 0) {
      Alert.alert('Carrinho Vazio', 'Não existem itens para processar no checkout.');
      return;
    }

    try {
      setLoading(true);

      // Formatação exata exigida pela API: POST /pedidos
      const payload = {
        cliente: cliente.trim(),
        itens: carrinho.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      };

      await apiFetch('/pedidos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Limpa o carrinho local após a emissão do pedido
      await AsyncStorage.removeItem('@sabor_digital_carrinho');

      Alert.alert(
        'Pedido Confirmado!',
        'O seu pedido foi enviado para a cozinha com sucesso.',
        [
          {
            text: 'Acompanhar Pedido',
            onPress: () => navigation.navigate('Main', { screen: 'OrdersTab' }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro na Finalização',
        error.message || 'Não foi possível concluir o pedido. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumo do Pedido</Text>

      {/* Lista de Itens */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Itens Escolhidos</Text>
        {carrinho.map((item) => (
          <View key={item.produto_id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.nome}</Text>
              <Text style={styles.itemSubtext}>
                {item.quantidade}x R$ {Number(item.preco).toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              R$ {(Number(item.preco) * item.quantidade).toFixed(2).replace('.', ',')}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Geral:</Text>
          <Text style={styles.totalValue}>
            R$ {totalCalculado.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>

      {/* Dados do Cliente */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Identificação para Entrega/Retirada</Text>
        <Text style={styles.label}>Nome do Cliente *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Maria Oliveira"
          value={cliente}
          onChangeText={setCliente}
        />
      </View>

      {/* Botão de Envio */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleConfirmarPedido}
        disabled={loading || carrinho.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Enviar Pedido para a Cozinha</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F8F9FA' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  itemSubtext: { fontSize: 12, color: '#666', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#E63946' },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#E63946',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});