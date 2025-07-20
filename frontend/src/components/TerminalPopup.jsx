import React, { useEffect, useRef, useState } from 'react';
import { getSocket, receiveMessage, removeMessageListener } from '../config/socket';

export let addTerminalLogExternally = null;

const TERMINAL_BG = 'bg-black';
const TERMINAL_TEXT = 'text-green-400';
const TERMINAL_ACCENT = 'text-white';
const TERMINAL_FONT = 'font-mono';

const LOG_TYPE_COLORS = {
  info: 'text-green-400',
  error: 'text-red-400',
  warn: 'text-yellow-300',
  success: 'text-emerald-400',
};

function formatLogMessage(log) {
  // Remove ANSI escape codes for display, but keep them for download/copy
  return log.message.replace(/\u001b\[[0-9;]*m/g, '');
}

export default function TerminalPopup() {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('all');
  const terminalRef = useRef(null);

  useEffect(() => {
    addTerminalLogExternally = (log) => {
      console.log('[addTerminalLogExternally] log:', log); // Debug log
      setLogs((prev) => [...prev, log]);
    };
    return () => { addTerminalLogExternally = null; };
  }, []);

  useEffect(() => {
    const handleLog = (data) => {
      console.log('[TerminalPopup] Received log:', data); // Debug log
      setLogs((prev) => [...prev, data]);
    };
    receiveMessage('console_log', handleLog);
    return () => {
      removeMessageListener('console_log', handleLog);
    };
  }, []);

  useEffect(() => {
    if (visible && autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, visible, autoScroll]);

  const handleClear = () => setLogs([]);

  const handleCopy = () => {
    const text = filteredLogs.map(log => log.message).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const text = filteredLogs.map(log => log.message).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtering and searching
  // For debugging: always show all logs
  const filteredLogs = logs;

  // Responsive width/height
  const width = window.innerWidth < 500 ? 'w-full' : 'w-[450px]';
  const height = window.innerHeight < 400 ? 'max-h-[200px]' : 'max-h-[350px]';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <button
        className="mb-2 px-4 py-2 rounded shadow-lg bg-gray-800 text-white hover:bg-gray-700 transition"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide Terminal' : 'Show Terminal'}
      >
        {visible ? 'Hide Terminal' : 'Show Terminal'}
      </button>
      {visible && (
        <div className={`rounded-lg shadow-2xl border border-gray-700 overflow-hidden flex flex-col ${TERMINAL_BG} ${width} ${height}`}
          style={{ fontFamily: 'Fira Mono, JetBrains Mono, Menlo, monospace', minWidth: 280 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 gap-2">
            <span className="font-mono text-sm text-green-300 select-none">Project Terminal</span>
            <div className="flex gap-1">
              <button
                className="text-xs px-2 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition"
                onClick={handleCopy}
                title="Copy all logs"
              >Copy</button>
              <button
                className="text-xs px-2 py-1 rounded bg-gray-700 text-white hover:bg-indigo-600 transition"
                onClick={handleDownload}
                title="Download logs"
              >Download</button>
              <button
                className="text-xs px-2 py-1 rounded bg-gray-700 text-white hover:bg-red-600 transition"
                onClick={handleClear}
                title="Clear logs"
              >Clear</button>
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-2 px-4 py-1 bg-gray-900 border-b border-gray-700 text-xs">
            <input
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 0, flex: 1 }}
            />
            <select
              className="bg-gray-800 border border-gray-700 rounded px-1 py-1 text-white"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              title="Filter log type"
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input type="checkbox" checked={showTimestamp} onChange={e => setShowTimestamp(e.target.checked)} />
              <span className="text-gray-400">Time</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} />
              <span className="text-gray-400">Auto</span>
            </label>
          </div>
          {/* Terminal Body */}
          <div
            ref={terminalRef}
            className={`flex-1 overflow-y-auto p-3 ${TERMINAL_FONT} text-xs custom-scrollbar ${TERMINAL_TEXT} bg-black`}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', minHeight: 80 }}
            tabIndex={0}
            aria-label="Terminal output"
          >
            {filteredLogs.length === 0 ? (
              <span className="text-gray-500">No logs yet.</span>
            ) : (
              filteredLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  {showTimestamp && (
                    <span className="text-gray-500 min-w-[54px]">[{log.timestamp?.slice(11,19) || '--:--:--'}]</span>
                  )}
                  {/* Fake prompt */}
                  <span className="text-green-500 select-none">$</span>
                  <span className={LOG_TYPE_COLORS[log.type] || TERMINAL_ACCENT} style={{ flex: 1 }}>
                    {formatLogMessage(log)}
                  </span>
                </div>
              ))
            )}
          </div>
          {/* Custom scrollbar styling */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 8px; background: #232136; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
            .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #444 #232136; }
          `}</style>
        </div>
      )}
    </div>
  );
} 