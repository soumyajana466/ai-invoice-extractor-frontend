import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Sparkles, FileSearch, CheckCircle2 } from 'lucide-react';

export function ExtractionProgress({ isExtracting }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Inspecting Document', desc: 'Validating format, magic bytes, and page structures', icon: FileSearch },
    { title: 'AI Document Analysis', desc: 'Analyzing invoice layout, text, tables, and amounts', icon: Sparkles },
    { title: 'Schema Validation', desc: 'Enforcing strict data types and compliance rules', icon: ShieldCheck },
    { title: 'Data Verification', desc: 'Validating scalar fields and line item integrity', icon: CheckCircle2 },
  ];

  useEffect(() => {
    if (!isExtracting) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [isExtracting]);

  if (!isExtracting) return null;

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gray-900/80 backdrop-blur-md p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 shadow-2xl shadow-indigo-500/10 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white truncate">Extracting Invoice Data...</h3>
            <p className="text-[11px] sm:text-xs text-gray-400 truncate">Processing document layout &amp; validating structured data</p>
          </div>
        </div>
        <span className="text-[11px] sm:text-xs font-mono font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-indigo-500/60 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10'
                  : isDone
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border-gray-800 bg-gray-950/40 text-gray-500'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-indigo-400 animate-pulse' : isDone ? 'text-emerald-400' : 'text-gray-600'}`} />
                <span className="text-xs font-semibold">{step.title}</span>
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
