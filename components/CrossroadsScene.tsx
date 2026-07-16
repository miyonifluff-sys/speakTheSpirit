'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { addLog } from '../utils/gameEvents';
import { askAngelGabriel, generateAdaptiveQuestion, verifyComprehension } from '../app/actions/gloo';

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

export default function CrossroadsScene({ onComplete }: { onComplete?: () => void }) {
  const { setCurrentScreen, setQuestObjectClicked } = useGame();

  const [stageState, setStageState] = useState('riddle-intro');
  const [explanationAccepted, setExplanationAccepted] = useState(false);

  // 'none' | 'pending-chat'
  const [verificationState, setVerificationState] = useState<'none' | 'pending-chat'>('none');
  const [activeComprehensionQuestion, setActiveComprehensionQuestion] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState<DynamicQuestion | null>(null);
  const [attempts, setAttempts] = useState(0);

  const [angelChat, setAngelChat] = useState("Greetings, Traveler! Before you take a single step, you must decode the riddle above. Click the scroll on the left to begin!");
  const [askInput, setAskInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const [challengeFeedback, setChallengeFeedback] = useState("");

  const [selectedGender] = useState<'girl' | 'boy'>('girl');
  const characterPath = selectedGender === 'girl' 
    ? "/characters/girlnobackground.png" 
    : "/characters/boynobackground.png";

  const handleMove = (direction: string) => {
    if (stageState === 'fork') {
      if (direction === 'LEFT' || direction === 'UP') {
        setStageState('ghosts');
        setAngelChat("Oh no! The ghosts of doubt and distraction! This isn't the right way. Use the D-Pad or Down arrow to go back.");
        addLog("Wandered into the ghosts.", "system");
      } else if (direction === 'RIGHT') {
        setStageState('x-marks');
        setAngelChat("Go click X! You found the hidden dirt trail. The Gardener left something here for you.");
        addLog("Found the dirt trail.", "system");
      }
    } else if (stageState === 'ghosts' && direction === 'DOWN') {
      setStageState('fork');
      setAngelChat("Phew, back at the crossroads. Try the other path!");
    }
  };

  useEffect(() => {
    if (stageState === 'fork') {
      window.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return; 
      }

      if (stageState !== 'fork' && stageState !== 'ghosts') {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stageState]);

  const loadQuestionAndExplanation = async (remedialPrompt: string = "", currentAttemptIndex: number) => {
    setIsThinking(true);
    
    const conceptName = "Faith";
    const correctRule = "Active loyalty, deep trust, and doing what the Gardener says (taking action).";
    const incorrectRule = "Just memorizing lists of facts and trivia about the Gardener, or passive head-knowledge without movement.";

    const metaphors = [
      "Pistis means active trust. It's like sitting on a chair: you don't just look at the chair and believe it holds weight, you have to actually sit down and let it support you!",
      "Pistis is active trust. Think of walking through a door: you don't just stand outside looking at the handle, you have to turn it and step through to the other side!",
      "Pistis is active trust. It's like gravity or the wind: you can't see the wind, but you step forward trusting it will carry your kite when you let go!"
    ];
    
    const chosenMetaphor = metaphors[currentAttemptIndex % metaphors.length];

    const dynamicComprehensionQuestion = currentAttemptIndex === 1 
      ? "If you just stare at a door handle, how do you get to the other side? What physical action must you take?"
      : "If you want the wind to fly your kite, what must you physically do with the kite string?";
    
    setActiveComprehensionQuestion(dynamicComprehensionQuestion);

    const explanationInstructions = `
      The player is learning about ${conceptName}. This is attempt number ${currentAttemptIndex + 1}.
      IMPORTANT: Do not say "That's a great question" or acknowledge a user query.
      
      ${remedialPrompt ? `
        REMEDIAL TEACHING FOCUS:
        The child just answered a multiple-choice question incorrectly. ${remedialPrompt}
        Explain why their choice wasn't true ${conceptName}, and pivot to why the correct choice was. Keep it extremely encouraging!
        At the very end of your response, you MUST ask the child this exact comprehension question to verify they are reading: "${dynamicComprehensionQuestion}"
      ` : `
        INTRODUCTORY TEACHING FOCUS:
        Explain that the ancient Greek word for faith is "Pistis" (pronounced PEES-tis), which means active trust.
        Close or reinforce your lesson using this EXACT analogy: "${chosenMetaphor}".
      `}
      
      Keep the entire message warm, kind, and brief (maximum 3 sentences).
    `;

    try {
      const angelResponse = await askAngelGabriel(
        "user_123", 
        remedialPrompt ? "Teach me from my mistake!" : `Introduce ${conceptName} and Pistis dynamically.`, 
        explanationInstructions
      );
      
      if (angelResponse.reply) {
        setChatLog(prev => [...prev, { sender: 'angel', text: angelResponse.reply }]);
      } else {
        setChatLog(prev => [...prev, { sender: 'angel', text: `Remember, faith is active trust. ${chosenMetaphor}` }]);
      }

      const quizResponse = await generateAdaptiveQuestion(
        "user_123", 
        conceptName,
        correctRule,
        incorrectRule,
        remedialPrompt,
        currentAttemptIndex
      );
      
      if (quizResponse.questionData) {
        setCurrentQuestion(quizResponse.questionData as DynamicQuestion);
      }
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { sender: 'angel', text: `Let's think about this: faith is active trust. ${chosenMetaphor}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleChestClick = async () => {
    setStageState('lock-challenge');
    setExplanationAccepted(false);
    setVerificationState('none');
    setAttempts(0);
    setAngelChat("Hold on, Traveler! To unlock this chest, we must first learn what Faith truly is. Let me teach you...");
    await loadQuestionAndExplanation("", 0);
  };

  const handleAnswerSubmit = async (selectedOption: 'A' | 'B' | 'C') => {
    if (!currentQuestion) return;

    const chosenText = selectedOption === 'A' 
      ? currentQuestion.optionA 
      : (selectedOption === 'B' ? currentQuestion.optionB : currentQuestion.optionC);

    if (selectedOption === currentQuestion.correctOption) {
      setStageState('solved');
      addLog("Successfully broke the lock!", "system");
      setIsThinking(true);

      const successPrompt = `
        The player answered the question: "${currentQuestion.question}" correctly!
        They chose the correct answer: "${chosenText}".
        
        Write a very short, highly enthusiastic celebration (1-2 sentences).
        Briefly explain WHY this answer represents true faith (active trust) and congratulate them on breaking the lock.
        Keep it warm, fun, and extremely brief!
      `;

      try {
        const res = await askAngelGabriel("user_123", "Explain why my correct answer was right!", successPrompt);
        setIsThinking(false);
        if (res.reply) {
          setAngelChat(res.reply);
          setChatLog(prev => [...prev, { sender: 'angel', text: res.reply }]);
        } else {
          const fallbackMsg = `Spot on! You chose: "${chosenText}". That is true faith—not just looking at a path, but actually stepping out on it!`;
          setAngelChat(fallbackMsg);
          setChatLog(prev => [...prev, { sender: 'angel', text: fallbackMsg }]);
        }
      } catch (err) {
        setIsThinking(false);
        const fallbackMsg = `Spot on! You chose: "${chosenText}". That is true faith!`;
        setAngelChat(fallbackMsg);
        setChatLog(prev => [...prev, { sender: 'angel', text: fallbackMsg }]);
      }

    } else {
      const correctOptionLetter = currentQuestion.correctOption;
      const correctText = correctOptionLetter === 'A' 
        ? currentQuestion.optionA 
        : (correctOptionLetter === 'B' ? currentQuestion.optionB : currentQuestion.optionC);
      
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      
      setChallengeFeedback("Not quite! Angel Gabriel is testing your understanding in the chat before you can retry.");
      setExplanationAccepted(false); 
      setVerificationState('pending-chat'); 
      
      setAngelChat("That wasn't quite it, Messenger. Answer my question in the chat console on the right so we can clear this up!");

      const remedialPrompt = `
        The question asked was: "${currentQuestion.question}".
        The child chose: "${chosenText}" (which is incorrect because it is either passive head-knowledge or empty action).
        The correct concept was: "${correctText}" (representing active trust and loyalty).
        Explain to the child why their choice is not the fullness of faith, and why active trust is.
      `;
      
      await loadQuestionAndExplanation(remedialPrompt, nextAttempt);
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
        const res = await verifyComprehension(
          "user_123",
          activeComprehensionQuestion,
          currentQuestionText,
          "Faith is active trust, physically stepping forward, walking through a door, or letting go of a string."
        );
        setIsThinking(false);

        if (res.evaluation) {
          setChatLog(prev => [...prev, { sender: 'angel', text: res.evaluation.reply }]);
          
          if (res.evaluation.isUnderstood) {
            setVerificationState('none'); 
            setExplanationAccepted(true); 
            setChallengeFeedback("");
            setAngelChat("Fantastic understanding! Now, try answering this brand-new multiple choice challenge on the left.");
          }
        }
      } catch (err) {
        setIsThinking(false);
        setChatLog(prev => [...prev, { sender: 'angel', text: "I couldn't hear that clearly, but I believe in you! Let's try the next question." }]);
        setVerificationState('none');
        setExplanationAccepted(true);
      }
    } else {
      const getCorrectOptionText = () => {
        if (!currentQuestion) return "";
        if (currentQuestion.correctOption === 'A') return currentQuestion.optionA;
        if (currentQuestion.correctOption === 'B') return currentQuestion.optionB;
        return currentQuestion.optionC || "";
      };

      const chatContextPrompt = `
        Current Stage: The Crossroads (Faith/Pistis).
        The child is trying to answer a dynamic multiple choice question.
        Active question on screen: "${currentQuestion?.question}"
        Correct answer concept: "${getCorrectOptionText()}".
        Guide them towards the active option without stating the letters 'A', 'B', or 'C'.
      `;

      try {
        const res = await askAngelGabriel("user_123", currentQuestionText, chatContextPrompt);
        setIsThinking(false);

        if (res.error) {
          setChatLog(prev => [...prev, { sender: 'angel', text: res.error }]);
        } else if (res.reply) {
          setChatLog(prev => [...prev, { sender: 'angel', text: res.reply }]);
        }
      } catch (err) {
        setIsThinking(false);
        setChatLog(prev => [...prev, { sender: 'angel', text: "The static is too loud right now! Ask me again!" }]);
      }
    }
  };

  return (
    <div className="w-full h-full flex bg-slate-950 border-4 border-black overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl relative">
      
      {/* 🔴 LEFT SIDE: INTERACTIVE STAGE (60%) */}
      <div className="w-[60%] h-full bg-slate-900 relative flex flex-col items-center border-r-4 border-black text-white p-4">
        
        {/* TOP STATUS ROW */}
        <div className="w-full flex justify-between items-center bg-slate-800 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] shrink-0 mb-4 z-20">
          <div>
            <h3 className="text-[10px] font-black uppercase text-amber-400">Weapon Tracker</h3>
            <p className="text-xs font-bold text-slate-200">
              {stageState === 'solved' ? "Now faith is..." : "[ _ _ _ _ _ ]"}
            </p>
          </div>
          {stageState === 'lock-challenge' && (
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 border border-black rounded">
              <span className="text-xl">🔒</span>
              <span className="text-[10px] font-black uppercase text-amber-400">Lock Puzzle</span>
            </div>
          )}
        </div>

        {/* SCENE RENDERING AREA */}
        <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center">
          
          {/* STEP 1: RIDDLE INTRO (Movement locked) */}
          {stageState === 'riddle-intro' && (
            <div className="w-full max-w-md bg-amber-50 text-black border-4 border-black p-6 rounded-xl shadow-[6px_6px_0px_#000] animate-bounce-short text-center relative">
              <span className="text-5xl absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 p-2 rounded-full border-4 border-black shadow-[2px_2px_0px_#000]">📜</span>
              <h2 className="text-xl font-black uppercase text-amber-900 mt-4 mb-3">Ancient Message Decoded!</h2>
              <div className="bg-white border-2 border-black p-4 rounded-lg italic font-bold text-sm text-slate-800 leading-relaxed mb-6">
                "Where cobblestones end and hidden trails start,<br />
                Choose the path less traveled with all of your heart."
              </div>
              <button 
                onClick={() => {
                  setStageState('fork');
                  setAngelChat("Awesome! Now use your arrow keys or the D-Pad to step off the cobblestones and choose the correct trail!");
                }}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-3 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_#000] transition-transform active:translate-y-1 uppercase tracking-wider text-sm"
              >
                Begin Quest ➔
              </button>
            </div>
          )}

          {stageState === 'fork' && (
            <div className="relative w-full h-full flex">
              <div className="w-1/2 h-full bg-slate-800 border-r-4 border-black border-dashed flex items-center justify-center">
                <span className="text-slate-500 font-black uppercase rotate-[-45deg] tracking-wider">Paved Path</span>
              </div>
              <div className="w-1/2 h-full bg-amber-900/40 flex items-center justify-center">
                <span className="text-amber-600/80 font-black uppercase rotate-[45deg] tracking-wider">Dirt Path</span>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-24 h-24 drop-shadow-md animate-bounce">
                <img 
                  src={characterPath} 
                  alt="Player Character" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {stageState === 'ghosts' && (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-center p-8">
              <div className="flex gap-8 mb-8 text-6xl animate-pulse">
                <span>👻</span>
                <span className="mt-8">👻</span>
              </div>
              <div className="w-24 h-24 drop-shadow-md">
                <img 
                  src={characterPath} 
                  alt="Player Character" 
                  className="w-full h-full object-contain filter grayscale"
                />
              </div>
              <p className="mt-8 bg-red-600 text-white font-black p-4 border-4 border-black shadow-[4px_4px_0px_#000] uppercase tracking-wide">
                WRONG WAY! GO BACK DOWN!
              </p>
            </div>
          )}

          {stageState === 'x-marks' && (
            <div className="w-full h-full bg-amber-950/20 flex flex-col items-center justify-center">
              <button 
                onClick={() => {
                  setStageState('chest');
                  setAngelChat("You dug it up! It's a locked chest. Click on the chest to inspect the lock!");
                }}
                className="text-8xl hover:scale-110 transition-transform cursor-pointer drop-shadow-xl z-10"
              >
                ❌
              </button>
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="w-24 h-24 drop-shadow-md animate-pulse">
                  <img 
                    src={characterPath} 
                    alt="Player Character" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-4xl">⛏️</span>
              </div>
            </div>
          )}

          {stageState === 'chest' && (
            <div className="w-full h-full bg-amber-950/20 flex flex-col items-center justify-center">
              <button 
                onClick={handleChestClick}
                className="text-9xl hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-wiggle"
              >
                📦
              </button>
              <p className="mt-4 bg-slate-800 text-white border-2 border-black font-black px-4 py-2 uppercase shadow-[2px_2px_0px_#000]">
                Click to Open
              </p>
            </div>
          )}

          {/* 🔒 ADAPTIVE LEFT-SIDE LOCK CHALLENGE */}
          {stageState === 'lock-challenge' && currentQuestion && (
            <div className="w-full h-full flex flex-col justify-between animate-fade-in bg-slate-900 overflow-y-auto">
              
              <div className="border-b-2 border-slate-700 pb-2 mb-4 shrink-0">
                <h2 className="text-lg font-black uppercase text-amber-400 flex items-center gap-2">
                  <span>🔒</span> Break the Lock! {attempts > 0 && <span className="text-xs text-red-400 font-normal">(Attempt #{attempts + 1})</span>}
                </h2>
                <p className="text-xs text-slate-400">Explain Faith correctly to unlock the first Truth Scroll.</p>
              </div>

              {/* Devotional Locking Overlay */}
              <div className="flex-1 flex flex-col justify-center gap-4 relative">
                
                {/* Visual State: Unlocked vs Grayed Out */}
                <div className={`transition-all duration-300 ${explanationAccepted ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  
                  {/* Dynamic Question Text */}
                  <p className="font-bold text-base text-slate-100 leading-relaxed mb-4">
                    {currentQuestion.question}
                  </p>

                  {challengeFeedback && (
                    <div className="bg-red-950/80 border-2 border-red-500 text-red-200 font-bold p-2 text-xs rounded mb-3">
                      ⚠️ {challengeFeedback}
                    </div>
                  )}

                  {/* Dynamic Options */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleAnswerSubmit('A')}
                      className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3 font-bold text-xs shadow-[2px_2px_0px_#000] transition-colors rounded animate-fade-in"
                    >
                      A) {currentQuestion.optionA}
                    </button>
                    <button 
                      onClick={() => handleAnswerSubmit('B')}
                      className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3 font-bold text-xs shadow-[2px_2px_0px_#000] transition-colors rounded animate-fade-in"
                    >
                      B) {currentQuestion.optionB}
                    </button>
                    
                    {/* Only render Option C if it exists in the question data */}
                    {currentQuestion.optionC && (
                      <button 
                        onClick={() => handleAnswerSubmit('C')}
                        className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3 font-bold text-xs shadow-[2px_2px_0px_#000] transition-colors rounded animate-fade-in"
                      >
                        C) {currentQuestion.optionC}
                      </button>
                    )}
                  </div>
                </div>

                {/* Overlying Lesson Lock Card (Hides/grays out the question until okayed) */}
                {!explanationAccepted && (
                  <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center z-10 rounded">
                    <div className="bg-slate-800 border-2 border-black p-5 rounded-lg shadow-[4px_4px_0px_#000] max-w-sm">
                      <span className="text-4xl animate-bounce">👼</span>
                      <h3 className="font-black uppercase text-amber-400 text-sm mt-2 mb-1">
                        {verificationState === 'pending-chat' ? "Chat Challenge Active!" : "Divine Wisdom Required"}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {verificationState === 'pending-chat' 
                          ? "Explain the concept to Angel Gabriel in the Chat box on the right to unlock your retry!"
                          : "Read Angel Gabriel's dynamic lesson in the Chat Console on the right first!"
                        }
                      </p>
                      {verificationState !== 'pending-chat' && (
                        <button 
                          disabled={isThinking}
                          onClick={() => {
                            setExplanationAccepted(true);
                            setChallengeFeedback(""); 
                            setAngelChat("Ready to test your knowledge? Answer the fresh question on the left now!");
                          }}
                          className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-black text-xs py-2.5 px-6 rounded border-2 border-black shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 uppercase"
                        >
                          {isThinking ? "Angel is preparing explanation..." : "Okay, sounds good! 👍"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 text-center uppercase tracking-widest border-t border-slate-800 pt-2 mt-4 shrink-0">
                {verificationState === 'pending-chat' ? "👉 Type your answer in the console ➔" : "Need a hint? Ask Angel Gabriel on the right ➔"}
              </div>
            </div>
          )}

          {stageState === 'solved' && (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="bg-yellow-100 border-4 border-black p-8 shadow-[8px_8px_0px_#000] max-w-sm text-center animate-fade-in text-black">
                <h2 className="text-2xl font-black mb-2 uppercase tracking-wide text-amber-900">📜 SCROLL UNLOCKED</h2>
                <p className="text-xl font-bold italic text-slate-800">
                  "Now faith is..."
                </p>
              </div>
              <div className="w-28 h-28 mt-8 drop-shadow-xl animate-bounce">
                <img 
                  src={characterPath} 
                  alt="Player Character" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* D-PAD CONTROLS */}
        {(stageState === 'fork' || stageState === 'ghosts') && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 bg-slate-950 p-3 rounded-full border-4 border-black shadow-[0_4px_0_#000] z-20">
            <button 
              onClick={() => handleMove('UP')} 
              className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1 shadow-[1px_1px_0px_#000]"
            >
              ↑
            </button>
            <div className="flex gap-1">
              <button 
                onClick={() => handleMove('LEFT')} 
                className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1 shadow-[1px_1px_0px_#000]"
              >
                ←
              </button>
              <button 
                onClick={() => handleMove('DOWN')} 
                className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1 shadow-[1px_1px_0px_#000]"
              >
                ↓
              </button>
              <button 
                onClick={() => handleMove('RIGHT')} 
                className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1 shadow-[1px_1px_0px_#000]"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔵 RIGHT SIDE: ANGEL CONSOLE (40%) */}
      <div className="w-[40%] h-full bg-slate-200 flex flex-col">
        
        {/* Riddle Box */}
        <div className="p-4 border-b-4 border-black bg-white text-black">
          <h2 className="font-black text-sm uppercase mb-2">📜 Riddle</h2>
          <p className="text-xs font-bold italic text-slate-700">
            "Where cobblestones end and hidden trails start,<br/>
            Choose the path less traveled with all of your heart."
          </p>
        </div>

        {/* Chat with Angel */}
        <div className="flex-1 p-4 border-b-4 border-black overflow-y-auto bg-slate-100 flex flex-col gap-4">
          <h2 className="font-black text-sm uppercase bg-yellow-300 text-black inline-block px-2 border-2 border-black self-start">
            Chat with Angel 👼
          </h2>
          
          {/* Main Angel Clue Bubble */}
          <div className="bg-white text-black border-2 border-black p-3 rounded-r-xl rounded-bl-xl shadow-[2px_2px_0px_#000] text-sm font-bold self-start mr-8">
            {angelChat}
          </div>

          {/* Chat Feed */}
          {chatLog.map((msg, i) => (
            <div 
              key={i} 
              className={`border-2 border-black p-3 text-sm font-bold shadow-[2px_2px_0px_#000] max-w-[85%] ${
                msg.sender === 'you' 
                  ? 'bg-cyan-100 text-black rounded-l-xl rounded-br-xl self-end ml-8 text-right'
                  : 'bg-white text-black rounded-r-xl rounded-bl-xl self-start mr-8 text-left'
              }`}
            >
              <span className="text-[10px] block text-slate-500 uppercase mb-1">
                {msg.sender === 'you' ? 'You' : 'Angel Gabriel 👼'}
              </span>
              {msg.text}
            </div>
          ))}

          {/* ⏳ ANGEL IS THINKING/TYPING ANIMATION */}
          {isThinking && (
            <div className="bg-white text-black border-2 border-black p-3 rounded-r-xl rounded-bl-xl shadow-[2px_2px_0px_#000] text-sm font-bold self-start max-w-[80%] flex items-center gap-2 mr-8">
              <span className="text-[10px] block text-slate-500 uppercase">Angel Gabriel 👼</span>
              <span className="flex gap-1 items-center py-1">
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce"></span>
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          )}
        </div>

        {/* Ask Question Input */}
        <div className="p-4 bg-slate-300">
          <form onSubmit={handleAskGloo} className="flex gap-2">
            <input 
              type="text" 
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              disabled={isThinking}
              placeholder={
                isThinking 
                  ? "Angel is formulating..." 
                  : verificationState === 'pending-chat' 
                    ? "Type your answer to Gabriel..." 
                    : "Ask a question..."
              }
              className={`flex-1 bg-white text-black placeholder-slate-500 border-2 border-black p-2 text-sm font-bold disabled:bg-slate-100 disabled:cursor-not-allowed ${
                verificationState === 'pending-chat' ? 'ring-2 ring-yellow-500 animate-pulse' : ''
              }`}
            />
            <button 
              type="submit" 
              disabled={isThinking}
              className="bg-blue-500 text-white font-black px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-blue-400 active:translate-y-1 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {verificationState === 'pending-chat' ? "ANSWER" : "ASK"}
            </button>
          </form>
        </div>

        {/* Next Scene Button */}
        {stageState === 'solved' && (
           <div className="p-4 bg-green-400 border-t-4 border-black">
              <button 
                onClick={() => {
                  if (onComplete) onComplete();
                }}
                className="w-full bg-black text-white font-black py-3 uppercase shadow-[4px_4px_0px_#fff] border-2 border-white hover:bg-slate-800"
              >
                Continue to Hunger Trial ➔
              </button>
           </div>
        )}
      </div>

    </div>
  );
}