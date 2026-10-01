import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importação das telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Menu Principal de Abas Inferiores
// function MainTabs() {
//   return (
    
//   );
// }

// Navegador Principal (Pilha)
// export default function AppNavigator() {
//   return (
    
      
//         // {/* Telas de Autenticação */}
        
        

//         // {/* Menu das Abas Principais */}
        

//         // {/* Telas que abrem por cima do menu principal */}
        
      
    
//   );
// }