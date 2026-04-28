import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, Typography } from '../theme';
import { Input } from '../components/Input';
import { GoldButton } from '../components/GoldButton';

export const OperatorScreen = () => {
  const [sales,    setSales]    = useState({ iceCream: '', shakes: '', other: '' });
  const [expenses, setExpenses] = useState({ rawMaterials: '', fuel: '', iceElectric: '', misc: '' });
  const [loading,  setLoading]  = useState(false);

  const n = (v: string) => parseFloat(v) || 0;

  const calculateNetProfit = () => {
    const totalSales    = n(sales.iceCream) + n(sales.shakes) + n(sales.other);
    const totalExpenses = n(expenses.rawMaterials) + n(expenses.fuel) + n(expenses.iceElectric) + n(expenses.misc);
    return totalSales - totalExpenses;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const totalSales    = n(sales.iceCream) + n(sales.shakes) + n(sales.other);
      const totalExpenses = n(expenses.rawMaterials) + n(expenses.fuel) + n(expenses.iceElectric) + n(expenses.misc);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('daily_entries').insert({
        date:           new Date().toISOString().split('T')[0],
        sales:          { ice_cream: n(sales.iceCream), shakes: n(sales.shakes), other: n(sales.other) },
        expenses:       { raw_materials: n(expenses.rawMaterials), fuel: n(expenses.fuel), ice_electric: n(expenses.iceElectric), misc: n(expenses.misc) },
        total_sales:    totalSales,
        total_expenses: totalExpenses,
        net_profit:     totalSales - totalExpenses,
        created_by:     user?.id,
        approved:       false,
      });

      if (error) throw error;
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
        <GoldButton title="Sign Out" onPress={() => supabase.auth.signOut()} style={styles.signOutBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SALES</Text>
          <Input label="ICE CREAM"   value={sales.iceCream}        onChangeText={v => setSales({...sales, iceCream: v})}        keyboardType="numeric" />
          <Input label="SHAKES"      value={sales.shakes}           onChangeText={v => setSales({...sales, shakes: v})}           keyboardType="numeric" />
          <Input label="OTHER"       value={sales.other}            onChangeText={v => setSales({...sales, other: v})}            keyboardType="numeric" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPENSES</Text>
          <Input label="RAW MATERIALS" value={expenses.rawMaterials}  onChangeText={v => setExpenses({...expenses, rawMaterials: v})}  keyboardType="numeric" />
          <Input label="FUEL"          value={expenses.fuel}          onChangeText={v => setExpenses({...expenses, fuel: v})}          keyboardType="numeric" />
          <Input label="ICE & ELECTRIC" value={expenses.iceElectric}  onChangeText={v => setExpenses({...expenses, iceElectric: v})}  keyboardType="numeric" />
          <Input label="MISC"          value={expenses.misc}          onChangeText={v => setExpenses({...expenses, misc: v})}          keyboardType="numeric" />
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
  container:    { flex: 1, backgroundColor: Colors.background },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: Platform.OS === 'ios' ? 60 : Spacing.lg, backgroundColor: Colors.surface },
  headerTitle:  { ...Typography.h2, color: Colors.primary },
  signOutBtn:   { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  scroll:       { padding: Spacing.lg },
  section:      { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: 12, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md, letterSpacing: 2 },
  summary:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: 12, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.primary },
  summaryLabel: { ...Typography.body, color: Colors.textSecondary },
  summaryValue: { ...Typography.h2, color: Colors.primary },
  submitBtn:    { marginBottom: Spacing.xl },
});
