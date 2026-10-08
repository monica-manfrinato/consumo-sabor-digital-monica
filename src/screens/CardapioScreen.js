import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiFetch } from '../services/api';

export default function CardapiosScreen({ navigation }) {
  const [cardapios, setCardapios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCardapios = useCallback(async () => {
    try {
      const response = await apiFetch('/cardapios');

      if (response && response.sucesso && Array.isArray(response.dados)) {
        setCardapios(response.dados);
      } else if (Array.isArray(response)) {
        setCardapios(response);
      } else {
        setCardapios([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cardápios:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCardapios();
    }, [fetchCardapios])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCardapios();
  };

  // Ação ao clicar no produto do cardápio
  const handleSelectProduct = (prod) => {
    console.log('Produto clicado:', prod);

    if (typeof prod === 'object' && prod !== null) {
      navigation.navigate('ProductDetail', { product: prod });
    } else {
      navigation.navigate('ProductDetail', { productId: prod });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={styles.loadingText}>A carregar cardápios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cardapios}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E63946']} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Nenhum cardápio disponível.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{item.nome}</Text>
              {item.disponivel !== undefined && (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: item.disponivel ? '#2A9D8F' : '#E63946' },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.disponivel ? 'Disponível' : 'Indisponível'}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.description}>
              {item.descricao || 'Sem descrição cadastrada.'}
            </Text>

            {Array.isArray(item.produtos) && item.produtos.length > 0 && (
              <View style={styles.productsContainer}>
                <Text style={styles.productsTitle}>Produtos incluídos (toque para ver detalhes):</Text>
                {item.produtos.map((prod, index) => (
                  <TouchableOpacity
                    key={prod.id || index}
                    activeOpacity={0.6}
                    onPress={() => handleSelectProduct(prod)}
                    style={styles.productTouchable}
                  >
                    <Text style={styles.productItem}>
                      • {typeof prod === 'object' ? prod.nome : `Produto #${prod}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  description: { fontSize: 14, color: '#666', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  productsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  productsTitle: { fontSize: 13, fontWeight: 'bold', color: '#444', marginBottom: 6 },
  productTouchable: { paddingVertical: 4 },
  productItem: { fontSize: 14, color: '#E63946', fontWeight: '500', marginLeft: 4 },
});