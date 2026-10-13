import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  FileX
} from 'lucide-react';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function UploadZone({
  selectedFile,
  onSelectFile,
  onValidationError,
  onClearFile,
  onExtract,
  isExtracting,
  hasError
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = async (file) => {
    if (!file) {
      return {
        valid: false,
        code: 'EMPTY_FILE',
        message: 'No file was selected. Please choose a document to upload.'
      };
    }

    // 1. Check empty file
    if (file.size === 0) {
      return {
        valid: false,
        code: 'EMPTY_FILE',
        message: 'The selected file is empty (0 bytes). Please upload a valid document.'
      };
    }

    // 2. Check maximum size (10 MB)
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        code: 'FILE_TOO_LARGE',
        message: `File size (${sizeMb} MB) exceeds the maximum allowed size of 10 MB.`
      };
    }

    // 3. Check extension
    const ext = file.name?.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: `Unsupported file extension '.${ext || 'unknown'}'. Please upload a PDF, JPG, JPEG, PNG, or WebP document.`
      };
    }

    // 4. Client-side PDF magic header check
    if (ext === 'pdf') {
      try {
        const headerSlice = file.slice(0, 5);
        const headerText = await headerSlice.text();
        if (!headerText.startsWith('%PDF-')) {
          return {
            valid: false,
            code: 'CORRUPTED_PDF',
            message: 'File content is not a valid PDF document (missing PDF magic header). The file may be damaged or corrupted.'
          };
        }
      } catch (e) {
        console.warn('PDF header preview error:', e);
      }
    }

    // 5. Client-side image integrity test
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      try {
        const isDecodable = await new Promise((resolve) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(true);
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(false);
          };
          img.src = objectUrl;
        });

        if (!isDecodable) {
          return {
            valid: false,
            code: 'CORRUPTED_IMAGE',
            message: 'The image file could not be decoded or is damaged. Please select a valid, uncorrupted image.'
          };
        }
      } catch (e) {
        console.warn('Image verification error:', e);
      }
    }

    return { valid: true };
  };

  const processFileSelection = async (file) => {
    setIsValidating(true);
    try {
      const validation = await validateFile(file);
      if (!validation.valid) {
        if (onValidationError) {
          onValidationError({
            code: validation.code,
            message: validation.message
          });
        }
        return;
      }
      onSelectFile(file);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFileSelection(e.target.files[0]);
    }
    // Critical: reset value so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return <FileText className="w-7 h-7 text-rose-400" />;
    }
    return <ImageIcon className="w-7 h-7 text-indigo-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-300 p-5 sm:p-8 md:p-12 text-center overflow-hidden ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/40 shadow-2xl shadow-indigo-500/20 scale-[1.01]'
            : selectedFile && hasError
            ? 'border-rose-700/80 bg-rose-950/20 shadow-xl'
            : selectedFile
            ? 'border-gray-700/80 bg-gray-900/50 shadow-xl'
            : 'border-gray-700 hover:border-indigo-500/60 bg-gray-900/30 hover:bg-gray-900/50 shadow-lg hover:shadow-indigo-500/10'
        }`}
      >
        {/* Full-bleed transparent native input when no file is selected */}
        {!selectedFile && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isExtracting || isValidating}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Click or tap to upload invoice document"
            aria-label="Upload invoice document"
          />
        )}

        {/* Hidden input used when file is already selected for Change Document button */}
        {selectedFile && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isExtracting || isValidating}
            className="hidden"
            aria-label="Change invoice document"
          />
        )}

        {!selectedFile ? (
          <div className="space-y-4 pointer-events-none select-none">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-105 transition-transform">
              {isValidating ? (
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-gray-100">
                Drop your invoice document here, or <span className="text-indigo-400 underline underline-offset-4 font-semibold">browse</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Supports single or multi-page <strong className="text-gray-300">PDF, JPG, JPEG, PNG, WebP</strong> (Max 10 MB)
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-800/80 text-gray-300 border border-gray-700/60">
                .PDF
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-800/80 text-gray-300 border border-gray-700/60">
                .JPG / .JPEG
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-800/80 text-gray-300 border border-gray-700/60">
                .PNG
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-800/80 text-gray-300 border border-gray-700/60">
                .WEBP
              </span>
            </div>
          </div>
        ) : (
          /* File Selected Card */
          <div className="space-y-5 animate-fade-in relative z-20" onClick={(e) => e.stopPropagation()}>
            <div
              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
                hasError
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              }`}
            >
              {hasError ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Document Failed Extraction</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Document Ready for AI Extraction</span>
                </>
              )}
            </div>

            <div className={`max-w-md mx-auto p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between shadow-lg ${
              hasError
                ? 'bg-rose-950/30 border-rose-800/60'
                : 'bg-gray-950/80 border-gray-800'
            }`}>
              <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gray-900 border border-gray-800 shrink-0">
                  {getFileIcon(selectedFile.name)}
                </div>
                <div className="text-left truncate">
                  <p className="text-xs sm:text-sm font-bold text-gray-200 truncate">{selectedFile.name}</p>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-mono mt-0.5">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>

              {!isExtracting && (
                <button
                  type="button"
                  onClick={onClearFile}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-2 cursor-pointer shrink-0"
                  title="Remove file"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting || isValidating}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-xs font-medium text-gray-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Change Document
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExtract();
                }}
                disabled={isExtracting || isValidating}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{hasError ? 'Retry Extraction' : 'Extract Invoice Data'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
