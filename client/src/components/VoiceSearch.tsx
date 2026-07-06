import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({
  value,
  onChange,
  onSearch,
  placeholder
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      // Set language code based on current app language
      rec.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        if (onSearch) {
          // Add brief delay to let state resolve
          setTimeout(() => onSearch(), 200);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Voice search is not supported in this browser. Please try Chrome or Safari.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-4 text-slate-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch()}
        placeholder={placeholder || t('searchPlaceholder')}
        className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400"
      />
      <button
        type="button"
        onClick={toggleListening}
        className={`absolute right-3 p-2.5 rounded-xl transition-all duration-300 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        title={t('voiceSearchTip')}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-slate-500" />}
      </button>
    </div>
  );
};
