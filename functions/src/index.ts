import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

export const calculateProfitDistribution = functions.firestore
  .document('daily_entries/{entryId}')
  .onCreate(async (snapshot: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const data = snapshot.data();
    if (!data) return;

    try {
      // 1. Fetch Settings
      const settingsDoc = await db.collection('settings').doc('current').get();
      const settings = settingsDoc.data() || {
        reservePercentage: 20,
        profitDistribution: {
          you: 30,
          rahman: 30,
          truckOwner: 15
        }
      };

      // 2. Fetch Active Investor (Assuming one active investor for now)
      const investorQuery = await db.collection('investors')
        .where('status', '==', 'active')
        .limit(1)
        .get();
      
      if (investorQuery.empty) {
        console.error('No active investor found');
        return;
      }
      
      const investorDoc = investorQuery.docs[0];
      const investorData = investorDoc.data();
      const investorId = investorDoc.id;

      // 3. Core Calculations
      const totalSales = (data.sales.iceCream || 0) + (data.sales.shakes || 0) + (data.sales.other || 0);
      const totalExpenses = (data.expenses.rawMaterials || 0) + (data.expenses.fuel || 0) + (data.expenses.iceElectric || 0) + (data.expenses.misc || 0);
      const netProfit = totalSales - totalExpenses;
      const reserveAmount = netProfit * (settings.reservePercentage / 100);
      const remainingProfit = netProfit - reserveAmount;

      // 4. Investor Return Logic
      let investorShare = 0;
      let newRemainingCapital = investorData.remainingCapital;

      if (investorData.remainingCapital > 0) {
        investorShare = remainingProfit * (investorData.profitPercentage / 100);
        if (investorShare > investorData.remainingCapital) {
          investorShare = investorData.remainingCapital;
        }
        newRemainingCapital = investorData.remainingCapital - investorShare;
      } else {
        investorShare = remainingProfit * (investorData.postRecoveryPercentage / 100);
      }

      // 5. Final Distribution
      const remainingAfterInvestor = remainingProfit - investorShare;
      const distribution = {
        you: remainingAfterInvestor * (settings.profitDistribution.you / 100),
        rahman: remainingAfterInvestor * (settings.profitDistribution.rahman / 100),
        ajmal: investorShare, // Investor's share
        truckOwner: remainingAfterInvestor * (settings.profitDistribution.truckOwner / 100)
      };

      // 6. Update entry and investor record
      const updateEntry = db.collection('daily_entries').doc(context.params.entryId).update({
        totalSales,
        totalExpenses,
        netProfit,
        reserveAmount,
        remainingProfit,
        investorShare,
        investorRemainingCapital: newRemainingCapital,
        distribution,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const updateInvestor = db.collection('investors').doc(investorId).update({
        remainingCapital: newRemainingCapital,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await Promise.all([updateEntry, updateInvestor]);
      console.log(`Calculation completed for entry ${context.params.entryId}`);

    } catch (error) {
      console.error('Error in calculation function:', error);
    }
  });
