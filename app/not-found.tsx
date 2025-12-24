"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Minus, Square, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TerminalLine = {
  type: 'input' | 'output' | 'system';
  content: string | React.ReactNode;
  id: string;
};

const COMMANDS = {
  help: `Available Commands:
  help      - このヘルプメッセージを表示します
  dir       - ディレクトリ内のファイル一覧を表示します
  type      - ファイルの中身を表示します (例: type filename)
  cls       - 画面をクリアします
  whoami    - ユーザー情報を表示します
  date      - 現在の日時を表示します
  home      - ブログのトップページに戻ります
  reboot    - システムを再起動してトップページに戻ります`,
  ls: 'secret_plans.txt  cat_photos.jpg  system_logs.log  config.json',
  dir: ' Volume in drive C has no label.\n Volume Serial Number is 404-DEAD-BEEF\n\n Directory of C:\\Users\\Guest\n\n[.]                 [..]                secret_plans.txt\ncat_photos.jpg      system_logs.log     config.json\n               4 File(s)          1,337 bytes\n               2 Dir(s)  99,999,999 bytes free',
  whoami: 'guest_user\\404_void',
  date: new Date().toString(),
  home: 'Initiating return sequence...',
  reboot: 'Rebooting system...',
};

const SECRET_FILES = {
  'secret_plans.txt': 'TOP SECRET: The plan is to create the coolest blog ever.',
  'cat_photos.jpg': '(=^･^=) Meow!',
  'system_logs.log': 'ERROR: Page not found.\nERROR: Navigation lost.\nWARNING: Coffee levels critical.',
  'config.json': '{ "theme": "dark", "fun_level": 100 }'
};

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'Microsoft Windows [Version 10.0.19045.3693]', id: 'init-1' },
    { type: 'system', content: '(c) Microsoft Corporation. All rights reserved.', id: 'init-2' },
    { type: 'system', content: '', id: 'init-gap' },
  ]);
  const [isGlitching, setIsGlitching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const parts = trimmedCmd.split(' ');
    const command = parts[0];
    const arg = parts[1];

    const newHistory: TerminalLine[] = [
      ...history,
      { type: 'input', content: cmd, id: Date.now().toString() + '-input' }
    ];

    let output: string | React.ReactNode = '';

    switch (command) {
      case 'help':
        output = <pre className="whitespace-pre-wrap font-inherit">{COMMANDS.help}</pre>;
        break;
      case 'ls': // Alias
      case 'dir':
        output = <pre className="whitespace-pre-wrap font-inherit">{COMMANDS.dir}</pre>;
        break;
      case 'whoami':
        output = COMMANDS.whoami;
        break;
      case 'date':
        output = new Date().toLocaleString();
        break;
      case 'cls': // Windows clear
      case 'clear':
        setHistory([]);
        return;
      case 'home':
      case 'exit':
        output = 'Initiating return sequence...';
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
        break;
      case 'reboot':
        output = 'System rebooting...';
        setIsGlitching(true);
        setTimeout(() => {
            window.location.href = '/';
        }, 800);
        break;
      case 'type':
      case 'cat': // Alias
        if (arg && SECRET_FILES[arg as keyof typeof SECRET_FILES]) {
          output = SECRET_FILES[arg as keyof typeof SECRET_FILES];
        } else if (arg) {
          output = `The system cannot find the file specified.`;
        } else {
          output = 'Usage: type [filename]';
        }
        break;
      case '':
        output = '';
        break;
      default:
        output = `'${command}' is not recognized as an internal or external command,\noperable program or batch file.`;
    }

    if (output) {
      newHistory.push({ type: 'output', content: output, id: Date.now().toString() + '-output' });
    }

    setHistory(newHistory);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] overflow-hidden font-mono text-sm sm:text-base pt-20">
      
      {/* Windows 10/11 Inspired Background */}
      <div className="absolute inset-0 bg-[#000000] -z-20" /> 
      {/* Deep Blue Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#000000] opacity-80 -z-20" />
      {/* Windows "Bloom" / Light Effect */}
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] bg-[#0078D7] rounded-full blur-[150px] -z-10 -translate-x-[40%] -translate-y-1/2 opacity-30 pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#5b21b6] rounded-full blur-[120px] -z-10 translate-x-1/3 translate-y-1/3 opacity-20 pointer-events-none" />

      {/* 404 Header "BSOD" Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-[8rem] leading-none font-bold font-outfit text-white/10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 blur-sm scale-150 pointer-events-none">
            404
        </h1>
        <div className="flex flex-col items-center gap-2">
            <span className="text-6xl mb-2 text-white">:(</span>
            <h2 className="text-4xl font-bold text-white tracking-wide">404 Not Found</h2>
            <p className="text-blue-200/80 mt-2 text-lg">
                問題が発生したため、ページを表示できませんでした。
            </p>
        </div>
      </motion.div>

      {/* Main Command Prompt Window */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`relative z-10 w-full max-w-4xl flex flex-col shadow-2xl ${isGlitching ? 'translate-x-1' : ''}`}
        style={{ fontFamily: 'Consolas, "Lucida Console", monospace' }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Window Title Bar */}
        <div className="flex items-center justify-between h-8 bg-white text-black select-none px-2 border-b border-gray-400">
            <div className="flex items-center gap-2">
                <span className="text-xs font-normal">Command Prompt</span>
            </div>
            <div className="flex items-center">
                <button className="w-8 h-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Minus size={12} strokeWidth={1.5} />
                </button>
                <button className="w-8 h-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Square size={10} strokeWidth={1.5} />
                </button>
                <button 
                    className="w-10 h-full flex items-center justify-center hover:bg-[#e81123] hover:text-white transition-colors"
                    onClick={() => router.push('/')}
                >
                    <X size={14} strokeWidth={1.5} />
                </button>
            </div>
        </div>

        {/* Terminal Body */}
        <div ref={scrollRef} className="h-[500px] bg-[#0c0c0c] text-[#cccccc] p-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-[#0c0c0c] border border-gray-600 font-medium text-[15px] leading-snug">
            
            {/* History */}
            <div className="">
                {history.map((line) => (
                    <div key={line.id} className="break-words">
                        {line.type === 'input' && 
                            <span>C:\Users\Guest&gt;</span>
                        }
                        <span className="ml-1">{line.content}</span>
                    </div>
                ))}
            </div>

            {/* Input Line */}
            <div className="flex items-center group">
                <span>C:\Users\Guest&gt;</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-[#cccccc] ml-1 caret-white p-0 "
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
            </div>
             {/* Cursor block if needed, but standard input caret is fine for web. Windows cmd has a block cursor usually. 
                 Let's stick to standard caret to avoid complexity.
             */}
        </div>
      </motion.div>

      {/* Fallback & Tips (Japanese) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-col items-center gap-6 text-white text-center px-4 pb-24"
      >
        <div className="space-y-4">
            <p className="text-white/80 text-sm">
                迷子ですか？ 下のボタンで戻れますが、このコマンドプロンプトは実際に動きます。<br />
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono mx-1">help</code> と入力して、何ができるか確認してみてください。
            </p>
        </div>

        <Link 
            href="/"
            className="flex items-center gap-2 px-8 py-3 bg-[#0078D7] text-white font-bold hover:bg-[#0078D7]/90 transition-all shadow-lg hover:-translate-y-1 active:translate-y-0"
        >
            <Home size={18} />
            ホームに戻る
        </Link>
      </motion.div>

    </div>
  );
}
