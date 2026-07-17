'use client';

import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { addLog } from '../../../utils/gameEvents';
import { askAngelGabriel, generateAdaptiveQuestion, verifyComprehension } from '../../../app/actions/gloo';
import AngelConsole from '../Crossroads/AngelConsole';
import RushingWatersStage from './RushingWatersStage'; 

interface ChatMessage {
  sender: 'you' | 'angel';
  text: string;
}

interface DynamicQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  correctOption: 'A' | 'B' | 'C';
}

export default function RushingWatersScene({ onComplete }: { onComplete?: () => void }) {
  const { setCurrentScreen } = useGame();

  const [stageState, setStageState] = useState('riddle-intro');
  const [selectedGender] = useState<'girl' | 'boy'>('girl');
  const characterPath = selectedGender === 'girl' ? "/characters/girlnobackground.png" : "/characters/boynobackground.png";

  // 🧠 AI & GLOO STATES
  const [explanationAccepted, setExplanationAccepted] = useState(false);
  const [verificationState, setVerificationState] = useState<'none' | 'pending-chat'>('none');
  const [activeComprehensionQuestion, setActiveComprehensionQuestion] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<DynamicQuestion | null>(null);
  const [attempts, setAttempts] = useState(0);
  
  const [angelChat, setAngelChat] = useState("Traveler, the river looks wild and deep. But remember... no boat is docked, no timber groans. Read the riddle!");
  const [askInput, setAskInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState("");

  const loadQuestionAndExplanation = async (remedialPrompt: string = "", currentAttemptIndex: number) => {
    setIsThinking(true);
    
    // Updated Curriculum: Focusing strictly on CONVICTION (Elenchos)
    const conceptName = "Conviction (Elenchos)";
    const correctRule = "Trusting in the Gardener and His promises, even when your eyes see absolutely nothing.";
    const incorrectRule = "Trusting only in your own physical sight, tools, and abilities to make a bridge or boat.";

    const metaphors = [
      "Conviction means trusting in things not seen! Just like gravity or a radio frequency, just because you can't see it doesn't mean it isn't real and holding you up.",
      "In ancient courts, an 'elenchos' was undeniable proof. The Gardener's character is our proof, even when the river looks scary!",
    ];
    
    const chosenMetaphor = metaphors[currentAttemptIndex % metaphors.length];
    const dynamicComprehensionQuestion = currentAttemptIndex === 1 
      ? "If you step onto the water without a boat, what unseen reality are you trusting to hold you up?"
      : "Can you name one thing in real life (like gravity) that is invisible but completely real?";
    
    setActiveComprehensionQuestion(dynamicComprehensionQuestion);

    const explanationInstructions = `
      The player is learning about "${conceptName}". Attempt number ${currentAttemptIndex + 1}.
      They just crossed a rushing river on an invisible bridge.
      ${remedialPrompt ? `REMEDIAL: ${remedialPrompt} End by asking: "${dynamicComprehensionQuestion}"` : `INTRO: Explain the concept of Conviction (Elenchos) and 'things not seen' using this analogy: "${chosenMetaphor}".`}
      Keep the entire message warm and brief (maximum 3 sentences).
    `;

    try {
      const angelResponse = await askAngelGabriel("user_123", remedialPrompt ? "Teach me from my mistake!" : `Introduce ${conceptName}.`, explanationInstructions);
      setChatLog(prev => [...prev, { sender: 'angel', text: angelResponse.reply || `Remember, ${chosenMetaphor}` }]);
      
      const quizResponse = await generateAdaptiveQuestion("user_123", conceptName, correctRule, incorrectRule, remedialPrompt, currentAttemptIndex);
      if (quizResponse.questionData) setCurrentQuestion(quizResponse.questionData as DynamicQuestion);
    } catch (err) {
      setChatLog(prev => [...prev, { sender: 'angel', text: `Let's think about this: ${chosenMetaphor}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAnswerSubmit = async (selectedOption: 'A' | 'B' | 'C') => {
    if (!currentQuestion) return;
    const chosenText = selectedOption === 'A' ? currentQuestion.optionA : (selectedOption === 'B' ? currentQuestion.optionB : currentQuestion.optionC);

    if (selectedOption === currentQuestion.correctOption) {
      setStageState('solved');
      addLog("Mastered the Conviction concept!", "system");
      setIsThinking(true);
      try {
        const res = await askAngelGabriel("user_123", "Explain why my correct answer was right!", `Player chose: "${chosenText}". Celebrate briefly and mention we are ready to battle the silencer.`);
        if (res.reply) { setAngelChat(res.reply); setChatLog(prev => [...prev, { sender: 'angel', text: res.reply }]); }
      } finally { setIsThinking(false); }
    } else {
      const correctText = currentQuestion.correctOption === 'A' ? currentQuestion.optionA : (currentQuestion.correctOption === 'B' ? currentQuestion.optionB : currentQuestion.optionC);
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      setChallengeFeedback("Not quite! Let's chat about it on the right.");
      setExplanationAccepted(false); 
      setVerificationState('pending-chat'); 
      setAngelChat("That wasn't quite it. Answer my question in the chat console so we can clear this up!");
      await loadQuestionAndExplanation(`Child chose "${chosenText}" instead of "${correctText}". Explain why.`, nextAttempt);
    }
  };

  const handleAskGloo = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentQuestionText = askInput.trim();
    if (!currentQuestionText) return;

    setAskInput("");
    setChatLog(prev => [...prev, { sender: 'you', text: currentQuestionText }]);
    setIsThinking(true);

    if (verificationState === 'pending-chat') {
      try {
        const res = await verifyComprehension("user_123", activeComprehensionQuestion, currentQuestionText, "Conviction means acting on the unseen realities promised by the Gardener.");
        if (res.evaluation) {
          setChatLog(prev => [...prev, { sender: 'angel', text: res.evaluation.reply }]);
          if (res.evaluation.isUnderstood) {
            setVerificationState('none'); setExplanationAccepted(true); setChallengeFeedback("");
            setAngelChat("Fantastic! Try this brand-new challenge on the left.");
          }
        }
      } finally { setIsThinking(false); }
    } else {
      try {
        const res = await askAngelGabriel("user_123", currentQuestionText, `Guide them without giving the direct letter.`);
        if (res.reply) setChatLog(prev => [...prev, { sender: 'angel', text: res.reply }]);
      } finally { setIsThinking(false); }
    }
  };

  return (
    <div className="w-full h-full flex bg-slate-950 border-4 border-black overflow-hidden shadow-[8px_8px_0px_#000] rounded-xl relative">
      
      {/* 🔴 LEFT SIDE: INTERACTIVE STAGE (60%) */}
      <div className="w-[60%] h-full bg-slate-900 relative flex flex-col items-center border-r-4 border-black text-white p-4">
        
        {/* TOP STATUS ROW */}
        <div className="w-full flex justify-between items-center bg-slate-800 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] shrink-0 mb-4 z-20">
          <div>
            <h3 className="text-[10px] font-black uppercase text-amber-400">Weapon Tracker</h3>
            <p className="text-xs font-bold text-slate-200">
              {stageState === 'solved' ? "Now faith is the assurance of things hoped for, the conviction of things not seen." : "Now faith is the assurance of things hoped for... [ _ _ _ _ _ ]"}
            </p>
          </div>
        </div>

        {/* 🗺️ RENDER VISUAL STAGE OR LOCK CHALLENGE */}
        {(stageState !== 'lock-challenge') ? (
          <RushingWatersStage 
            stageState={stageState}
            characterPath={characterPath}
            onStartCrossing={() => {
              setStageState('river-crossing');
              setAngelChat("Use your arrow keys to step onto the water. What are you walking on?");
            }}
            onCrossedRiver={async () => {
              setStageState('lock-challenge');
              setExplanationAccepted(false);
              setVerificationState('none');
              setAttempts(0);
              setAngelChat("Incredible! You stepped out into thin air, but a bridge caught you. Let's learn what 'things not seen' means.");
              await loadQuestionAndExplanation("", 0);
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col bg-slate-900 p-6 overflow-y-auto rounded border-4 border-black shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] relative">
            {currentQuestion && (
              <>
                <div className={`transition-all duration-300 ${explanationAccepted ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                   <p className="font-bold text-base text-slate-100 leading-relaxed mb-4">{currentQuestion.question}</p>
                   {challengeFeedback && <div className="bg-red-950/80 border-2 border-red-500 text-red-200 font-bold p-2 text-xs rounded mb-3">⚠️ {challengeFeedback}</div>}
                   <div className="space-y-3">
                      <button onClick={() => handleAnswerSubmit('A')} className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3 font-bold text-sm shadow-[2px_2px_0px_#000] transition-colors rounded">A) {currentQuestion.optionA}</button>
                      <button onClick={() => handleAnswerSubmit('B')} className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3 font-bold text-sm shadow-[2px_2px_0px_#000] transition-colors rounded">B) {currentQuestion.optionB}</button>
                      {currentQuestion.optionC && <button onClick={() => handleAnswerSubmit('C')} className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3 font-bold text-sm shadow-[2px_2px_0px_#000] transition-colors rounded">C) {currentQuestion.optionC}</button>}
                   </div>
                </div>
                {!explanationAccepted && (
                   <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center z-10 rounded">
                      <div className="bg-slate-800 border-2 border-black p-5 rounded-lg shadow-[4px_4px_0px_#000] max-w-sm">
                         <span className="text-4xl animate-bounce">👼</span>
                         <h3 className="font-black uppercase text-amber-400 text-sm mt-2 mb-1">{verificationState === 'pending-chat' ? "Chat Challenge Active!" : "Divine Wisdom Required"}</h3>
                         <p className="text-xs text-slate-300 leading-relaxed mb-4">{verificationState === 'pending-chat' ? "Explain the concept to Angel Gabriel in the Chat box to unlock your retry!" : "Read Angel Gabriel's lesson in the Chat Console first!"}</p>
                         {verificationState !== 'pending-chat' && (
                            <button disabled={isThinking} onClick={() => { setExplanationAccepted(true); setChallengeFeedback(""); setAngelChat("Ready? Answer the challenge!"); }} className="bg-yellow-400 text-black font-black text-xs py-2.5 px-6 rounded border-2 border-black shadow-[2px_2px_0px_#000]">{isThinking ? "Preparing..." : "I'm Ready! 👍"}</button>
                         )}
                      </div>
                   </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 🔵 RIGHT SIDE: ANGEL CONSOLE */}
      <AngelConsole 
        angelChat={angelChat}
        chatLog={chatLog}
        isThinking={isThinking}
        askInput={askInput}
        setAskInput={setAskInput}
        handleAskGloo={handleAskGloo}
        verificationState={verificationState}
        stageState={stageState}
        onComplete={onComplete}
      />
    </div>
  );
}