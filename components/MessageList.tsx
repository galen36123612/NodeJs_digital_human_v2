
//import { Message } from "ai/react";
//import { useEffect, useRef } from "react";
//interface MessageListProps {
//  messages: Message[];
//}

//export default function MessageList({ messages }: MessageListProps) {
//  const view = useRef<HTMLDivElement>(null);

//  useEffect(() => {
//    view.current!.scrollIntoView(false);
//  }, [messages]);

//  return (
//    <div ref={view} className="w-full border-none flex flex-col gap-1">
//      {messages.map((message: Message) => (
//        <div key={message.id} className="flex flex-row ">
//          {/* <span className="w-16 after:content-[':']">{message.role}</span> */}
//          <span className="flex-1 backdrop-blur-sm bg-white/10 rounded-md text-lg p-1 ">
//            {message.content}
//          </span>
//        </div>
//      ))}
//    </div>
//  );
//}


//Modify from this line 1105 新增訊息上下滾動功能

import { Message } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { User, Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior,
        block: 'end',
      });
    }
  };

  // 監聽滾動事件，決定是否要自動滾動
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // 如果用戶滾動到底部附近（允許 100px 的誤差），啟用自動滾動
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  // 當新消息到達時的滾動處理
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages]);

  // 組件掛載時滾動到底部
  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-full border-none flex flex-col gap-3 overflow-y-auto overscroll-contain px-4 md:px-6"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 transparent'
      }}
    >
      {/* 頂部留白，提供更好的滾動體驗 */}
      <div className="h-4" />
      
      {messages.map((message: Message) => (
        <div 
          key={message.id} 
          className={`flex gap-2 md:gap-4 animate-fade-in ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center bg-blue-500/80 backdrop-blur">
              <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          )}
          
          <div 
            className={`flex flex-1 max-w-[85%] md:max-w-[75%] ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-2xl px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base 
                ${message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'backdrop-blur bg-white/10'
                }
                shadow-sm transition-colors
                break-words
              `}
            >
              {message.content}
            </div>
          </div>

          {message.role === 'user' && (
            <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center bg-emerald-500/80 backdrop-blur">
              <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          )}
        </div>
      ))}
      
      {/* 底部留白和滾動錨點 */}
      <div className="h-4" />
      <div ref={bottomRef} className="h-px" />
    </div>
  );
}

