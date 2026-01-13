import React, { useEffect, useState, useRef } from 'react';

interface LoadingScreenProps {
  message?: string;
  enableGame?: boolean;
}

const BOOT_SEQUENCE = [
  "INITIALIZING KERNEL...",
  "LOADING VIRTUAL MEMORY...",
  "MOUNTING FILE SYSTEM...",
  "BYPASSING SECURITY PROTOCOLS...",
  "ESTABLISHING SECURE CONNECTION...",
  "DECRYPTING USER DATA...",
  "OPTIMIZING NEURAL NETWORK...",
  "COMPILING ASSETS...",
  "EXECUTING STARTUP SCRIPTS...",
  "ACCESS GRANTED."
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "SYSTEM LOADING..."
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      // Create a timestamp
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) + `.${now.getMilliseconds().toString().padStart(3, '0')}`;

      if (currentIndex < BOOT_SEQUENCE.length) {
        setLogs(prev => [...prev, `[${timeString}] ${BOOT_SEQUENCE[currentIndex]}`]);
        currentIndex++;
      } else {
        // Generate random "hacking" hex dumps continuously after boot
        const randomHex = Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
        const segments = Array.from({ length: 4 }, () => `0x${randomHex}`);
        setLogs(prev => {
          const newLogs = [...prev, `[${timeString}] MEM_ALLOC: ${segments.join(' ')}`];
          // Keep the DOM light by only keeping the last 20 lines
          if (newLogs.length > 20) return newLogs.slice(newLogs.length - 20);
          return newLogs;
        });
      }
    }, 100); // 100ms update speed

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom of the terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-mono text-green-500 overflow-hidden font-bold">

      {/* CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Moving Scanline Bar */}
      <div className="absolute inset-0 pointer-events-none z-10 animate-scanline bg-gradient-to-b from-transparent via-green-500/10 to-transparent opacity-20" />

      {/* Main Terminal Container */}
      <div className="w-full max-w-3xl p-8 relative z-30 border border-green-500/30 bg-black/80 shadow-[0_0_50px_rgba(34,197,94,0.1)] rounded-sm">

        {/* Header */}
        <div className="mb-6 border-b border-green-500/30 pb-2 flex justify-between items-end">
          <h1 className="text-xl tracking-[0.2em] animate-pulse">{message.toUpperCase()}</h1>
          <span className="text-xs text-green-700">PID: {Math.floor(Math.random() * 9000) + 1000}</span>
        </div>

        {/* Console Output */}
        <div
          ref={scrollRef}
          className="h-64 overflow-hidden text-sm md:text-base font-medium space-y-1"
        >
          {logs.map((log, i) => (
            <div key={i} className="break-all">
              <span className="text-green-700 mr-2 opacity-50">{'>'}</span>
              <span style={{ textShadow: '0 0 5px rgba(34, 197, 94, 0.5)' }}>{log}</span>
            </div>
          ))}

          {/* Active Cursor Line */}
          <div className="mt-2 flex items-center">
            <span className="text-green-500 mr-2">{'>'}</span>
            <span className="animate-pulse bg-green-500 w-3 h-5 block shadow-[0_0_10px_#22c55e]"></span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-green-500/20 text-[10px] flex justify-between opacity-50">
          <span>SECURE_CONNECTION: ENCRYPTED</span>
          <span>MEMORY_USAGE: 4096MB</span>
        </div>
      </div>
    </div>
  );
};
