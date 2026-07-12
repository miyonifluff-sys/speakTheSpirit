'use server';

import { supabase } from '@/services/supabaseService';

export async function getPersonalizedGlooQuestion(userId: string) {
  try {
    // 1. Fetch profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('grade_level, church_experience')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new Error(`Profile not found for user ${userId}: ${error?.message}`);
    }

    const { grade_level, church_experience } = profile;

    // 2. Construct the system prompt for Gloo AI
    const systemPrompt = `
      You are a friendly, encouraging AI mentor for children. 
      The user is in ${grade_level || 'an unknown grade'} and their church experience is: "${church_experience || 'unknown'}".
      
      Your goal is to generate a highly personalized, age-appropriate, and engaging question about a Bible verse.
      - For younger children (TK-3rd), use simple language, concrete examples, and a playful tone.
      - For older children (4th-12th), use more nuanced language, relate the verse to real-life social situations, and encourage deeper reflection.
      - If they have no church experience, avoid using "churchy" jargon and explain concepts simply.
      - If they are experienced, you can use more biblical terminology.
      
      Please provide only the question, without any introductory text.
    `;

    // 3. Call Gloo AI API (Mock implementation as endpoint is provided as context)
    const response = await fetch('https://api.gloo.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GLOO_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gloo-ai-personalized',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Please generate a question for a verse about "Kindness".' }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gloo AI API responded with ${response.status}`);
    }

    const data = await response.json();
    return { question: data.choices[0].message.content };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in getPersonalizedGlooQuestion:', message);
    return { error: message };
  }
}
