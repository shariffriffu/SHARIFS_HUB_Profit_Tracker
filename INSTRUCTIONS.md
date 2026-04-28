# SHARIFS HUB Profit Tracker

A premium mobile application for automated profit tracking and investor return management.

## Tech Stack
- **Frontend**: React Native (TypeScript)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Design**: Black & Gold Theme

## Features
- **Role-based Access**: Admin, Operator, Investor.
- **Automated Calculations**: Server-side profit distribution.
- **Investor Tracking**: Visual progress bar for ROI.
- **Premium UI**: Dark mode with gold accents.

## Setup Instructions

### 1. Firebase Project
- Create a new project in [Firebase Console](https://console.firebase.google.com/).
- Enable **Authentication** (Email/Password).
- Enable **Cloud Firestore**.
- Enable **Cloud Functions**.

### 2. Configuration
- Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) and place them in the respective folders.
- For the setup script, generate a private key for your service account from Project Settings > Service Accounts and save it as `serviceAccountKey.json` in the root.

### 3. Installation
```bash
npm install
cd functions && npm install
```

### 4. Database Initialization
Run the setup script to create initial settings and investor data:
```bash
node setup_db.js
```

### 5. Deployment
Deploy Cloud Functions:
```bash
cd functions
firebase deploy --only functions
```

## Core Calculations
1. `netProfit = totalSales - totalExpenses`
2. `reserveAmount = netProfit * (reservePercentage / 100)`
3. `remainingProfit = netProfit - reserveAmount`
4. **Investor Share**: 
   - If `remainingCapital > 0`: `25%` (capped at remaining capital).
   - Else: `15%`.
5. **Final Distribution**:
   - You: 30%
   - Rahman: 30%
   - Truck Owner: 15%
   - Investor (Ajmal): Taken from Step 4.
