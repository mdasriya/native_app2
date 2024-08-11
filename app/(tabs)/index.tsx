import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import LoginForm from './login';
import DisplayDataPage from './DisplayDataPage';
export default function App() {
  const Stack = createStackNavigator();
  return (
  
    <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginForm} />
    <Stack.Screen name="DisplayDataPage" component={DisplayDataPage} />
  </Stack.Navigator>
    
  );
}
