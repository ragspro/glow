// Test Supabase Connection and Setup
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabaseUrl = 'https://xmponioxmzfftfrowcrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcG9uaW94bXpmZnRmcm93Y3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTg1NTQsImV4cCI6MjA3MzU5NDU1NH0.sFIGvTn6q69Z8D2lSW-f0SYRmE2AgLB2Y1ZVm2g0dj4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSetup() {
    console.log('🧪 Testing Glow Prompt Hub Setup...\n');
    
    try {
        // Test 1: Check Supabase connection
        console.log('1️⃣ Testing Supabase connection...');
        const { data, error } = await supabase.from('prompts').select('count');
        if (error) throw error;
        console.log('✅ Supabase connected successfully\n');
        
        // Test 2: Check prompts table
        console.log('2️⃣ Testing prompts table...');
        const { data: prompts, error: promptError } = await supabase
            .from('prompts')
            .select('*')
            .limit(3);
        
        if (promptError) throw promptError;
        console.log(`✅ Found ${prompts.length} prompts in database`);
        console.log('Sample prompts:');
        prompts.forEach(p => console.log(`   - ${p.title}`));
        console.log('');
        
        // Test 3: Check free vs premium prompts
        console.log('3️⃣ Testing free/premium prompt logic...');
        const { data: freePrompts } = await supabase
            .from('prompts')
            .select('*')
            .eq('is_premium', false)
            .limit(3);
            
        const { data: premiumPrompts } = await supabase
            .from('prompts')
            .select('*')
            .eq('is_premium', true);
            
        console.log(`✅ Free prompts: ${freePrompts.length}`);
        console.log(`✅ Premium prompts: ${premiumPrompts.length}\n`);
        
        // Test 4: Check authentication setup
        console.log('4️⃣ Testing authentication setup...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log(`✅ Auth system ready (Current session: ${session ? 'Active' : 'None'})\n`);
        
        console.log('🎉 All tests passed! Your Prompt Hub is ready to launch!\n');
        console.log('📋 Next steps:');
        console.log('   1. Test Google login on your website');
        console.log('   2. Apply for Google AdSense');
        console.log('   3. Replace AdSense placeholder IDs');
        console.log('   4. Deploy and start getting traffic! 🚀');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure you ran the SQL schema in Supabase');
        console.log('   2. Check your Supabase URL and keys');
        console.log('   3. Verify Google OAuth is enabled in Supabase');
    }
}

// Run tests
testSetup();