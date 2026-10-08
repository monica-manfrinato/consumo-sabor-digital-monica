import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { apiFetch } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState('cliente'); // 'cliente' ou 'admin'
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);

      // Consome a rota POST /auth/registrar do backend
      await apiFetch('/auth/registrar', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          email,
          senha,
          papel,
        }),
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro no Cadastro',
        error.message || 'Não foi possível realizar o cadastro. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {/* Seleção do Papel (Cliente / Admin) */}
      <Text style={styles.label}>Tipo de Utilizador:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, papel === 'cliente' && styles.roleButtonActive]}
          onPress={() => setPapel('cliente')}
        >
          <Text style={[styles.roleText, papel === 'cliente' && styles.roleTextActive]}>
            Cliente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, papel === 'admin' && styles.roleButtonActive]}
          onPress={() => setPapel('admin')}
        >
          <Text style={[styles.roleText, papel === 'admin' && styles.roleTextActive]}>
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { height: 50, borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingHorizontal: 16, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  roleContainer: { flexDirection: 'row', marginBottom: 24 },
  roleButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#CCC', alignItems: 'center', borderRadius: 8, marginRight: 8 },
  roleButtonActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
  roleText: { color: '#333' },
  roleTextActive: { color: '#FFF', fontWeight: 'bold' },
  button: { height: 50, backgroundColor: '#E63946', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});