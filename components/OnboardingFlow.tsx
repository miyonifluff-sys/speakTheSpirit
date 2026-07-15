'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useGame } from '@/context/GameContext';
import { supabaseService } from '@/services/supabaseService';

// Unified interface matching both API schemas
interface BibleVersion {
  id: number;
  abbreviation: string;
  title: string;
  language_tag: string;
}

export default function OnboardingFlow() {
  const { userId } = useGame();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: '/characters/boy.png',
    language: 'en', // Default language code
    bible_version_id: 0,
    grade_level: '',
    church_experience: '',
  });

  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);

  const fetchBibleVersions = useCallback(async () => {
    setLoading(true);
    
    const fallbackVersions: Record<string, BibleVersion[]> = {
      en: [
        { id: 477, abbreviation: 'ESV', title: 'English Standard Version', language_tag: 'en' },
        { id: 111, abbreviation: 'NIV', title: 'New International Version', language_tag: 'en' },
        { id: 116, abbreviation: 'NLT', title: 'New Living Translation', language_tag: 'en' },
        { id: 1, abbreviation: 'KJV', title: 'King James Version', language_tag: 'en' }
      ],
      es: [
        { id: 151, abbreviation: 'RVR1960', title: 'Reina-Valera 1960', language_tag: 'es' },
        { id: 127, abbreviation: 'NVI', title: 'Nueva Versión Internacional', language_tag: 'es' },
        { id: 149, abbreviation: 'NTV', title: 'Nueva Traducción Viviente', language_tag: 'es' }
      ],
      fr: [
        { id: 93, abbreviation: 'LSG', title: 'Louis Segond 1910', language_tag: 'fr' },
        { id: 134, abbreviation: 'PDV', title: 'Parole de Vie', language_tag: 'fr' }
      ],
      pt: [
        { id: 129, abbreviation: 'NVI', title: 'Nova Versão Internacional', language_tag: 'pt' },
        { id: 212, abbreviation: 'NAA', title: 'Nova Almeida Atualizada', language_tag: 'pt' }
      ],
      ko: [
        { id: 88, abbreviation: 'KRV', title: 'Korean Revised Version', language_tag: 'ko' },
        { id: 142, abbreviation: 'KLB', title: 'Korean Living Bible', language_tag: 'ko' }
      ],
      zh: [
        { id: 41, abbreviation: 'RCUVS', title: 'Revised Chinese Union Version Simpl.', language_tag: 'zh' },
        { id: 43, abbreviation: 'CCB', title: 'Chinese Contemporary Bible', language_tag: 'zh' }
      ],
      'zh-TW': [
        { id: 42, abbreviation: 'RCUVT', title: 'Revised Chinese Union Version Trad.', language_tag: 'zh-TW' },
        { id: 44, abbreviation: 'CUNP-T', title: 'Chinese Union Version Trad.', language_tag: 'zh-TW' }
      ],
      de: [
        { id: 10, abbreviation: 'LUTH1545', title: 'Luther Bibel 1545', language_tag: 'de' },
        { id: 73, abbreviation: 'HOF', title: 'Hoffnung für Alle', language_tag: 'de' },
        { id: 51, abbreviation: 'SCH2000', title: 'Schlachter 2000', language_tag: 'de' }
      ],
      tl: [
        { id: 398, abbreviation: 'RTPV05', title: 'Magandang Balita Biblia', language_tag: 'tl' },
        { id: 399, abbreviation: 'ABB', title: 'Ang Biblia', language_tag: 'tl' }
      ],
      vi: [
        { id: 194, abbreviation: 'VI1934', title: '1934 Vietnamese Bible', language_tag: 'vi' },
        { id: 193, abbreviation: 'NVB', title: 'Bản Dịch Mới', language_tag: 'vi' }
      ],
      ja: [
        { id: 81, abbreviation: 'JCB', title: 'Japan Contemporary Bible', language_tag: 'ja' },
        { id: 181, abbreviation: 'JLB', title: 'Japanese Living Bible', language_tag: 'ja' }
      ]
    };

    const currentLang = formData.language;
    const currentFallbacks = fallbackVersions[currentLang] || fallbackVersions['en'];

    try {
      const languageMap: Record<string, string> = {
        en: 'eng', es: 'spa', fr: 'fra', pt: 'por', ko: 'kor',
        zh: 'zho', 'zh-TW': 'zho', de: 'deu', tl: 'tgl', vi: 'vie', ja: 'jpn'
      };
      const targetLanguageCode = languageMap[currentLang] || 'eng';

      // Strategy: Intentionally requesting only the top 10 items to prevent server payload errors
      const queryParams = new URLSearchParams({
        language_ranges: targetLanguageCode,
        page: '1',
        size: '10' 
      });

      const response = await fetch(`https://api.youversion.com/v1/bibles?${queryParams.toString()}`, {
        headers: {
          'X-YVP-App-Key': process.env.NEXT_PUBLIC_YOUVERSION_API_KEY || '',
          'Accept': 'application/json'
        },
      });
      
      if (!response.ok) {
        console.warn(`YouVersion responded with status ${response.status}. Using fallbacks.`);
        setBibleVersions(currentFallbacks);
        setFormData(prev => ({ ...prev, bible_version_id: currentFallbacks[0].id }));
        setLoading(false);
        return;
      }

      const responseJson = await response.json();
      
      const rawList = Array.isArray(responseJson) 
        ? responseJson 
        : (Array.isArray(responseJson.data) ? responseJson.data : []);
        
      if (rawList.length === 0) {
        throw new Error("API returned an empty version set.");
      }

      const mappedList: BibleVersion[] = rawList.map((item: any) => ({
        id: item.id,
        abbreviation: item.abbreviation || item.abbr || '',
        title: item.title || item.name || 'Unknown Translation',
        language_tag: item.language_tag || item.language || currentLang
      }));

      setBibleVersions(mappedList);
      setFormData(prev => ({ ...prev, bible_version_id: mappedList[0].id }));

    } catch (error) {
      console.error("Failed to fetch Bible versions, loading reliable mock fallbacks:", error);
      setBibleVersions(currentFallbacks);
      setFormData(prev => ({ ...prev, bible_version_id: currentFallbacks[0].id }));
    } finally {
      setLoading(false);
    }
  }, [formData.language]);

  const handleNext = () => {
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep === 3) {
      fetchBibleVersions();
    }
  };
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      await supabaseService.saveProfile(userId, formData);
      window.location.reload(); 
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-6 items-center text-center">
            <h2 className="text-3xl font-bold text-slate-100">Who are you?</h2>
            <input 
              type="text" 
              placeholder="Enter your name..." 
              className="bg-slate-950 text-white border-2 border-slate-700 p-4 text-xl w-full max-w-sm outline-none rounded-xl"
              value={formData.display_name}
              onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            />
            <div className="flex gap-8 mt-4">
              <button 
                type="button"
                onClick={() => setFormData({...formData, avatar_url: '/characters/boy.png'})}
                className={`cursor-pointer p-2 border-4 rounded-xl transition-all duration-200 focus:outline-none ${
                  formData.avatar_url === '/characters/boy.png' 
                    ? 'border-yellow-400 bg-slate-800 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.4)]' 
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* --- Boy Avatar --- */}
                  <Image 
                    src="/characters/boy.png" 
                    alt="Boy" 
                    width={96} 
                    height={96} 
                    className="object-contain" 
                    style={{ height: 'auto' }} // Fixes the Next.js console warning!
                  />
              </button>

              <button 
                type="button"
                onClick={() => setFormData({...formData, avatar_url: '/characters/girl.png'})}
                className={`cursor-pointer p-2 border-4 rounded-xl transition-all duration-200 focus:outline-none ${
                  formData.avatar_url === '/characters/girl.png' 
                    ? 'border-yellow-400 bg-slate-800 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.4)]' 
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* --- Girl Avatar --- */}
                <Image 
                  src="/characters/girl.png" 
                  alt="Girl" 
                  width={96} 
                  height={96} 
                  className="object-contain" 
                  style={{ height: 'auto' }} // Fixes the Next.js console warning!
                />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-6 items-center text-center">
            <h2 className="text-3xl font-bold text-slate-100">Choose your language</h2>
            <select 
              className="bg-slate-950 text-white border-2 border-slate-700 p-4 text-xl w-full max-w-sm outline-none rounded-xl"
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
            >
              <option value="en">English 🇺🇸</option>
              <option value="es">Español 🇪🇸</option>
              <option value="fr">Français 🇫🇷</option>
              <option value="pt">Português 🇵🇹</option>
              <option value="ko">한국어 🇰🇷</option>
              <option value="zh">简体中文 🇨🇳</option>
              <option value="zh-TW">繁體中文 🇹🇼</option>
              <option value="de">Deutsch 🇩🇪</option>
              <option value="tl">Tagalog 🇵🇭</option>
              <option value="vi">Tiếng Việt 🇻🇳</option>
              <option value="ja">日本語 🇯🇵</option>
            </select>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-6 items-center text-center w-full max-w-md">
            <h2 className="text-3xl font-bold text-slate-100">Pick your Bible version</h2>
            {loading ? (
              <p className="animate-float text-slate-300">Loading versions...</p>
            ) : (
              <div className="flex flex-col gap-3 w-full h-64 overflow-y-auto p-2 bg-slate-950 border-2 border-slate-700 rounded-xl">
                {bibleVersions.map((v) => (
                  <button 
                    key={v.id}
                    type="button"
                    onClick={() => setFormData({...formData, bible_version_id: v.id})}
                    className={`p-3 text-left border-2 rounded-lg transition-all ${
                      formData.bible_version_id === v.id 
                        ? 'bg-yellow-400 text-black border-black font-black' 
                        : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                    }`}
                  >
                    {v.title} {v.abbreviation ? `(${v.abbreviation})` : ''}
                  </button>
                ))}
                {bibleVersions.length === 0 && <p className="text-slate-300 mt-4">No versions found for this language.</p>}
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-6 items-center text-center w-full max-w-xl">
            <h2 className="text-3xl font-bold text-slate-100">What grade are you in?</h2>
            
            {/* Immersive Game-Style Grid with Adult Option at the End */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-h-72 overflow-y-auto p-2 bg-slate-950 border-2 border-slate-700 rounded-xl">
              {[
                { value: 'TK', label: 'TK' },
                { value: 'K', label: 'Kindergarten' },
                ...[...Array(12)].map((_, i) => ({
                  value: `${i + 1}th`,
                  label: `${i + 1}th Grade`
                })),
                { value: 'Adult', label: 'Adult / Parent' } // Moved to the very end of the array!
              ].map((grade) => (
                <button
                  key={grade.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, grade_level: grade.value })}
                  className={`p-3 text-center text-sm font-bold border-4 rounded-xl transition-all duration-150 ${
                    formData.grade_level === grade.value
                      ? 'bg-yellow-400 text-black border-black font-black scale-102 shadow-[0_0_10px_rgba(250,204,21,0.3)]'
                      : 'bg-slate-800 text-slate-300 border-black hover:bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-6 items-center text-center w-full max-w-md">
            <h2 className="text-3xl font-bold text-slate-100">Church Experience</h2>
            <div className="flex flex-col gap-4 w-full">
              {[
                "I haven't been to church before",
                "I have been going for less than a year",
                "I have been going for over a year"
              ].map((option) => (
                <button 
                  key={option}
                  type="button"
                  onClick={() => setFormData({...formData, church_experience: option})}
                  className={`p-4 text-lg border-4 neo-card transition-all ${
                    formData.church_experience === option 
                      ? 'bg-yellow-400 text-black border-black font-black' 
                      : 'bg-slate-800 text-slate-300 border-black hover:bg-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 neo-box p-8 w-full max-w-2xl min-h-[500px] flex flex-col justify-between rounded-2xl">
        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-lg text-slate-300">Step {step} of 5</span>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full border-2 border-black ${step >= i ? 'bg-yellow-400' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-12">
          <button 
            type="button"
            onClick={handleBack} 
            disabled={step === 1}
            className={`neo-btn p-4 font-bold transition-all ${step === 1 ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-slate-700 text-slate-100'}`}
          >
            Back
          </button>
          
          {step < 5 ? (
            <button 
              type="button"
              onClick={handleNext} 
              disabled={step === 1 && !formData.display_name}
              className={`neo-btn p-4 font-bold bg-yellow-400 text-black transition-all ${(!formData.display_name && step === 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit} 
              disabled={loading || !formData.church_experience}
              className="neo-btn p-4 font-bold bg-yellow-400 text-black transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Finish & Start Game!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}