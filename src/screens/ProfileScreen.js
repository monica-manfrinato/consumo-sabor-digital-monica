import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { removeToken } from '../services/storage';

export default function ProfileScreen({ navigation }) {
  async function handleLogout() {
    Alert.alert(
      'Encerrar Sessão',
      'Tem a certeza de que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await removeToken();
            // Substitui o fluxo principal pelo ecrã de Login
            navigation.replace('Login');
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <Text style={styles.username}>Utilizador Sabor Digital</Text>
        <Text style={styles.subtitle}>Sessão Ativa</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, color: '#FFF', fontWeight: 'bold' },
  username: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  section: { marginTop: 20 },
  optionButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  logoutText: { color: '#D90429', fontSize: 16, fontWeight: 'bold' },
});