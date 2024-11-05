
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


//Modify from this line 1105_v2 新增訊息上下滾動功能

import { Message } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { User, Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 平滑滾動到底部
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior
      });
    }
  };

  // 監聽滾動事件，決定是否要自動滾動
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // 如果用戶滾動到底部附近（允許 30px 的誤差），啟用自動滾動
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 30;
    setAutoScroll(isNearBottom);
  };

  // 當新消息到達時，如果啟用了自動滾動，則滾動到底部
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  // 組件初始化時滾動到底部
  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-[600px] flex flex-col gap-3 overflow-y-auto px-4 scroll-smooth"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 transparent',
      }}
    >
      {/* 頂部留白 */}
      <div className="h-4" />
      
      {messages.map((message: Message) => (
        <div 
          key={message.id} 
          className={`flex gap-3 items-start animate-fade-in ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/80 backdrop-blur shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}
          
          <div className={`flex max-w-[75%] ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            <div
              className={`rounded-lg px-4 py-2.5 text-base break-words
                ${message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'backdrop-blur bg-white/10'
                }
                shadow-sm
              `}
            >
              {message.content}
            </div>
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/80 backdrop-blur shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      ))}
      
      {/* 底部留白 */}
      <div className="h-4" />
    </div>
  );
}

