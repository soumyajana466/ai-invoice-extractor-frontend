import React from 'react';
import { FileText, Code, ShieldCheck, Cpu } from 'lucide-react';

export function Header({ health, onOpenSchema }) {
  return (
    <header className="border-b border-gray-800/80 bg-gray-950/70 backdrop-blur-xl sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: App Logo & Badges */}
        <div className="flex items-center space-x-3 sm:space-x-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-80 transition duration-300"></div>
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-900 border border-gray-700/60 flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white">
              AI Invoice Extractor
            </h1>
            <p className="text-[10px] sm:text-[11px] text-gray-400 hidden sm:block">
              Automated Document &amp; GST Extraction
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Schema Viewer Trigger */}
          <button
            onClick={onOpenSchema}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-900/80 hover:bg-gray-800 hover:text-white border border-gray-800 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm"
            title="Inspect Schema Reference"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Schema Reference</span>
            <span className="md:hidden">Schema</span>
          </button>
        </div>
      </div>
    </header>
  );
}
