import React from 'react';
import {
  AlertTriangle,
  X,
  RefreshCw,
  Key,
  FileX,
  ServerCrash,
  FileQuestion,
  Lock,
  Layers,
  HelpCircle
} from 'lucide-react';

export function ErrorAlert({ error, onDismiss, onRetry }) {
  if (!error) return null;

  const getErrorIcon = (code) => {
    switch (code) {
      case 'NOT_AN_INVOICE':
        return <FileQuestion className="w-5 h-5 text-amber-400" />;
      case 'PASSWORD_PROTECTED_PDF':
        return <Lock className="w-5 h-5 text-amber-400" />;
      case 'PAGE_LIMIT_EXCEEDED':
      case 'FILE_TOO_LARGE':
        return <Layers className="w-5 h-5 text-amber-400" />;
      case 'API_KEY_MISSING':
        return <Key className="w-5 h-5 text-amber-400" />;
      case 'EMPTY_FILE':
      case 'UNSUPPORTED_MEDIA_TYPE':
      case 'CORRUPTED_PDF':
      case 'CORRUPTED_IMAGE':
      case 'INVALID_IMAGE':
      case 'MIME_TYPE_MISMATCH':
        return <FileX className="w-5 h-5 text-rose-400" />;
      case 'UPSTREAM_TIMEOUT':
      case 'RATE_LIMIT_EXCEEDED':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <ServerCrash className="w-5 h-5 text-rose-400" />;
    }
  };

  const getErrorTitle = (code) => {
    switch (code) {
      case 'NOT_AN_INVOICE':
        return 'Wrong Document (Not an Invoice)';
      case 'CORRUPTED_PDF':
        return 'Invalid or Corrupted PDF';
      case 'CORRUPTED_IMAGE':
        return 'Corrupted or Unreadable Image';
      case 'INVALID_IMAGE':
        return 'Unrecognized Image Format';
      case 'PASSWORD_PROTECTED_PDF':
        return 'Password-Protected PDF';
      case 'UNSUPPORTED_MEDIA_TYPE':
        return 'Unsupported File Type';
      case 'FILE_TOO_LARGE':
        return 'File Size Limit Exceeded';
      case 'EMPTY_FILE':
        return 'Empty File (0 Bytes)';
      case 'PAGE_LIMIT_EXCEEDED':
        return 'Page Limit Exceeded';
      case 'MIME_TYPE_MISMATCH':
        return 'File Extension Mismatch';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Rate Limit Exceeded';
      case 'UPSTREAM_TIMEOUT':
        return 'Request Timed Out';
      case 'API_KEY_MISSING':
        return 'Gemini API Key Required';
      default:
        return 'Extraction Failed';
    }
  };

  const getGuidanceTip = (code) => {
    switch (code) {
      case 'NOT_AN_INVOICE':
        return 'Please ensure your uploaded PDF or image is an invoice, tax invoice, bill, or receipt containing recognizable vendor details, invoice numbers, or transaction totals.';
      case 'CORRUPTED_PDF':
        return 'The PDF file could not be parsed or contains invalid bytes. Try opening and re-saving it or printing it to a new PDF before uploading.';
      case 'CORRUPTED_IMAGE':
      case 'INVALID_IMAGE':
        return 'The image cannot be decoded. Make sure it is a valid JPG, PNG, or WebP photo or scan that is not damaged or truncated.';
      case 'PASSWORD_PROTECTED_PDF':
        return 'Please unlock or remove the password protection from your PDF file before uploading.';
      case 'UNSUPPORTED_MEDIA_TYPE':
        return 'Supported document types are PDF, JPG, JPEG, PNG, and WebP (up to 10 MB).';
      case 'FILE_TOO_LARGE':
        return 'Maximum supported file size is 10 MB. Consider compressing the file or lowering the scan resolution.';
      case 'EMPTY_FILE':
        return 'The uploaded file contains no data. Please select a valid document.';
      case 'PAGE_LIMIT_EXCEEDED':
        return 'Invoices are limited to 20 pages max. Please upload an excerpt containing the invoice pages.';
      case 'MIME_TYPE_MISMATCH':
        return 'The file extension does not match the actual file encoding. Rename or re-export the file with its true extension.';
      case 'API_KEY_MISSING':
        return 'Set your GEMINI_API_KEY environment variable in backend/.env to enable invoice extraction.';
      default:
        return null;
    }
  };

  const tip = getGuidanceTip(error.code);
  const isWarningStyle = ['NOT_AN_INVOICE', 'PASSWORD_PROTECTED_PDF', 'PAGE_LIMIT_EXCEEDED'].includes(error.code);

  return (
    <div
      role="alert"
      className={`rounded-2xl border backdrop-blur-md p-4 sm:p-5 flex items-start justify-between gap-4 animate-fade-in shadow-lg ${
        isWarningStyle
          ? 'border-amber-500/30 bg-amber-950/20 shadow-amber-500/5'
          : 'border-rose-500/30 bg-rose-950/20 shadow-rose-500/5'
      }`}
    >
      <div className="flex items-start space-x-3.5">
        <div
          className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
            isWarningStyle
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-rose-500/10 border-rose-500/20'
          }`}
        >
          {getErrorIcon(error.code)}
        </div>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm font-bold ${
                isWarningStyle ? 'text-amber-300' : 'text-rose-300'
              }`}
            >
              {getErrorTitle(error.code)}
            </h4>
            {error.code && (
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                  isWarningStyle
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {error.code}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {error.message || 'An error occurred while processing the document.'}
          </p>
          {tip && (
            <div
              className={`mt-2 p-2.5 rounded-xl border text-xs leading-relaxed flex items-start space-x-2 ${
                isWarningStyle
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-200/90'
                  : 'bg-gray-900/60 border-gray-800 text-gray-300'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 opacity-70" />
              <span>{tip}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
            title="Retry extraction"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          title="Dismiss alert"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
