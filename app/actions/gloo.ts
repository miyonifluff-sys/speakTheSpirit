'use server';

import { supabase } from '@/services/supabaseService';

/**
 * 🔐 Exchanges Client ID and Client Secret for a temporary OAuth2 Access Token.
 * Matches your Python Kaggle credentials-auth flow.
 */
async function getGlooAccessToken(): Promise<string | null> {
  const url = "https://platform.ai.gloo.com/oauth2/token";
  
  const clientId = process.env.GLOO_CLIENT_ID;
  const clientSecret = process.env.GLOO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ Missing GLOO_CLIENT_ID or GLOO_CLIENT_SECRET in environment variables.");
    return null;
  }

  // Encode credentials into an HTTP Basic Auth string
  const credentialString = `${clientId}:${clientSecret}`;
  const base64Creds = Buffer.from(credentialString).toString('base64');

  const headers = {
    "Authorization": `Basic ${base64Creds}`,
    "Content-Type": "application/x-www-form-urlencoded"
  };

  const payload = new URLSearchParams({
    "grant_type": "client_credentials",
    "scope": "api/access"
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: payload,
      // 10-second timeout
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Auth API responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error(`❌ Gloo Authentication Failed:`, error);
    return null;
  }
}

/**
 * 👼 Chat with Angel Gabriel
 * Securely logs in, grabs profile info, and sends a highly contextualized system prompt to Gloo AI.
 */
export async function askAngelGabriel(
  userId: string, 
  question: string, 
  systemInstructions: string // 🌟 Accept dynamic system instructions from the component!
) {
  try {
    const accessToken = await getGlooAccessToken();
    if (!accessToken) {
      throw new Error("Could not acquire Gloo access token.");
    }

    // Fetch profile data for kid-friendly personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('grade_level, church_experience')
      .eq('id', userId)
      .single();

    const grade = profile?.grade_level || 'an unknown grade';
    const experience = profile?.church_experience || 'unknown';

    // Combine player profile with scene-specific instructions
    const fullyFormedPrompt = `
      You are Angel Gabriel, a warm, encouraging, and witty heavenly messenger guiding a child in the game "Speak the Spirit".
      The player is in ${grade} and their church experience level is: "${experience}".
      
      ${systemInstructions}
      
      General Guidelines:
      1. Keep your answers EXTREMELY BRIEF (strict maximum of 2 sentences so it fits in a small chat box).
      2. Keep it encouraging and age-appropriate.
      3. Never give away the exact answer letter directly.
    `;

    const url = "https://platform.ai.gloo.com/ai/v2/chat/completions";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        auto_routing: true,
        messages: [
          { role: "system", content: fullyFormedPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gloo completion call responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { reply: data.choices[0].message.content };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in askAngelGabriel:', message);
    return { error: "I can't hear you over the static! Try asking me again!" };
  }
}

/**
 * 📖 Generate Personalized Bible Question
 * Fetches OAuth2 Token, pulls profile details, and calls Gloo AI auto-routing.
 */
export async function getPersonalizedGlooQuestion(userId: string) {
  try {
    // 1. Authenticate with Gloo first
    const accessToken = await getGlooAccessToken();
    if (!accessToken) {
      throw new Error("Could not acquire Gloo access token.");
    }

    // 2. Fetch profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('grade_level, church_experience')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new Error(`Profile not found for user ${userId}: ${error?.message}`);
    }

    const { grade_level, church_experience } = profile;

    // 3. Construct system prompt
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

    // 4. Call Gloo Chat Completion API
    const url = "https://platform.ai.gloo.com/ai/v2/chat/completions";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        auto_routing: true, // Recommended auto_routing option
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: 'Please generate a question for a verse about "Kindness".' }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gloo completion call responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { question: data.choices[0].message.content };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in getPersonalizedGlooQuestion:', message);
    return { error: message };
  }
}

/**
 * 🎲 Generates a highly personalized multiple-choice question.
 * Automatically gives younger kids (TK-3rd) 2 options, and older kids (4th-12th) 3 options.
 */
/**
 * 🎲 Generates a highly personalized multiple-choice question.
 * Automatically gives younger kids (TK-3rd) 2 options, and older kids (4th-12th) 3 options.
 */
export async function generateAdaptiveQuestion(
  userId: string, 
  concept: string, 
  remedialContext: string = ""
) {
  try {
    const accessToken = await getGlooAccessToken();
    if (!accessToken) {
      throw new Error("Could not acquire Gloo access token.");
    }

    // 1. Fetch child's profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('grade_level, church_experience')
      .eq('id', userId)
      .single();

    const grade = profile?.grade_level || '4th'; // Default to 4th grade if not set
    const experience = profile?.church_experience || 'unknown';

    // 2. Determine difficulty parameters based on grade level
    // We check if the grade matches TK, Kindergarten, 1st, 2nd, or 3rd.
    const isYoungerKid = /^(TK|K|kindergarten|1st|2nd|3rd)$/i.test(grade.trim());
    const optionCount = isYoungerKid ? 2 : 3;

    const systemPrompt = `
      You are an expert children's game designer and curriculum writer.
      Generate an age-appropriate multiple-choice question for a child in ${grade} with "${experience}" church experience.
      
      Topic: "${concept}" (specifically faith / active trust / Pistis).
      
      ${remedialContext ? `IMPORTANT: The child got the last question wrong. Remedial context: ${remedialContext}. Choose a slightly different angle or simpler wording.` : ""}
      
      Requirements:
      1. You must generate exactly ${optionCount} options: Option A, Option B${optionCount === 3 ? ', and Option C' : ''}.
      2. Keep the vocabulary extremely simple and friendly for a ${grade} student.
      3. One option MUST represent active loyalty, deep trust, or doing what is commanded (Correct).
      ${isYoungerKid ? `
      4. For this younger age group, keep options short. The incorrect option (Option A or B) should represent passive knowledge/empty facts.
      ` : `
      4. One option MUST represent passive knowledge/empty facts (Incorrect).
      5. One option MUST represent a distractor, like avoiding action or waiting for a magic trick without participation (Incorrect).
      `}
      6. 🌟 CRITICAL: Randomly assign the correct concept to EITHER Option A, Option B${optionCount === 3 ? ', or Option C' : ''}. Mix it up completely!
      7. Do NOT mention the exact Greek word "Pistis" in the question or options to keep cognitive load low.
      8. You MUST respond with a strict, valid JSON object and nothing else. No markdown formatting, no code blocks, just raw JSON.
      
      Expected JSON Format:
      {
        "question": "The question text here?",
        "optionA": "The first choice text.",
        "optionB": "The second choice text.",
        ${optionCount === 3 ? '"optionC": "The third choice text.",' : ''}
        "correctOption": "A" or "B"${optionCount === 3 ? ' or "C"' : ''} (Set this dynamically to whichever letter contains the correct, active concept!)
      }
    `;

    const url = "https://platform.ai.gloo.com/ai/v2/chat/completions";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        auto_routing: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate the JSON question payload now." }
        ],
        temperature: 0.8
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Gloo completion call responded with ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content.trim();
    
    // Strip markdown formatting if any
    const cleanJsonText = rawText.replace(/^```json\s*|```$/g, '');
    const parsedQuestion = JSON.parse(cleanJsonText);

    return { questionData: parsedQuestion };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in generateAdaptiveQuestion:', message);
    
    // Solid fallback matching standard 3-option
    return { 
      questionData: {
        question: "What does it mean to have real faith in the Gardener?",
        optionA: "Just memorizing lists of facts and trivia about His seeds.",
        optionB: "Actively trusting Him enough to step out on the dirt trail and plant them.",
        optionC: "Waiting at the crossroads and wishing they would plant themselves.",
        correctOption: "B"
      }
    };
  }
}