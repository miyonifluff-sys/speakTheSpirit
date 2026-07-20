'use server'; // 👈 1. Keep this here!

import { supabase } from '@/services/supabaseService'; 

export async function fetchVerseFromYouVersion(
  userId: string,
  passageId: string 
): Promise<string | null> {
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('bible_version_id')
    .eq('id', userId)
    .single();

  if (error || !profile?.bible_version_id) {
    console.error("❌ Could not find bible_version_id for user:", error?.message);
    return null;
  }

  const bibleVersionId = profile.bible_version_id; 

  // 2. FIXED: Match the exact name in your .env file!
  const apiKey = process.env.YOUVERSION_API_KEY; 
  const url = `https://api.youversion.com/v1/bibles/${bibleVersionId}/passages/${passageId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-YVP-App-Key': apiKey || '',
      },
      next: { revalidate: 86400 } 
    });

    if (!response.ok) {
      throw new Error(`YouVersion error: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.content || "Text not found."; 
    
  } catch (err) {
    console.error("❌ Failed fetching from YouVersion API:", err);
    return null;
  }
}