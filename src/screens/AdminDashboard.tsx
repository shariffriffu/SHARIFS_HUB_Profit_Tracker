import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors, Spacing, Typography } from '../theme';
import { GoldButton } from '../components/GoldButton';

export const AdminDashboard = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = firestore()
      .collection('daily_entries')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const entriesData: any[] = [];
        querySnapshot.forEach(documentSnapshot => {
          entriesData.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setEntries(entriesData);
        setLoading(false);
      });

    return () => subscriber();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await firestore().collection('daily_entries').doc(id).update({
        approved: true,
      });
      Alert.alert('Success', 'Entry approved');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const renderEntry = ({ item }: { item: any }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{item.date}</Text>
        <View style={[styles.statusBadge, item.approved ? styles.statusApproved : styles.statusPending]}>
          <Text style={styles.statusText}>{item.approved ? 'APPROVED' : 'PENDING'}</Text>
        </View>
      </View>

      <View style={styles.entryStats}>
        <View>
          <Text style={styles.entryStatLabel}>Net Profit</Text>
          <Text style={styles.entryStatValue}>₹{item.netProfit?.toFixed(2) || 'Calculating...'}</Text>
        </View>
        {!item.approved && (
          <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.key)}>
            <Text style={styles.approveBtnText}>APPROVE</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {item.distribution && (
        <View style={styles.distributionBox}>
          <Text style={styles.distTitle}>Distribution Preview:</Text>
          <Text style={styles.distItem}>You: ₹{item.distribution.you?.toFixed(2)}</Text>
          <Text style={styles.distItem}>Investor: ₹{item.distribution.ajmal?.toFixed(2)}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Hub</Text>
        <GoldButton title="Logout" onPress={() => auth().signOut()} style={styles.signOutBtn} />
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>ENTRY LOG</Text>
          </View>
        }
      />
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
  list: { padding: Spacing.lg },
  summarySection: { marginBottom: Spacing.md },
  sectionTitle: { ...Typography.caption, color: Colors.textSecondary, letterSpacing: 2 },
  entryCard: { 
    backgroundColor: Colors.surface, 
    padding: Spacing.md, 
    borderRadius: 12, 
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  entryDate: { ...Typography.body, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusApproved: { backgroundColor: Colors.success + '33' },
  statusPending: { backgroundColor: Colors.primary + '33' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: Colors.text },
  entryStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryStatLabel: { ...Typography.caption, color: Colors.textSecondary },
  entryStatValue: { ...Typography.h2, color: Colors.primary, fontSize: 20 },
  approveBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 8 },
  approveBtnText: { color: Colors.background, fontWeight: 'bold', fontSize: 12 },
  distributionBox: { marginTop: Spacing.md, padding: Spacing.sm, backgroundColor: Colors.background, borderRadius: 8 },
  distTitle: { fontSize: 10, color: Colors.textSecondary, marginBottom: 4 },
  distItem: { fontSize: 12, color: Colors.text },
});
