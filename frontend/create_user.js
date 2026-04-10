// create_user.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lisryqeqsdhpwdhbtibw.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpc3J5cWVxc2RocHdkaGJ0aWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjQzOTQsImV4cCI6MjA5MTE0MDM5NH0.qY45_Oj6uxH8674LWJZYivRBS-ThJXBffQ2LyvvKjuQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
    console.log("Signing up user...");
    const { data, error } = await supabase.auth.signUp({
        email: 'testadmin2004@yahoo.com',
        password: 'nishant@2004',
        options: {
            data: {
                username: 'admin'
            }
        }
    });

    if (error) {
        console.error("Error signing up:", error.message);
    } else {
        console.log("User signed up successfully. User ID:", data.user?.id);
    }
}
main();
