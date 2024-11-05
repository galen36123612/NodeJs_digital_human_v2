
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


//Modify from this line 1105_v3 新增訊息上下滾動功能

import { Message } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { User, Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior
      });
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 30;
    setAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 min-h-[300px] max-h-[80vh] flex flex-col gap-3 overflow-y-auto overscroll-none px-4"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 transparent',
        WebkitOverflowScrolling: 'touch', // 為 iOS 提供平滑滾動
      }}
    >
      {messages.map((message: Message) => (
        <div 
          key={message.id} 
          className={`flex gap-3 items-start my-2 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/80 backdrop-blur shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}
          
          <div className={`flex max-w-[80%] ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            <div
              className={`rounded-2xl px-4 py-3 text-base whitespace-pre-wrap break-words
                ${message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
                }
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
    </div>
  );
}
