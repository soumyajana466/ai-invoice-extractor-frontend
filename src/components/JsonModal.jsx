import React, { useState } from 'react';
import { X, Copy, Check, Download, Code } from 'lucide-react';

export function JsonModal({ isOpen, onClose, filename, invoiceData }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !invoiceData) return null;

  const jsonString = JSON.stringify(invoiceData, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanName = (filename || 'invoice').replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `${cleanName}_extracted.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-800 bg-gray-950/80 gap-3 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
              <Code className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">Extracted JSON Data</h3>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">Validated against Invoice Schema</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white border border-gray-700/80 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white border border-gray-700/80 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-3.5 sm:p-6 overflow-x-auto overflow-y-auto font-mono text-[11px] sm:text-xs text-gray-200 bg-[#080c14] leading-relaxed flex-1">
          <pre className="whitespace-pre">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-gray-800 bg-gray-950/80 flex items-center justify-between text-[11px] sm:text-xs text-gray-400 shrink-0">
          <span className="text-gray-500">Strict Draft 2020-12 Contract</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
