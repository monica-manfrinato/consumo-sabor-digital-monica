import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch, getImageUrl } from '../services/api';

export default function ProductDetailScreen({ route, navigation }) {
  const { produtoId } = route.params || {};

  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduto() {
      try {
        // Consome GET /produtos/:id
        const response = await apiFetch(`/produtos/${produtoId}`);

        if (response && response.sucesso && response.dados) {
          setProduto(response.dados);
        } else if (response && response.id) {
          setProduto(response);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do produto.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    if (produtoId) {
      loadProduto();
    }
  }, [produtoId, navigation]);

  function alterarQuantidade(delta) {
    setQuantidade((prev) => Math.max(1, prev + delta));
  }

  async function handleAdicionarCarrinho() {
    if (!produto) return;

    try {
      // Recupera o carrinho atual do storage
      const cartData = await AsyncStorage.getItem('@sabor_digital_carrinho');
      let carrinho = cartData ? JSON.parse(cartData) : [];

      // Verifica se o item já existe no carrinho
      const index = carrinho.findIndex((item) => item.produto_id === produto.id);

      if (index >= 0) {
        carrinho[index].quantidade += quantidade;
      } else {
        carrinho.push({
          produto_id: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco),
          imagem: produto.imagem,
          quantidade: quantidade,
        });
      }

      // Salva o carrinho atualizado no AsyncStorage
      await AsyncStorage.setItem('@sabor_digital_carrinho', JSON.stringify(carrinho));

      Alert.alert('Sucesso', 'Produto adicionado ao carrinho!', [
        { text: 'Continuar a Comprar', style: 'cancel' },
        {
          text: 'Ir para o Carrinho',
          onPress: () => navigation.navigate('Main', { screen: 'CartTab' }),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar ao carrinho.');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (!produto) {
    return (
      <View style={styles.center}>
        <Text>Produto não encontrado.</Text>
      </View>
    );
  }

  const precoTotal = (Number(produto.preco || 0) * quantidade).toFixed(2).replace('.', ',');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {produto.imagem ? (
        <Image
          source={{ uri: getImageUrl(produto.imagem) }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>Sem Foto</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{produto.nome}</Text>
        <Text style={styles.price}>
          R$ {Number(produto.preco || 0).toFixed(2).replace('.', ',')}
        </Text>
        <Text style={styles.description}>
          {produto.descricao || 'Sem descrição informada.'}
        </Text>

        {/* Seleção de Quantidade */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantidade:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity style={styles.qtyButton} onPress={() => alterarQuantidade(-1)}>
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantidade}</Text>
            <TouchableOpacity style={styles.qtyButton} onPress={() => alterarQuantidade(1)}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Adicionar ao Carrinho */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdicionarCarrinho}>
          <Text style={styles.addButtonText}>
            Adicionar ao Carrinho • R$ {precoTotal}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  placeholder: { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#777' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#E63946', marginVertical: 8 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 24 },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  quantityLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  qtyText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 16 },
  addButton: {
    backgroundColor: '#E63946',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});