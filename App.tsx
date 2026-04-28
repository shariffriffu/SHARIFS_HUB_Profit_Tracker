import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { StatusBar } from 'react-native';

import { LoginScreen } from './src/screens/LoginScreen';
import { AdminDashboard } from './src/screens/AdminDashboard';
import { OperatorScreen } from './src/screens/OperatorScreen';
import { InvestorDashboard } from './src/screens/InvestorDashboard';
import { Colors } from './src/theme';

const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (user) {
      const fetchRole = async () => {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists()) {
          setRole(userDoc.data()?.role);
        }
      };
      fetchRole();
    } else {
      setRole(null);
    }
  }, [user]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: Colors.background } }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {role === 'admin' && <Stack.Screen name="AdminDashboard" component={AdminDashboard} />}
            {role === 'operator' && <Stack.Screen name="OperatorScreen" component={OperatorScreen} />}
            {role === 'investor' && <Stack.Screen name="InvestorDashboard" component={InvestorDashboard} />}
            {!role && <Stack.Screen name="Login" component={LoginScreen} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
