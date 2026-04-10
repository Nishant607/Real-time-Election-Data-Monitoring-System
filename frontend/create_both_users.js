// create_both_users.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lisryqeqsdhpwdhbtibw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpc3J5cWVxc2RocHdkaGJ0aWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjQzOTQsImV4cCI6MjA5MTE0MDM5NH0.qY45_Oj6uxH8674LWJZYivRBS-ThJXBffQ2LyvvKjuQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
    console.log("Signing up user...");
    const user1 = await supabase.auth.signUp({
        email: 'testuser2004@yahoo.com',
        password: 'nishant@2004',
        options: {
            data: {
                username: 'user',
                role: 'User'
            }
        }
    });

    if (user1.error) {
        console.error("Error signing up user:", user1.error.message);
    } else {
        console.log("User signed up successfully. User ID:", user1.data.user?.id);
    }
}
main();
