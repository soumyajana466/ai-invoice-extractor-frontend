import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ExtractionProgress } from './components/ExtractionProgress';
import { InvoiceResult } from './components/InvoiceResult';
import { JsonModal } from './components/JsonModal';
import { SchemaModal } from './components/SchemaModal';
import { ErrorAlert } from './components/ErrorAlert';
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [schema, setSchema] = useState(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch backend health and schema on mount
  useEffect(() => {
    fetchHealth();
    fetchSchema();
  }, []);

  const showToast = (toastData) => {
    setToast(toastData);
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.warn('Backend /health unreachable currently', err);
    }
  };

  const fetchSchema = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/schema`);
      if (res.ok) {
        const data = await res.json();
        setSchema(data);
      }
    } catch (err) {
      console.warn('Failed to load /api/v1/schema', err);
    }
  };

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setError(null);
    showToast({ type: 'info', message: `Selected ${file.name}` });
  };

  const handleValidationError = (errDetail) => {
    setSelectedFile(null);
    setError(errDetail);
    showToast({ type: 'error', message: errDetail.message || 'Invalid file selected' });
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedResult(null);
    setError(null);
    setIsExtracting(false);
    showToast({ type: 'info', message: 'Ready for new invoice extraction' });
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError(null);
    setExtractedResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE}/api/v1/invoices/extract`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errDetail = result.error || {
          code: `HTTP_${response.status}`,
          message: result.detail || 'Extraction request failed.'
        };
        setError(errDetail);
        showToast({ type: 'error', message: errDetail.message || 'Extraction failed' });
      } else {
        setExtractedResult({
          filename: result.filename || selectedFile.name,
          data: result.data
        });
        showToast({ type: 'success', message: 'Invoice data extracted & schema validated!' });
      }
    } catch (err) {
      const netErr = {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the backend server. Please verify the backend is running on port 8000.'
      };
      setError(netErr);
      showToast({ type: 'error', message: 'Backend connection error' });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-gray-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient background glow & grid */}
      <div className="ambient-glow-top"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>

      {/* Header */}
      <Header
        health={health}
        onOpenSchema={() => setIsSchemaModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8 relative z-10">
        {/* Hero Section */}
        {!extractedResult && (
          <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3.5 pt-1 sm:pt-2 pb-1 sm:pb-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] sm:text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              <span>Automated GST &amp; Invoice Extraction</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
              AI Invoice Document Extractor
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto px-2">
              Upload invoice PDFs or images to extract structured data, itemized line items, and GST compliance details.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            error={error}
            onDismiss={() => setError(null)}
            onRetry={selectedFile ? handleExtract : null}
          />
        )}

        {/* Stepper Progress */}
        <ExtractionProgress isExtracting={isExtracting} />

        {/* Upload Zone */}
        {!extractedResult && (
          <UploadZone
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            onValidationError={handleValidationError}
            onClearFile={handleClearFile}
            onExtract={handleExtract}
            isExtracting={isExtracting}
            hasError={Boolean(error)}
          />
        )}

        {/* Results View */}
        {extractedResult && (
          <ErrorBoundary onReset={handleReset}>
            <InvoiceResult
              filename={extractedResult.filename}
              invoiceData={extractedResult.data}
              onReset={handleReset}
              onOpenJsonModal={() => setIsJsonModalOpen(true)}
              onShowToast={showToast}
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950/60 py-6 text-center text-xs text-gray-500 relative z-10 backdrop-blur-md">
        <p>AI Invoice Document Extractor</p>
      </footer>

      {/* JSON Viewer Modal */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        filename={extractedResult?.filename}
        invoiceData={extractedResult?.data}
      />

      {/* Schema Reference Modal */}
      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        schema={schema}
      />

      {/* Toast Notification Manager */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default App;
