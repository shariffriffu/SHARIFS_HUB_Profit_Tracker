const { createClient } = require('@supabase/supabase-js');

// ─────────────────────────────────────────────────────────────────────────────
// Fill in your Supabase project values:
// URL + Service Role Key → https://supabase.com/dashboard/project/_/settings/api
// ─────────────────────────────────────────────────────────────────────────────
const SUPABASE_URL              = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { email: 'admin@sharifshub.com',    password: 'Admin@123',    role: 'admin',    name: 'Admin' },
  { email: 'operator@sharifshub.com', password: 'Operator@123', role: 'operator', name: 'Operator' },
  { email: 'investor@sharifshub.com', password: 'Investor@123', role: 'investor', name: 'Ajmal' },
];

async function setup() {
  console.log('🚀 Setting up Sharifs Hub Profit Tracker...\n');

  // ─── 1. Create Auth users ────────────────────────────────────────────────
  console.log('👤 Creating Auth users...');
  for (const u of users) {
    // Check if user already exists
    const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
    const existing = existingUsers.find(eu => eu.email === u.email);

    let uid;
    if (existing) {
      uid = existing.id;
      console.log(`  ℹ️  Exists:  ${u.email}  (uid: ${uid})`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email:          u.email,
        password:       u.password,
        email_confirm:  true,
        user_metadata:  { name: u.name },
      });
      if (error) throw error;
      uid = data.user.id;
      console.log(`  ✅ Created: ${u.email}  (uid: ${uid})`);
    }

    // Upsert into public.users
    const { error: upsertErr } = await supabase.from('users').upsert({
      id:    uid,
      email: u.email,
      name:  u.name,
      role:  u.role,
    });
    if (upsertErr) throw upsertErr;
  }

  // ─── 2. Settings ─────────────────────────────────────────────────────────
  console.log('\n⚙️  Writing settings...');
  const { error: settingsErr } = await supabase.from('settings').upsert({
    id:                  'current',
    reserve_percentage:  20,
    profit_distribution: { you: 30, rahman: 30, truckOwner: 15 },
  });
  if (settingsErr) throw settingsErr;
  console.log('  ✅ Settings saved');

  // ─── 3. Investor record ───────────────────────────────────────────────────
  console.log('\n💰 Writing investor record...');
  const { error: investorErr } = await supabase.from('investors').upsert({
    id:                       'ajmal',
    name:                     'Ajmal',
    total_investment:         200000,
    remaining_capital:        200000,
    profit_percentage:        25,
    post_recovery_percentage: 15,
    status:                   'active',
  });
  if (investorErr) throw investorErr;
  console.log('  ✅ Investor record saved');

  // ─── 4. Print summary ────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log('🎉 Setup complete! Use these credentials in the app:\n');
  for (const u of users) {
    console.log(`  [${u.role.toUpperCase()}]`);
    console.log(`    Email:    ${u.email}`);
    console.log(`    Password: ${u.password}\n`);
  }
  console.log('─'.repeat(50));
  process.exit(0);
}

setup().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
