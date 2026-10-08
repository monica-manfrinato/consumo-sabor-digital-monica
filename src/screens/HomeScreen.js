import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { apiFetch, getImageUrl } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Busca os produtos na API
  const loadProdutos = useCallback(async () => {
    try {
      // Consome GET /produtos
      const response = await apiFetch('/produtos');

      // A API do professor retorna no formato { sucesso, dados }
      if (response && response.sucesso && Array.isArray(response.dados)) {
        setProdutos(response.dados);
      } else if (Array.isArray(response)) {
        // Fallback caso a API retorne a lista direta
        setProdutos(response);
      } else {
        setProdutos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  // Função para recarregar ao puxar a lista para baixo
  const onRefresh = () => {
    setRefreshing(true);
    loadProdutos();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={styles.loadingText}>Carregando cardápio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E63946']} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Nenhum produto disponível no momento.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductDetail', { produtoId: item.id })}
          >
            {/* Renderização da Imagem usando a helper getImageUrl */}
            {item.imagem ? (
              <Image
                source={{ uri: getImageUrl(item.imagem) }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>Sem Foto</Text>
              </View>
            )}

            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.nome}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.descricao || 'Sem descrição.'}
              </Text>
              <Text style={styles.price}>
                R$ {Number(item.preco || 0).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#666' },
  emptyText: { color: '#888', fontSize: 16, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: { width: 100, height: 100 },
  placeholderImage: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#777', fontSize: 12 },
  cardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  description: { fontSize: 12, color: '#666', marginTop: 2 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#E63946', marginTop: 6 },
});