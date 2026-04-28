import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors, Spacing, Typography } from '../theme';
import { GoldButton } from '../components/GoldButton';

const { width } = Dimensions.get('window');

export const InvestorDashboard = () => {
  const [investorData, setInvestorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd find the investor linked to this user
    // For now, we fetch the 'active' investor (Ajmal)
    const subscriber = firestore()
      .collection('investors')
      .where('status', '==', 'active')
      .limit(1)
      .onSnapshot(querySnapshot => {
        if (!querySnapshot.empty) {
          setInvestorData(querySnapshot.docs[0].data());
        }
        setLoading(false);
      });

    return () => subscriber();
  }, []);

  if (loading) return null;

  const amountReturned = investorData ? (investorData.totalInvestment - investorData.remainingCapital) : 0;
  const progress = investorData ? (amountReturned / investorData.totalInvestment) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investor Portal</Text>
        <GoldButton title="Logout" onPress={() => auth().signOut()} style={styles.signOutBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Hello, {investorData?.name || 'Investor'}</Text>
          <Text style={styles.subWelcomeText}>Track your investment performance</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Investment</Text>
            <Text style={styles.statValue}>₹{investorData?.totalInvestment.toLocaleString()}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Remaining Capital</Text>
            <Text style={styles.statValue}>₹{investorData?.remainingCapital.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Return Progress</Text>
            <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.amountReturnedText}>₹{amountReturned.toLocaleString()} returned to date</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Investment Terms</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Profit Share (Until ROI)</Text>
            <Text style={styles.infoValue}>{investorData?.profitPercentage}%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Post Recovery Share</Text>
            <Text style={styles.infoValue}>{investorData?.postRecoveryPercentage}%</Text>
          </View>
        </View>
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
  welcomeCard: { marginBottom: Spacing.xl },
  welcomeText: { ...Typography.h1, color: Colors.text },
  subWelcomeText: { ...Typography.body, color: Colors.textSecondary },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  statCard: { 
    backgroundColor: Colors.surface, 
    padding: Spacing.md, 
    borderRadius: 12, 
    width: (width - Spacing.lg * 3) / 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xs },
  statValue: { ...Typography.h2, color: Colors.primary, fontSize: 18 },
  progressCard: { 
    backgroundColor: Colors.surface, 
    padding: Spacing.lg, 
    borderRadius: 12, 
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressLabel: { ...Typography.body, fontWeight: 'bold' },
  progressPercent: { ...Typography.body, color: Colors.primary, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: Colors.background, borderRadius: 5, overflow: 'hidden', marginBottom: Spacing.sm },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary },
  amountReturnedText: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
  infoCard: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  infoTitle: { ...Typography.body, fontWeight: 'bold', marginBottom: Spacing.md, color: Colors.primary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  infoLabel: { ...Typography.caption, color: Colors.textSecondary },
  infoValue: { ...Typography.body, fontWeight: 'bold' },
});
