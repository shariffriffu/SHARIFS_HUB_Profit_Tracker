import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors, Spacing, Typography } from '../theme';
import { Input } from '../components/Input';
import { GoldButton } from '../components/GoldButton';

export const OperatorScreen = () => {
  const [sales, setSales] = useState({ iceCream: '', shakes: '', other: '' });
  const [expenses, setExpenses] = useState({ rawMaterials: '', fuel: '', iceElectric: '', misc: '' });
  const [loading, setLoading] = useState(false);

  const calculateNetProfit = () => {
    const totalSales = Object.values(sales).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    const totalExpenses = Object.values(expenses).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    return totalSales - totalExpenses;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const totalSales = Object.values(sales).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      const totalExpenses = Object.values(expenses).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      
      await firestore().collection('daily_entries').add({
        date: new Date().toISOString().split('T')[0],
        sales: {
          iceCream: parseFloat(sales.iceCream) || 0,
          shakes: parseFloat(sales.shakes) || 0,
          other: parseFloat(sales.other) || 0,
        },
        expenses: {
          rawMaterials: parseFloat(expenses.rawMaterials) || 0,
          fuel: parseFloat(expenses.fuel) || 0,
          iceElectric: parseFloat(expenses.iceElectric) || 0,
          misc: parseFloat(expenses.misc) || 0,
        },
        totalSales,
        totalExpenses,
        netProfit: totalSales - totalExpenses,
        createdBy: auth().currentUser?.uid,
        approved: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Entry submitted for approval');
      setSales({ iceCream: '', shakes: '', other: '' });
      setExpenses({ rawMaterials: '', fuel: '', iceElectric: '', misc: '' });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Entry</Text>
        <GoldButton title="Sign Out" onPress={() => auth().signOut()} style={styles.signOutBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SALES</Text>
          <Input label="ICE CREAM" value={sales.iceCream} onChangeText={(val) => setSales({...sales, iceCream: val})} keyboardType="numeric" />
          <Input label="SHAKES" value={sales.shakes} onChangeText={(val) => setSales({...sales, shakes: val})} keyboardType="numeric" />
          <Input label="OTHER" value={sales.other} onChangeText={(val) => setSales({...sales, other: val})} keyboardType="numeric" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPENSES</Text>
          <Input label="RAW MATERIALS" value={expenses.rawMaterials} onChangeText={(val) => setExpenses({...expenses, rawMaterials: val})} keyboardType="numeric" />
          <Input label="FUEL" value={expenses.fuel} onChangeText={(val) => setExpenses({...expenses, fuel: val})} keyboardType="numeric" />
          <Input label="ICE & ELECTRIC" value={expenses.iceElectric} onChangeText={(val) => setExpenses({...expenses, iceElectric: val})} keyboardType="numeric" />
          <Input label="MISC" value={expenses.misc} onChangeText={(val) => setExpenses({...expenses, misc: val})} keyboardType="numeric" />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Estimated Net Profit</Text>
          <Text style={styles.summaryValue}>₹{calculateNetProfit().toFixed(2)}</Text>
        </View>

        <GoldButton title="Submit Entry" onPress={handleSubmit} loading={loading} style={styles.submitBtn} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerTitle: { ...Typography.h2, color: Colors.primary },
  signOutBtn: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  scroll: { padding: Spacing.lg },
  section: { 
    backgroundColor: Colors.surface, 
    padding: Spacing.md, 
    borderRadius: 12, 
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md, letterSpacing: 2 },
  summary: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  summaryLabel: { ...Typography.body, color: Colors.textSecondary },
  summaryValue: { ...Typography.h2, color: Colors.primary },
  submitBtn: { marginBottom: Spacing.xl },
});
