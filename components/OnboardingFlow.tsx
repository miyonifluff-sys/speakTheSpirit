'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { supabaseService } from '@/services/supabaseService';

interface BibleVersion {
  id: number;
  name: string;
  language: string;
}

export default function OnboardingFlow() {
  const { userId } = useGame();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: '/characters/boy.png',
    language: 'eng',
    bible_version_id: 0,
    grade_level: '',
    church_experience: '',
  });

  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);

  const fetchBibleVersions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.youversion.com/v1/bibles?language_ranges=${formData.language}`, {
        headers: {
          'X-YVP-App-Key': process.env.NEXT_PUBLIC_YOUVERSION_API_KEY || '',
        },
      });
      const data = await response.json();
      setBibleVersions(Array.isArray(data) ? data : data.versions || []);
    } catch (error) {
      console.error("Failed to fetch Bible versions:", error);
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
      // Redirect to game or update context to hide onboarding
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
            <h2 className="text-3xl font-bold">Who are you?</h2>
            <input 
              type="text" 
              placeholder="Enter your name..." 
              className="neo-box p-4 text-xl w-full max-w-sm outline-none"
              value={formData.display_name}
              onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            />
            <div className="flex gap-8 mt-4">
              <div 
                onClick={() => setFormData({...formData, avatar_url: '/characters/boy.png'})}
                className={`cursor-pointer p-2 border-4 ${formData.avatar_url === '/characters/boy.png' ? 'border-blue-500 bg-blue-100' : 'border-black'} neo-card`}
              >
                <img src="/characters/boy.png" alt="Boy" className="w-24 h-24 object-contain" />
              </div>
              <div 
                onClick={() => setFormData({...formData, avatar_url: '/characters/girl.png'})}
                className={`cursor-pointer p-2 border-4 ${formData.avatar_url === '/characters/girl.png' ? 'border-pink-500 bg-pink-100' : 'border-black'} neo-card`}
              >
                <img src="/characters/girl.png" alt="Girl" className="w-24 h-24 object-contain" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-6 items-center text-center">
            <h2 className="text-3xl font-bold">Choose your language</h2>
            <select 
              className="neo-box p-4 text-xl w-full max-w-sm outline-none bg-white"
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
            >
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="por">Portuguese</option>
            </select>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-6 items-center text-center w-full max-w-md">
            <h2 className="text-3xl font-bold">Pick your Bible version</h2>
            {loading ? (
              <p className="animate-float">Loading versions...</p>
            ) : (
              <div className="flex flex-col gap-3 w-full h-64 overflow-y-auto p-2 neo-box bg-white">
                {bibleVersions.map((v) => (
                  <button 
                    key={v.id}
                    onClick={() => setFormData({...formData, bible_version_id: v.id})}
                    className={`p-3 text-left border-2 transition-all ${formData.bible_version_id === v.id ? 'bg-yellow-300 border-black' : 'border-gray-200 hover:border-black'}`}
                  >
                    {v.name}
                  </button>
                ))}
                {bibleVersions.length === 0 && <p>No versions found for this language.</p>}
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-6 items-center text-center">
            <h2 className="text-3xl font-bold">What grade are you in?</h2>
            <select 
              className="neo-box p-4 text-xl w-full max-w-sm outline-none bg-white"
              value={formData.grade_level}
              onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
            >
              <option value="">Select Grade</option>
              <option value="TK">TK</option>
              <option value="K">Kindergarten</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={`${i+1}th`}>{i+1}th Grade</option>
              ))}
            </select>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-6 items-center text-center w-full max-w-md">
            <h2 className="text-3xl font-bold">Church Experience</h2>
            <div className="flex flex-col gap-4 w-full">
              {[
                "I haven't been to church before",
                "I have been going for less than a year",
                "I have been going for over a year"
              ].map((option) => (
                <button 
                  key={option}
                  onClick={() => setFormData({...formData, church_experience: option})}
                  className={`p-4 text-lg border-4 neo-card ${formData.church_experience === option ? 'bg-green-300' : 'bg-white'}`}
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
    <div className="fixed inset-0 bg-yellow-400 z-50 flex items-center justify-center p-4">
      <div className="bg-white neo-box p-8 w-full max-w-2xl min-h-[500px] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-lg">Step {step} of 5</span>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full border-2 border-black ${step >= i ? 'bg-black' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-12">
          <button 
            onClick={handleBack} 
            disabled={step === 1}
            className={`neo-btn p-4 font-bold ${step === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200'}`}
          >
            Back
          </button>
          
          {step < 5 ? (
            <button 
              onClick={handleNext} 
              disabled={step === 1 && !formData.display_name}
              className={`neo-btn p-4 font-bold bg-blue-400 ${(!formData.display_name && step === 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={loading || !formData.church_experience}
              className="neo-btn p-4 font-bold bg-green-400 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Finish & Start Game!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
