import React from 'react';

interface ChatMessage {
  sender: 'you' | 'angel';
  text: string;
}

interface AngelConsoleProps {
  angelChat: string;
  chatLog: ChatMessage[];
  isThinking: boolean;
  askInput: string;
  setAskInput: (val: string) => void;
  handleAskGloo: (e: React.FormEvent) => void;
  verificationState: 'none' | 'pending-chat';
  stageState: string;
  onComplete?: () => void;
}

export default function AngelConsole({
  angelChat,
  chatLog,
  isThinking,
  askInput,
  setAskInput,
  handleAskGloo,
  verificationState,
  stageState,
  onComplete
}: AngelConsoleProps) {
  return (
    <div className="w-[40%] h-full bg-slate-200 flex flex-col border-l-4 border-black">
      
      {/* Riddle Box */}
      <div className="p-4 border-b-4 border-black bg-white text-black shrink-0">
        <h2 className="font-black text-sm uppercase mb-2">📜 Riddle</h2>
        <p className="text-xs font-bold italic text-slate-700">
          "Where cobblestones end and hidden trails start,<br/>
          Choose the path less traveled with all of your heart."
        </p>
      </div>

      {/* Chat Log */}
      <div className="flex-1 p-4 border-b-4 border-black overflow-y-auto bg-slate-100 flex flex-col gap-4">
        <h2 className="font-black text-sm uppercase bg-yellow-300 text-black inline-block px-2 border-2 border-black self-start">
          Chat with Angel 👼
        </h2>
        
        <div className="bg-white text-black border-2 border-black p-3 rounded-r-xl rounded-bl-xl shadow-[2px_2px_0px_#000] text-sm font-bold self-start mr-8">
          {angelChat}
        </div>

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

      {/* Input Box */}
      <div className="p-4 bg-slate-300 shrink-0">
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

      {/* Continue Button */}
      {stageState === 'solved' && (
         <div className="p-4 bg-green-400 border-t-4 border-black shrink-0">
            <button 
              onClick={() => { if (onComplete) onComplete(); }}
              className="w-full bg-black text-white font-black py-3 uppercase shadow-[4px_4px_0px_#fff] border-2 border-white hover:bg-slate-800"
            >
              Continue to Hunger Trial ➔
            </button>
         </div>
      )}
    </div>
  );
}