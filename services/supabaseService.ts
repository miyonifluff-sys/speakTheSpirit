import { createClient } from '@supabase/supabase-js';
import { addLog as emitGameLog } from '../utils/gameEvents';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PlayerProfile {
  wallet: string;
  cupcakes: number;
  cucumbers: number;
  tickets: number;
  clearedIslands: string[];
}

export interface ProfileUpdate {
  cupcakes?: number;
  cucumbers?: number;
  tickets?: number;
  clearedIslands?: string[];
}

export const supabaseService = {
  async fetchProfile(wallet: string): Promise<PlayerProfile | null> {
    try {
      emitGameLog("Fetching player profile from Supabase...", "system");
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet', wallet)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile from Supabase:", error);
        emitGameLog(`Database error: ${error.message}.`, "system");
        throw error;
      }

      if (data) {
        emitGameLog(`Profile loaded successfully. Cleared islands: ${data.clearedIslands?.length > 0 ? data.clearedIslands.join(', ') : 'None'}.`, "system");
        return data as PlayerProfile;
      }

      // Create new profile row in Supabase if not found
      emitGameLog("Creating new player profile on Supabase...", "system");
      const newProfile: PlayerProfile = {
        wallet: wallet,
        cupcakes: 5,
        cucumbers: 5,
        tickets: 1,
        clearedIslands: [],
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile]);

      if (insertError) {
        console.error("Error creating profile in Supabase:", insertError);
        emitGameLog(`Database error: ${insertError.message}.`, "system");
        throw insertError;
      }

      emitGameLog("New profile created and initialized.", "system");
      return newProfile;
    } catch (err: unknown) {
      console.error("Supabase profile fetch exception:", err);
      emitGameLog("Database exception occurred.", "system");
      throw err;
    }
  },

  async saveProfile(wallet: string, updatedFields: ProfileUpdate): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedFields)
        .eq('wallet', wallet);

      if (error) {
        console.error("Error updating profile in Supabase:", error);
        emitGameLog(`Failed to sync with Supabase: ${error.message}`, "system");
        throw error;
      }
    } catch (err: unknown) {
      console.error("Supabase profile update exception:", err);
      throw err;
    }
  },
};
