import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importação das telas mantendo o nome exato dos seus arquivos
import LoginScreen from '../screens/LoginScreen';
import RegistrerScreen from '../screens/RegistrerScreen';
import HomeScreen from '../screens/HomeScreen';
import CardapioScreen from '../screens/CardapioScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProdutoDetailScreen from '../screens/ProdutoDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import AdminProductsScreen from '../screens/AdminProductsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Menu Inferior (Bottom Tabs)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Produtos' }}
      />
      <Tab.Screen
        name="CardapioTab"
        component={CardapioScreen}
        options={{ title: 'Cardápios' }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ title: 'Carrinho' }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ title: 'Pedidos' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Navegação Principal (Stack)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Telas de Autenticação */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegistrerScreen}
          options={{ title: 'Cadastro' }}
        />

        {/* Abas Principais */}
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Telas Secundárias / Detalhes */}
        <Stack.Screen
          name="ProductDetail"
          component={ProdutoDetailScreen}
          options={{ title: 'Detalhes do Produto' }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Finalizar Pedido' }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ title: 'Detalhes do Pedido' }}
        />
        <Stack.Screen
          name="AdminProducts"
          component={AdminProductsScreen}
          options={{ title: 'Painel Admin - Produtos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}