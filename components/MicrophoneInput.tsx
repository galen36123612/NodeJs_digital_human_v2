/*import { useRef, useState } from "react";

import Wave from "./Wave";
import { Microphone } from "@phosphor-icons/react";

export enum MicrophoneStatus {
  Listening,
  stopListening
}

interface MicrophoneInputProps {
  talking: boolean;
  contentChange?: (content: string) => void;
  onSubmit?: (content: string) => void;
  onStopPlay?: () => void;
  onStatusChange?: (status: MicrophoneStatus) => void;
}

const SpeechRecognition =
  globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

export default function MicrophoneInput({
  talking = false,
  contentChange,
  onSubmit,
  onStopPlay,
  onStatusChange
}: MicrophoneInputProps) {
  const firstflag = useRef(true);
  let recognition = useRef<SpeechRecognition>();

  const [play, setPlay] = useState<boolean>(false);
  const handlerStop = () => {
    setPlay(false);
    onStopPlay && onStopPlay();
  };

  const startPlay = () => {
    if (play) return;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.lang = "zh";
    recognition.current.interimResults = true;
    recognition.current.maxAlternatives = 1;
    recognition.current.onresult = function (event) {
      const item = event.results[0];

      console.info(
        "Result received: " + item[0].transcript + " ." + item[0].confidence,
      );
      contentChange && contentChange(item[0].transcript);
      if (item.isFinal) {
        recognition.current?.stop();
        onSubmit && onSubmit(item[0].transcript);
      }
    };
    recognition.current.onstart = function () {
      console.log("start");
      onStatusChange && onStatusChange(MicrophoneStatus.Listening);
    };
    recognition.current.onend = function () {
      setPlay(false);
      console.log("end");
      onStatusChange && onStatusChange(MicrophoneStatus.stopListening)
    };
    recognition.current.onspeechend = function () {
      recognition.current!.stop();
    };

    recognition.current.onerror = function (event) {
      console.error("Error occurred in recognition: " + event.error);
    };
    recognition.current.start();
    setPlay(true);
  };

  return (
    <button
      className="w-full p-1 flex flex-row justify-center bg-default-100 items-center gap-4 overflow-hidden color-inherit subpixel-antialiased rounded-md bg-background/10 backdrop-blur backdrop-saturate-150"
      onClick={startPlay}
    >
      <Microphone fontSize={28} color={play ? "#1f94ea" : "white"} />
      <Wave play={play} />
    </button>
  );
}*/

/*modify from this line 1105 Android can work but Too short*/
/*import { useRef, useState, useEffect } from "react";
import Wave from "./Wave";
import { Microphone } from "@phosphor-icons/react";

export enum MicrophoneStatus {
  Listening,
  stopListening,
  NotSupported,
  NoPermission,
  Error
}

interface MicrophoneInputProps {
  talking: boolean;
  contentChange?: (content: string) => void;
  onSubmit?: (content: string) => void;
  onStopPlay?: () => void;
  onStatusChange?: (status: MicrophoneStatus) => void;
}

// 檢查瀏覽器支持
const checkSpeechRecognitionSupport = () => {
  return !!(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition
  );
};

// 獲取 SpeechRecognition 實例
const getSpeechRecognition = () => {
  return window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition;
};

export default function MicrophoneInput({
  talking = false,
  contentChange,
  onSubmit,
  onStopPlay,
  onStatusChange
}: MicrophoneInputProps) {
  const firstflag = useRef(true);
  const recognition = useRef<any>();
  const [play, setPlay] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 檢查瀏覽器支持
  useEffect(() => {
    const supported = checkSpeechRecognitionSupport();
    setIsSupported(supported);
    if (!supported) {
      setErrorMessage("您的瀏覽器不支持語音識別功能");
      onStatusChange?.(MicrophoneStatus.NotSupported);
    }
  }, []);

  const handlerStop = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setPlay(false);
    onStopPlay?.();
  };

  const startPlay = async () => {
    if (play) return;
    
    // 檢查麥克風權限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // 立即停止流，我們只是檢查權限
    } catch (err) {
      setErrorMessage("無法訪問麥克風，請檢查權限設置");
      onStatusChange?.(MicrophoneStatus.NoPermission);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setErrorMessage("您的瀏覽器不支持語音識別功能");
      onStatusChange?.(MicrophoneStatus.NotSupported);
      return;
    }

    try {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.lang = "zh-TW"; // 使用繁體中文
      recognition.current.interimResults = true;
      recognition.current.maxAlternatives = 1;

      recognition.current.onresult = function (event: any) {
        const results = event.results;
        const item = results[results.length - 1];
        
        if (item) {
          console.info(
            "Result received: " + item[0].transcript + " ." + item[0].confidence
          );
          contentChange?.(item[0].transcript);
          
          if (item.isFinal) {
            recognition.current?.stop();
            onSubmit?.(item[0].transcript);
          }
        }
      };

      recognition.current.onstart = function () {
        console.log("錄音開始");
        setPlay(true);
        onStatusChange?.(MicrophoneStatus.Listening);
      };

      recognition.current.onend = function () {
        console.log("錄音結束");
        setPlay(false);
        onStatusChange?.(MicrophoneStatus.stopListening);
      };

      recognition.current.onerror = function (event: any) {
        console.error("識別錯誤: ", event.error);
        setErrorMessage(getErrorMessage(event.error));
        onStatusChange?.(MicrophoneStatus.Error);
        setPlay(false);
      };

      recognition.current.start();
    } catch (err) {
      console.error("初始化語音識別失敗:", err);
      setErrorMessage("語音識別初始化失敗");
      onStatusChange?.(MicrophoneStatus.Error);
    }
  };

  // 錯誤訊息轉換
  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'network':
        return '網絡錯誤';
      case 'no-speech':
        return '沒有檢測到語音';
      case 'aborted':
        return '錄音被中止';
      case 'audio-capture':
        return '無法捕獲音頻';
      case 'not-allowed':
        return '麥克風權限被拒絕';
      default:
        return '發生未知錯誤';
    }
  };

  return (
    <div className="w-full relative">
      <button
        className={`w-full p-1 flex flex-row justify-center items-center gap-4 overflow-hidden color-inherit subpixel-antialiased rounded-md backdrop-blur backdrop-saturate-150 ${
          isSupported ? 'bg-default-100 bg-background/10' : 'bg-gray-500'
        }`}
        onClick={startPlay}
        disabled={!isSupported || talking}
      >
        <Microphone 
          fontSize={28} 
          color={play ? "#1f94ea" : isSupported ? "white" : "#666"} 
        />
        <Wave play={play} />
      </button>
      {errorMessage && (
        <div className="absolute top-full left-0 w-full mt-1 text-sm text-red-500 text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

// 為了 TypeScript 支持
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
  }
}*/

/* modify from this line 1105 Android chrome suitable but extend the time*/
/*import { useRef, useState, useEffect } from "react";
import Wave from "./Wave";
import { Microphone } from "@phosphor-icons/react";

export enum MicrophoneStatus {
  Listening,
  stopListening,
  NotSupported,
  NoPermission,
  Error
}

interface MicrophoneInputProps {
  talking: boolean;
  contentChange?: (content: string) => void;
  onSubmit?: (content: string) => void;
  onStopPlay?: () => void;
  onStatusChange?: (status: MicrophoneStatus) => void;
}

// 檢查瀏覽器支持
const checkSpeechRecognitionSupport = () => {
  return !!(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition
  );
};

// 獲取 SpeechRecognition 實例
const getSpeechRecognition = () => {
  return window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition;
};

export default function MicrophoneInput({
  talking = false,
  contentChange,
  onSubmit,
  onStopPlay,
  onStatusChange
}: MicrophoneInputProps) {
  const firstflag = useRef(true);
  const recognition = useRef<any>();
  const [play, setPlay] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const currentTranscript = useRef<string>("");

  // 檢查瀏覽器支持
  useEffect(() => {
    const supported = checkSpeechRecognitionSupport();
    setIsSupported(supported);
    if (!supported) {
      setErrorMessage("您的瀏覽器不支持語音識別功能");
      onStatusChange?.(MicrophoneStatus.NotSupported);
    }
  }, []);

  const handlerStop = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setPlay(false);
    onStopPlay?.();
    // 提交最後累積的文字
    if (currentTranscript.current) {
      onSubmit?.(currentTranscript.current);
      currentTranscript.current = "";
    }
  };

  const startPlay = async () => {
    if (play) {
      handlerStop();
      return;
    }
    
    // 檢查麥克風權限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setErrorMessage("無法訪問麥克風，請檢查權限設置");
      onStatusChange?.(MicrophoneStatus.NoPermission);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setErrorMessage("您的瀏覽器不支持語音識別功能");
      onStatusChange?.(MicrophoneStatus.NotSupported);
      return;
    }

    try {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.lang = "zh-TW";
      recognition.current.interimResults = true;
      recognition.current.maxAlternatives = 1;

      recognition.current.onresult = function (event: any) {
        const results = event.results;
        const item = results[results.length - 1];
        
        if (item) {
          const transcript = item[0].transcript;
          console.info(
            "Result received: " + transcript + " ." + item[0].confidence
          );
          
          if (item.isFinal) {
            // 將最終結果累加到當前轉錄文字中
            currentTranscript.current += transcript + " ";
            contentChange?.(currentTranscript.current);
          } else {
            // 顯示臨時結果
            contentChange?.(currentTranscript.current + transcript);
          }
        }
      };

      recognition.current.onstart = function () {
        console.log("錄音開始");
        setPlay(true);
        onStatusChange?.(MicrophoneStatus.Listening);
        currentTranscript.current = ""; // 重置轉錄文字
      };

      recognition.current.onend = function () {
        console.log("錄音結束");
        // 如果仍在播放狀態，自動重新開始錄音
        if (play) {
          recognition.current.start();
        } else {
          setPlay(false);
          onStatusChange?.(MicrophoneStatus.stopListening);
        }
      };

      recognition.current.onerror = function (event: any) {
        console.error("識別錯誤: ", event.error);
        setErrorMessage(getErrorMessage(event.error));
        onStatusChange?.(MicrophoneStatus.Error);
        setPlay(false);
      };

      recognition.current.start();
    } catch (err) {
      console.error("初始化語音識別失敗:", err);
      setErrorMessage("語音識別初始化失敗");
      onStatusChange?.(MicrophoneStatus.Error);
    }
  };

  // 錯誤訊息轉換
  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'network':
        return '網絡錯誤';
      case 'no-speech':
        return '沒有檢測到語音';
      case 'aborted':
        return '錄音被中止';
      case 'audio-capture':
        return '無法捕獲音頻';
      case 'not-allowed':
        return '麥克風權限被拒絕';
      default:
        return '發生未知錯誤';
    }
  };

  return (
    <div className="w-full relative">
      <button
        className={`w-full p-1 flex flex-row justify-center items-center gap-4 overflow-hidden color-inherit subpixel-antialiased rounded-md backdrop-blur backdrop-saturate-150 ${
          isSupported ? 'bg-default-100 bg-background/10' : 'bg-gray-500'
        }`}
        onClick={startPlay}
        disabled={!isSupported || talking}
      >
        <Microphone 
          fontSize={28} 
          color={play ? "#1f94ea" : isSupported ? "white" : "#666"} 
        />
        <Wave play={play} />
      </button>
      {errorMessage && (
        <div className="absolute top-full left-0 w-full mt-1 text-sm text-red-500 text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
  }
}
*/

/* MODIFY from this line 1105 user can stop the record anytime*/
/*import { useRef, useState, useEffect } from "react";
import Wave from "./Wave";
import { Microphone, StopCircle } from "@phosphor-icons/react";

export enum MicrophoneStatus {
  Listening,
  stopListening,
  NotSupported,
  NoPermission,
  Error
}

interface MicrophoneInputProps {
  talking: boolean;
  contentChange?: (content: string) => void;
  onSubmit?: (content: string) => void;
  onStopPlay?: () => void;
  onStatusChange?: (status: MicrophoneStatus) => void;
}

// 檢查瀏覽器支持
const checkSpeechRecognitionSupport = () => {
  return !!(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition
  );
};

// 獲取 SpeechRecognition 實例
const getSpeechRecognition = () => {
  return window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition;
};

export default function MicrophoneInput({
  talking = false,
  contentChange,
  onSubmit,
  onStopPlay,
  onStatusChange
}: MicrophoneInputProps) {
  const firstflag = useRef(true);
  const recognition = useRef<any>();
  const [play, setPlay] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentTranscript, setCurrentTranscript] = useState<string>("");

  // 檢查瀏覽器支持
  useEffect(() => {
    const supported = checkSpeechRecognitionSupport();
    setIsSupported(supported);
    if (!supported) {
      setErrorMessage("您的瀏覽器不支持語音識別功能");
      onStatusChange?.(MicrophoneStatus.NotSupported);
    }
  }, []);

  // 清理函數
  useEffect(() => {
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const handlerStop = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setPlay(false);
    // 在停止時提交當前的轉錄內容
    if (currentTranscript) {
      onSubmit?.(currentTranscript);
    }
    setCurrentTranscript("");
    onStopPlay?.();
  };

  const startPlay = async () => {
    if (play) {
      handlerStop();
      return;
    }
    
    // 檢查麥克風權限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setErrorMessage("無法訪問麥克風，請檢查權限設置");
      onStatusChange?.(MicrophoneStatus.NoPermission);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setErrorMessage("您的瀏覽器不支持語音識別功能");
      onStatusChange?.(MicrophoneStatus.NotSupported);
      return;
    }

    try {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.lang = "zh-TW";
      recognition.current.interimResults = true;
      recognition.current.maxAlternatives = 1;

      recognition.current.onresult = function (event: any) {
        const results = event.results;
        const item = results[results.length - 1];
        
        if (item) {
          const transcript = item[0].transcript;
          console.info(
            "Result received: " + transcript + " ." + item[0].confidence
          );
          
          setCurrentTranscript(transcript);
          contentChange?.(transcript);
          
          // 移除自動停止，讓使用者手動控制
          // if (item.isFinal) {
          //   recognition.current?.stop();
          //   onSubmit?.(transcript);
          // }
        }
      };

      recognition.current.onstart = function () {
        console.log("錄音開始");
        setPlay(true);
        onStatusChange?.(MicrophoneStatus.Listening);
      };

      recognition.current.onend = function () {
        console.log("錄音結束");
        setPlay(false);
        onStatusChange?.(MicrophoneStatus.stopListening);
      };

      recognition.current.onerror = function (event: any) {
        console.error("識別錯誤: ", event.error);
        setErrorMessage(getErrorMessage(event.error));
        onStatusChange?.(MicrophoneStatus.Error);
        setPlay(false);
      };

      recognition.current.start();
    } catch (err) {
      console.error("初始化語音識別失敗:", err);
      setErrorMessage("語音識別初始化失敗");
      onStatusChange?.(MicrophoneStatus.Error);
    }
  };

  // 錯誤訊息轉換
  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'network':
        return '網絡錯誤';
      case 'no-speech':
        return '沒有檢測到語音';
      case 'aborted':
        return '錄音被中止';
      case 'audio-capture':
        return '無法捕獲音頻';
      case 'not-allowed':
        return '麥克風權限被拒絕';
      default:
        return '發生未知錯誤';
    }
  };

  return (
    <div className="w-full relative">
      <button
        className={`w-full p-1 flex flex-row justify-center items-center gap-4 overflow-hidden color-inherit subpixel-antialiased rounded-md backdrop-blur backdrop-saturate-150 ${
          isSupported ? 'bg-default-100 bg-background/10' : 'bg-gray-500'
        }`}
        onClick={startPlay}
        disabled={!isSupported || talking}
      >
        {play ? (
          <StopCircle 
            fontSize={28} 
            color="#ff4444"
          />
        ) : (
          <Microphone 
            fontSize={28} 
            color={isSupported ? "white" : "#666"} 
          />
        )}
        <Wave play={play} />
      </button>
      {errorMessage && (
        <div className="absolute top-full left-0 w-full mt-1 text-sm text-red-500 text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

// 為了 TypeScript 支持
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
  }
}*/

/* 1106 Android + keep 2s + send straight */


import { useRef, useState, useEffect } from "react";
import Wave from "./Wave";
import { Microphone, StopCircle } from "lucide-react";

export enum MicrophoneStatus {
  Listening,
  StopListening,
  NotSupported,
  NoPermission,
  Error
}

interface MicrophoneInputProps {
  talking: boolean;
  contentChange?: (content: string) => void;
  onSubmit?: (content: string) => void;
  onStopPlay?: () => void;
  onStatusChange?: (status: MicrophoneStatus) => void;
  delayBeforeSubmit?: number; // Time in milliseconds to wait before submitting
}

const checkSpeechRecognitionSupport = () => {
  return !!(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition
  );
};

const getSpeechRecognition = () => {
  return window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition;
};

export default function MicrophoneInput({
  talking = false,
  contentChange,
  onSubmit,
  onStopPlay,
  onStatusChange,
  delayBeforeSubmit = 2000 // Default 2 second delay
}: MicrophoneInputProps) {
  const recognition = useRef<any>();
  const submitTimeout = useRef<NodeJS.Timeout>();
  const [play, setPlay] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [showingTranscript, setShowingTranscript] = useState<boolean>(false);

  useEffect(() => {
    const supported = checkSpeechRecognitionSupport();
    setIsSupported(supported);
    if (!supported) {
      setErrorMessage("您的瀏覽器不支持語音識別功能");
      onStatusChange?.(MicrophoneStatus.NotSupported);
    }

    // Clean up on unmount
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (submitTimeout.current) {
        clearTimeout(submitTimeout.current);
      }
    };
  }, []);

  const handleSubmitWithDelay = (transcript: string) => {
    setShowingTranscript(true);
    
    // Clear any existing timeout
    if (submitTimeout.current) {
      clearTimeout(submitTimeout.current);
    }
    
    // Set new timeout for delayed submission
    submitTimeout.current = setTimeout(() => {
      onSubmit?.(transcript);
      setShowingTranscript(false);
      setCurrentTranscript("");
    }, delayBeforeSubmit);
  };

  const handlerStop = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setPlay(false);
    
    if (currentTranscript) {
      handleSubmitWithDelay(currentTranscript);
    }
    
    onStopPlay?.();
  };

  const startPlay = async () => {
    if (play) {
      handlerStop();
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setErrorMessage("無法訪問麥克風，請檢查權限設置");
      onStatusChange?.(MicrophoneStatus.NoPermission);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setErrorMessage("您的瀏覽器不支持語音識別功能");
      onStatusChange?.(MicrophoneStatus.NotSupported);
      return;
    }

    try {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.lang = "zh-TW";
      recognition.current.interimResults = true;
      recognition.current.maxAlternatives = 1;

      recognition.current.onresult = function (event: any) {
        const results = event.results;
        const item = results[results.length - 1];
        
        if (item) {
          const transcript = item[0].transcript;
          setCurrentTranscript(transcript);
          contentChange?.(transcript);
        }
      };

      recognition.current.onstart = function () {
        setPlay(true);
        onStatusChange?.(MicrophoneStatus.Listening);
      };

      recognition.current.onend = function () {
        setPlay(false);
        onStatusChange?.(MicrophoneStatus.StopListening);
      };

      recognition.current.onerror = function (event: any) {
        setErrorMessage(getErrorMessage(event.error));
        onStatusChange?.(MicrophoneStatus.Error);
        setPlay(false);
      };

      recognition.current.start();
    } catch (err) {
      setErrorMessage("語音識別初始化失敗");
      onStatusChange?.(MicrophoneStatus.Error);
    }
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'network':
        return '網絡錯誤';
      case 'no-speech':
        return '沒有檢測到語音';
      case 'aborted':
        return '錄音被中止';
      case 'audio-capture':
        return '無法捕獲音頻';
      case 'not-allowed':
        return '麥克風權限被拒絕';
      default:
        return '發生未知錯誤';
    }
  };

  return (
    <div className="w-full relative">
      {showingTranscript && currentTranscript && (
        <div className="absolute -top-16 left-0 w-full text-center bg-black/50 p-2 rounded text-white">
          {currentTranscript}
        </div>
      )}
      <button
        className={`w-full p-1 flex flex-row justify-center items-center gap-4 overflow-hidden color-inherit subpixel-antialiased rounded-md backdrop-blur backdrop-saturate-150 ${
          isSupported ? 'bg-default-100 bg-background/10' : 'bg-gray-500'
        }`}
        onClick={startPlay}
        disabled={!isSupported || talking}
      >
        {play ? (
          <StopCircle 
            size={28}
            className="text-red-500"
          />
        ) : (
          <Microphone 
            size={28}
            className={isSupported ? "text-white" : "text-gray-600"}
          />
        )}
        <Wave play={play} />
      </button>
      {errorMessage && (
        <div className="absolute top-full left-0 w-full mt-1 text-sm text-red-500 text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
  }
}
