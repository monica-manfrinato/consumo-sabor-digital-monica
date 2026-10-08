import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../services/api';

export default function AdminProductsScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [disponivel, setDisponivel] = useState(true);
  const [imagemUri, setImagemUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Seleção de imagem da galeria do dispositivo
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagemUri(result.assets[0].uri);
    }
  }

  async function handleCadastrarProduto() {
    if (!nome || !preco || !categoria) {
      Alert.alert('Atenção', 'Por favor, preencha o nome, preço e categoria do produto.');
      return;
    }

    try {
      setLoading(true);

      // Monta o formulário multipart/form-data exigido pela API
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append('preco', preco.replace(',', '.'));
      formData.append('categoria', categoria);
      formData.append('disponivel', disponivel ? 'true' : 'false');

      if (imagemUri) {
        const filename = imagemUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('imagem', {
          uri: imagemUri,
          name: filename || 'produto.jpg',
          type,
        });
      }

      // Consome POST /produtos (apiFetch remove o Content-Type para o browser definir o boundary)
      await apiFetch('/produtos', {
        method: 'POST',
        body: formData,
      });

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            // Limpa o formulário e volta para a tela inicial
            setNome('');
            setDescricao('');
            setPreco('');
            setCategoria('');
            setImagemUri(null);
            navigation.navigate('Main', { screen: 'HomeTab' });
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro ao cadastrar',
        error.message || 'Verifique se a sua conta tem privilégios de admin.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Novo Produto</Text>

      <Text style={styles.label}>Nome do Produto *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Hambúrguer Artesanal"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descrição dos ingredientes ou prato"
        multiline
        numberOfLines={3}
        value={descricao}
        onChangeText={setDescricao}
      />

      <Text style={styles.label}>Preço (R$) *</Text>
      <TextInput
        style={styles.input}
        placeholder="0,00"
        keyboardType="numeric"
        value={preco}
        onChangeText={setPreco}
      />

      <Text style={styles.label}>Categoria *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Lanches, Bebidas, Sobremesas"
        value={categoria}
        onChangeText={setCategoria}
      />

      {/* Switch de Disponibilidade */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Produto Disponível?</Text>
        <Switch
          value={disponivel}
          onValueChange={setDisponivel}
          trackColor={{ false: '#767577', true: '#E63946' }}
        />
      </View>

      {/* Upload de Imagem */}
      <Text style={styles.label}>Imagem do Produto</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imagemUri ? (
          <Image source={{ uri: imagemUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>📷 Clique para selecionar uma foto</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCadastrarProduto}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar Produto</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6, color: '#444' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    height: 150,
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  imagePickerText: { color: '#666', fontSize: 14 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  button: {
    backgroundColor: '#E63946',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});