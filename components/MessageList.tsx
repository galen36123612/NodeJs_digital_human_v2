
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

/*import { Message } from "ai/react";
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

*/
/* Modify from this line 1105_v4 優化Microphone問題, 然後讓字keep在人型上，試圖修正重複輸入問題 1105*/
/*import { Message } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { User, Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);
  const lastMessageRef = useRef<string | null>(null);
  const lastTimestampRef = useRef<number>(0);

  // 處理重複訊息的函數
  const removeDuplicateMessages = (msgs: Message[]) => {
    const DUPLICATE_THRESHOLD = 1000; // 1秒內的重複消息將被過濾
    
    return msgs.filter((message, index) => {
      if (index === 0) return true;
      
      const prevMessage = msgs[index - 1];
      const isSameContent = message.content === prevMessage.content;
      const isSameRole = message.role === prevMessage.role;
      const timeDiff = new Date(message.id).getTime() - new Date(prevMessage.id).getTime();
      
      return !(isSameContent && isSameRole && timeDiff < DUPLICATE_THRESHOLD);
    });
  };

  // 處理訊息和滾動
  useEffect(() => {
    const filtered = removeDuplicateMessages(messages);
    setProcessedMessages(filtered);
  }, [messages]);

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
  }, [processedMessages, autoScroll]);

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
        WebkitOverflowScrolling: 'touch',
        position: 'relative' // 添加相對定位
      }}
    >
      {processedMessages.map((message: Message) => (
        <div 
          key={message.id} 
          className={`flex gap-3 items-start my-2 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
          style={{
            position: 'relative', // 確保訊息容器保持在正確位置
            zIndex: 1 // 確保訊息在上層
          }}
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
              style={{
                position: 'relative', // 確保文字容器定位正確
                zIndex: 2 // 確保文字在最上層
              }}
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
}*/

/* 1106 Add the messenge scroll ability*/


import { Message } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { User, Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // 處理重複訊息的函數
  const removeDuplicateMessages = (msgs: Message[]) => {
    const DUPLICATE_THRESHOLD = 1000;
    
    return msgs.filter((message, index) => {
      if (index === 0) return true;
      
      const prevMessage = msgs[index - 1];
      const isSameContent = message.content === prevMessage.content;
      const isSameRole = message.role === prevMessage.role;
      const timeDiff = new Date(message.id).getTime() - new Date(prevMessage.id).getTime();
      
      return !(isSameContent && isSameRole && timeDiff < DUPLICATE_THRESHOLD);
    });
  };

  // 處理訊息
  useEffect(() => {
    const filtered = removeDuplicateMessages(messages);
    setProcessedMessages(filtered);
  }, [messages]);

  // 滾動到底部的函數
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior
      });
    }
  };

  // 處理滾動事件
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    // 清除之前的 timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    setIsScrolling(true);
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 30;
    setAutoScroll(isNearBottom);

    // 設置新的 timeout 來處理滾動結束
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  // 自動滾動效果
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [processedMessages, autoScroll]);

  // 初始滾動
  useEffect(() => {
    scrollToBottom('auto');
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 min-h-[300px] max-h-[80vh] flex flex-col gap-3 overflow-y-auto overscroll-none px-4 scroll-smooth"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 transparent',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        position: 'relative',
        msOverflowStyle: '-ms-autohiding-scrollbar'
      }}
    >
      {/* 滾動指示器 */}
      {!autoScroll && !isScrolling && (
        <button
          onClick={() => {
            scrollToBottom();
            setAutoScroll(true);
          }}
          className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-all z-10"
          aria-label="Scroll to bottom"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </button>
      )}

      {processedMessages.map((message: Message) => (
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
          
          <div 
            className={`flex max-w-[80%] ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
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
