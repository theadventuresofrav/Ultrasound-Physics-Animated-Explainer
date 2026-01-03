
import { createClient } from '@supabase/supabase-js';

// Using the credentials provided by the user
const supabaseUrl = 'https://kfwpgqypynklqqbxdnzk.supabase.co';
const supabaseKey = 'sb_publishable_fi4tzp0YPJigpT1a4vCLAQ_mX42WUvu';

export const supabase = createClient(supabaseUrl, supabaseKey);
