import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/services/supabase';
import { LoginScreen } from './src/screens/LoginScreen';
import { AdminDashboard } from './src/screens/AdminDashboard';
import { OperatorScreen } from './src/screens/OperatorScreen';
import { InvestorDashboard } from './src/screens/InvestorDashboard';
import { Colors } from './src/theme';

const Stack = createStackNavigator();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) setInitializing(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setRole(null);
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch role whenever session changes
  useEffect(() => {
    if (session?.user) {
      supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          setRole(data?.role ?? null);
          setInitializing(false);
        });
    }
  }, [session]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: Colors.background } }}>
        {!session ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {role === 'admin'    && <Stack.Screen name="AdminDashboard"    component={AdminDashboard} />}
            {role === 'operator' && <Stack.Screen name="OperatorScreen"    component={OperatorScreen} />}
            {role === 'investor' && <Stack.Screen name="InvestorDashboard" component={InvestorDashboard} />}
            {!role               && <Stack.Screen name="Login"             component={LoginScreen} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
