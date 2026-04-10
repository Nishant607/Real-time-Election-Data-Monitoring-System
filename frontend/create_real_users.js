import { createClient } from '@supabase/supabase-js';

// Setup Supabase
const supabaseUrl = 'https://lisryqeqsdhpwdhbtibw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpc3J5cWVxc2RocHdkaGJ0aWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjQzOTQsImV4cCI6MjA5MTE0MDM5NH0.qY45_Oj6uxH8674LWJZYivRBS-ThJXBffQ2LyvvKjuQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAccount(username, password, role) {
    const email = `${username.toLowerCase()}@election.local`;
    console.log(`Creating ${role} account for ${username} (${email})...`);
    
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: username,
                role: role // 'Admin' or 'User'
            }
        }
    });

    if (error) {
        console.error(`❌ Error creating ${username}:`, error.message);
    } else {
        console.log(`✅ Success! User ID for ${username}: ${data.user?.id}`);
    }
}

async function main() {
    console.log("--- CREATING REAL SUPABASE ACCOUNTS ---");
    
    // Creating Admins
    await createAccount('nishant', 'nishant@2004', 'Admin');
    await createAccount('tannu', 'tannu@2004', 'Admin');
    
    // Creating Standard User
    await createAccount('mannu', 'mannu@2004', 'User');
    
    // Let's also restore the 'admin' / 'user' generics just in case
    await createAccount('admin', 'password', 'Admin');
    await createAccount('user', 'password', 'User');
    
    console.log("--- DONE ---");
}

main();
