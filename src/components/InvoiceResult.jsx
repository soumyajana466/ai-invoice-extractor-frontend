import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Building2,
  User,
  Coins,
  Receipt,
  CreditCard,
  Copy,
  Check,
  Download,
  Code,
  RotateCcw,
  AlertCircle,
  Hash,
  ShieldCheck,
  Search,
  FileSpreadsheet,
  Layers,
  Sparkles,
  MapPin,
  Landmark,
  Percent,
  CheckCircle2,
  Home,
  Wallet,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

export function InvoiceResult({ filename, invoiceData, onReset, onOpenJsonModal, onShowToast }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'json'
  const [mobileItemView, setMobileItemView] = useState('cards'); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [jsonCopied, setJsonCopied] = useState(false);

  if (!invoiceData) return null;

  const hasGstData = Boolean(
    invoiceData.vendor_gstin ||
    invoiceData.customer_gstin ||
    invoiceData.vendor_pan ||
    invoiceData.place_of_supply ||
    invoiceData.reverse_charge != null ||
    invoiceData.cgst_amount != null ||
    invoiceData.sgst_amount != null ||
    invoiceData.igst_amount != null ||
    invoiceData.order_number ||
    (Array.isArray(invoiceData.line_items) && invoiceData.line_items.some(it => it && (it.hsn_code || it.cgst_rate != null)))
  );

  const copyToClipboard = async (text, label) => {
    if (!text && text !== 0 && text !== false) return;
    try {
      await navigator.clipboard.writeText(String(text));
      setCopiedField(label);
      if (onShowToast) {
        onShowToast({ type: 'success', message: `Copied ${label} to clipboard!` });
      }
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(invoiceData, null, 2));
      setJsonCopied(true);
      if (onShowToast) {
        onShowToast({ type: 'success', message: 'Full invoice JSON copied to clipboard!' });
      }
      setTimeout(() => setJsonCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON: ', err);
    }
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(invoiceData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanName = (filename || 'invoice').replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `${cleanName}_extracted.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast({ type: 'success', message: 'Downloaded invoice JSON file!' });
    }
  };

  const handleExportCsv = () => {
    if (!invoiceData.line_items || invoiceData.line_items.length === 0) {
      if (onShowToast) {
        onShowToast({ type: 'info', message: 'No line items available to export.' });
      }
      return;
    }

    const headers = [
      '#',
      'Description',
      'HSN/SAC',
      'Quantity',
      'Unit Price',
      'Taxable Amount',
      'CGST %',
      'CGST Amt',
      'SGST %',
      'SGST Amt',
      'IGST %',
      'IGST Amt',
      'Total'
    ];

    const rows = invoiceData.line_items.map((item, idx) => [
      idx + 1,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      item.hsn_code ? `"${item.hsn_code}"` : '',
      item.quantity !== null && item.quantity !== undefined ? item.quantity : '',
      item.unit_price !== null && item.unit_price !== undefined ? item.unit_price : '',
      item.taxable_amount !== null && item.taxable_amount !== undefined ? item.taxable_amount : '',
      item.cgst_rate !== null && item.cgst_rate !== undefined ? item.cgst_rate : '',
      item.cgst_amount !== null && item.cgst_amount !== undefined ? item.cgst_amount : '',
      item.sgst_rate !== null && item.sgst_rate !== undefined ? item.sgst_rate : '',
      item.sgst_amount !== null && item.sgst_amount !== undefined ? item.sgst_amount : '',
      item.igst_rate !== null && item.igst_rate !== undefined ? item.igst_rate : '',
      item.igst_amount !== null && item.igst_amount !== undefined ? item.igst_amount : '',
      item.total !== null && item.total !== undefined ? item.total : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanName = (filename || 'invoice').replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `${cleanName}_line_items.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast({ type: 'success', message: 'Exported line items to CSV!' });
    }
  };

  const formatAmount = (val, currency) => {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    if (isNaN(num)) return String(val);
    const formattedNum = num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return currency ? `${currency} ${formattedNum}` : formattedNum;
  };

  const safeToFixed = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? String(val) : num.toFixed(2);
  };

  const renderFieldValue = (val, label, isCurrency = false, isHighlight = false) => {
    if (val === null || val === undefined || val === '') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-800/80 text-gray-400 border border-gray-700/50 italic">
          Not available
        </span>
      );
    }

    if (typeof val === 'boolean') {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
            val
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {val ? 'Yes (Reverse Charge)' : 'No (Standard Forward Charge)'}
        </span>
      );
    }

    // Defensive check: if val is an object, format safely to avoid React child crash
    const displayStr = typeof val === 'object'
      ? JSON.stringify(val)
      : isCurrency
      ? formatAmount(val, invoiceData.currency)
      : String(val);

    return (
      <div className="flex items-center justify-between group/field">
        <span
          className={
            isHighlight
              ? 'text-xl sm:text-2xl md:text-3xl font-bold font-mono text-emerald-400 break-words'
              : 'text-xs sm:text-sm font-semibold text-gray-100 break-words'
          }
        >
          {displayStr}
        </span>
        <button
          onClick={() => copyToClipboard(val, label)}
          className="opacity-70 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white ml-2 shrink-0 cursor-pointer"
          title={`Copy ${label}`}
        >
          {copiedField === label ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    );
  };

  // Filter line items safely
  const filteredLineItems = (invoiceData.line_items || []).filter(item => {
    if (!item) return false;
    if (!searchQuery.trim()) return true;
    const desc = String(item.description || '').toLowerCase();
    const hsn = String(item.hsn_code || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    return desc.includes(q) || hsn.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action & Verification Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gray-900/80 border border-gray-800 backdrop-blur-xl gap-4 shadow-xl">
        <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white">
                Invoice Extraction Completed
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Validated
              </span>
              {hasGstData && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  GST Enabled
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400 truncate max-w-xs sm:max-w-md mt-0.5">
              Source: <span className="font-mono text-gray-200">{filename}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          {/* Tab Switcher: Full width 2-button grid on mobile, flex on desktop */}
          <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-gray-950 border border-gray-800 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Structured</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </button>
          </div>

          {/* Action Buttons: 3-column equal grid on mobile, flex on desktop */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold text-gray-200 bg-gray-800/90 hover:bg-gray-700 hover:text-white border border-gray-700/80 transition-all cursor-pointer text-center"
              title="Copy invoice JSON"
            >
              {jsonCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 truncate text-[11px] sm:text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate text-[11px] sm:text-xs">Copy JSON</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold text-gray-200 bg-gray-800/90 hover:bg-gray-700 hover:text-white border border-gray-700/80 transition-all cursor-pointer text-center"
              title="Download JSON file"
            >
              <Download className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">Download</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 transition-all cursor-pointer text-center"
              title="Upload another invoice"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">New</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Main Grid: Overview & Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left 2 Cols: Invoice Metadata */}
            <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl bg-gray-900/60 border border-gray-800 p-4 sm:p-6 space-y-4 sm:space-y-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <Receipt className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                    Invoice Overview
                  </h3>
                </div>
                {invoiceData.currency && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Currency: {invoiceData.currency}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Invoice Number */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Invoice Number</span>
                  </div>
                  {renderFieldValue(invoiceData.invoice_number, 'Invoice Number')}
                </div>

                {/* Order Number */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Order / PO Number</span>
                  </div>
                  {renderFieldValue(invoiceData.order_number, 'Order Number')}
                </div>

                {/* Invoice Date */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Issue Date (YYYY-MM-DD)</span>
                  </div>
                  {renderFieldValue(invoiceData.invoice_date, 'Issue Date')}
                </div>

                {/* Due Date */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Due Date (YYYY-MM-DD)</span>
                  </div>
                  {renderFieldValue(invoiceData.due_date, 'Due Date')}
                </div>

                {/* Payment Method */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5 sm:col-span-2">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <Wallet className="w-3.5 h-3.5 text-purple-400" />
                    <span>Payment Method / Mode of Payment</span>
                  </div>
                  {renderFieldValue(invoiceData.payment_method, 'Payment Method')}
                </div>

                {/* Vendor Name & Address */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-2 sm:col-span-2">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vendor / Seller Details</span>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[11px] text-gray-500 uppercase tracking-wider block">Company Name:</span>
                      {renderFieldValue(invoiceData.vendor_name, 'Vendor Name')}
                    </div>
                    {invoiceData.vendor_address && (
                      <div className="pt-1 border-t border-gray-900">
                        <span className="text-[11px] text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" /> Vendor Address:
                        </span>
                        {renderFieldValue(invoiceData.vendor_address, 'Vendor Address')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Name, Billing & Shipping Address */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-2 sm:col-span-2">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Customer / Recipient Details</span>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[11px] text-gray-500 uppercase tracking-wider block">Customer Name:</span>
                      {renderFieldValue(invoiceData.customer_name, 'Customer Name')}
                    </div>
                    {invoiceData.billing_address && (
                      <div className="pt-1 border-t border-gray-900">
                        <span className="text-[11px] text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                          <Home className="w-3 h-3 text-cyan-400" /> Customer Address:
                        </span>
                        {renderFieldValue(invoiceData.billing_address, 'Customer Address')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount in Words if present */}
              {invoiceData.amount_in_words && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300">
                  <span className="font-semibold text-indigo-200">Amount in Words: </span>
                  <span className="italic">{invoiceData.amount_in_words}</span>
                </div>
              )}
            </div>

            {/* Right 1 Col: Financial Summary Card */}
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-gray-900 via-gray-900 to-indigo-950/50 border border-gray-800 p-4 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-6 backdrop-blur-md shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-gray-800 pb-3 sm:pb-4">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                    Financial Summary
                  </h3>
                </div>

                <div className="space-y-2 sm:space-y-2.5">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-950/50 border border-gray-800/60">
                    <span className="text-xs text-gray-400 font-medium">Taxable Subtotal</span>
                    <div>{renderFieldValue(invoiceData.subtotal, 'Subtotal', true)}</div>
                  </div>

                  {/* GST Split rows if present */}
                  {invoiceData.cgst_amount !== null && invoiceData.cgst_amount !== undefined && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950/40 border border-gray-800/40 text-xs">
                      <span className="text-gray-400">Central GST (CGST)</span>
                      <span className="font-mono font-semibold text-indigo-300">
                        {formatAmount(invoiceData.cgst_amount, invoiceData.currency)}
                      </span>
                    </div>
                  )}

                  {invoiceData.sgst_amount !== null && invoiceData.sgst_amount !== undefined && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950/40 border border-gray-800/40 text-xs">
                      <span className="text-gray-400">State GST (SGST)</span>
                      <span className="font-mono font-semibold text-indigo-300">
                        {formatAmount(invoiceData.sgst_amount, invoiceData.currency)}
                      </span>
                    </div>
                  )}

                  {invoiceData.igst_amount !== null && invoiceData.igst_amount !== undefined && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950/40 border border-gray-800/40 text-xs">
                      <span className="text-gray-400">Integrated GST (IGST)</span>
                      <span className="font-mono font-semibold text-indigo-300">
                        {formatAmount(invoiceData.igst_amount, invoiceData.currency)}
                      </span>
                    </div>
                  )}

                  {/* Total Tax Amount */}
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-950/50 border border-gray-800/60">
                    <span className="text-xs text-gray-400 font-medium">Total Tax / GST</span>
                    <div>{renderFieldValue(invoiceData.tax_amount, 'Tax Amount', true)}</div>
                  </div>

                  {/* Currency Code */}
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-950/50 border border-gray-800/60">
                    <span className="text-xs text-gray-400 font-medium">ISO Currency</span>
                    <div>{renderFieldValue(invoiceData.currency, 'Currency')}</div>
                  </div>
                </div>
              </div>

              {/* Grand Total Amount Highlight */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/60 border border-indigo-500/40 space-y-1.5 shadow-lg shadow-indigo-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Grand Total Amount
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {invoiceData.currency || 'Total'}
                  </span>
                </div>
                <div className="pt-1">
                  {renderFieldValue(invoiceData.total_amount, 'Grand Total', true, true)}
                </div>
              </div>
            </div>
          </div>

          {/* GST Tax & Compliance Details Card */}
          {hasGstData && (
            <div className="rounded-2xl sm:rounded-3xl bg-gray-900/60 border border-indigo-500/20 p-4 sm:p-6 space-y-4 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Landmark className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                    GST & Compliance Metadata
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Indian GST Standard
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {/* Vendor GSTIN */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Vendor GSTIN</span>
                  </div>
                  {renderFieldValue(invoiceData.vendor_gstin, 'Vendor GSTIN')}
                </div>

                {/* Customer GSTIN */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Customer GSTIN</span>
                  </div>
                  {renderFieldValue(invoiceData.customer_gstin, 'Customer GSTIN')}
                </div>

                {/* Vendor PAN */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vendor PAN</span>
                  </div>
                  {renderFieldValue(invoiceData.vendor_pan, 'Vendor PAN')}
                </div>

                {/* Reverse Charge */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <Percent className="w-3.5 h-3.5 text-purple-400" />
                    <span>Reverse Charge</span>
                  </div>
                  {renderFieldValue(invoiceData.reverse_charge, 'Reverse Charge')}
                </div>

                {/* Place of Supply */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Place of Supply</span>
                  </div>
                  {renderFieldValue(invoiceData.place_of_supply, 'Place of Supply')}
                </div>

                {/* Customer PAN */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    <span>Customer PAN</span>
                  </div>
                  {renderFieldValue(invoiceData.customer_pan, 'Customer PAN')}
                </div>
              </div>
            </div>
          )}

          {/* Line Items Table Section */}
          <div className="rounded-2xl sm:rounded-3xl bg-gray-900/60 border border-gray-800 p-4 sm:p-6 space-y-4 sm:space-y-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3 sm:pb-4">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                  Itemized Line Items ({invoiceData.line_items?.length || 0})
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Mobile View Toggle: Cards vs Table */}
                <div className="flex sm:hidden items-center p-0.5 rounded-xl bg-gray-950 border border-gray-800 self-start">
                  <button
                    type="button"
                    onClick={() => setMobileItemView('cards')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      mobileItemView === 'cards'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileItemView('table')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      mobileItemView === 'table'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <TableIcon className="w-3 h-3" />
                    <span>Table</span>
                  </button>
                </div>

                {/* Line Item Search Bar */}
                {invoiceData.line_items && invoiceData.line_items.length > 1 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter items or HSN..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Export CSV Button */}
                {invoiceData.line_items && invoiceData.line_items.length > 0 && (
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 bg-gray-800/80 hover:bg-gray-700 hover:text-white border border-gray-700/60 transition-colors cursor-pointer shrink-0"
                    title="Export line items to CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CSV Export</span>
                  </button>
                )}
              </div>
            </div>

            {invoiceData.line_items && invoiceData.line_items.length > 0 ? (
              <div className="space-y-3">
                {/* Mobile Cards View (Visible on small screens when mobileItemView === 'cards') */}
                {mobileItemView === 'cards' && (
                  <div className="space-y-3 sm:hidden">
                    {filteredLineItems.length > 0 ? (
                      filteredLineItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-gray-950/80 border border-gray-800/90 space-y-2.5 shadow-md"
                        >
                          {/* Header: #, Description, HSN */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-2 min-w-0">
                              <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono text-[10px] font-semibold shrink-0 mt-0.5">
                                #{idx + 1}
                              </span>
                              <p className="text-xs font-bold text-gray-100 leading-snug break-words">
                                {item.description || (
                                  <span className="italic text-gray-500">Unspecified Item</span>
                                )}
                              </p>
                            </div>
                            {item.hsn_code && (
                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] shrink-0 font-medium">
                                HSN: {item.hsn_code}
                              </span>
                            )}
                          </div>

                          {/* Quantities & Pricing Grid */}
                          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/60 text-[11px]">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Qty</span>
                              <span className="font-mono font-medium text-gray-200">
                                {item.quantity != null ? item.quantity : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Unit Price</span>
                              <span className="font-mono font-medium text-gray-200">
                                {safeToFixed(item.unit_price)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Taxable</span>
                              <span className="font-mono font-medium text-gray-200">
                                {safeToFixed(item.taxable_amount)}
                              </span>
                            </div>
                          </div>

                          {/* GST Split & Line Total */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div className="text-[11px] text-gray-400 font-mono">
                              {item.cgst_rate != null || item.sgst_rate != null || item.igst_rate != null ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                  {[
                                    item.cgst_rate != null ? `${item.cgst_rate}% CGST` : null,
                                    item.sgst_rate != null ? `${item.sgst_rate}% SGST` : null,
                                    item.igst_rate != null ? `${item.igst_rate}% IGST` : null
                                  ].filter(Boolean).join(' + ')}
                                </span>
                              ) : (
                                <span className="text-gray-600 text-[10px]">No GST breakdown</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Line Total</span>
                              <span className="font-mono font-bold text-sm text-emerald-400">
                                {invoiceData.currency ? `${invoiceData.currency} ` : ''}{safeToFixed(item.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-gray-400 text-xs bg-gray-950/40 rounded-xl border border-gray-800">
                        No line items match filter "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}

                {/* Table View (Always shown on desktop; shown on mobile if mobileItemView === 'table') */}
                <div className={`${mobileItemView === 'table' ? 'block' : 'hidden sm:block'} space-y-1.5`}>
                  <div className="sm:hidden flex items-center justify-between text-[11px] text-gray-500 px-1">
                    <span>Swipe table horizontally to see all columns</span>
                    <span>&rarr;</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-800/80 -mx-1 sm:mx-0">
                    <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                      <thead>
                        <tr className="bg-gray-950/80 border-b border-gray-800 text-gray-400 uppercase text-[10px] sm:text-[11px] tracking-wider font-semibold">
                          <th className="py-3 px-3 w-12 text-center">#</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-3 text-center w-28">HSN/SAC</th>
                          <th className="py-3 px-3 text-right w-20">Qty</th>
                          <th className="py-3 px-3 text-right w-28">Unit Price</th>
                          <th className="py-3 px-3 text-right w-28">Taxable</th>
                          <th className="py-3 px-3 text-right w-28">GST Split</th>
                          <th className="py-3 px-4 text-right w-32">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60 bg-gray-900/30">
                        {filteredLineItems.length > 0 ? (
                          filteredLineItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-800/50 transition-colors group/row">
                              <td className="py-3.5 px-3 text-center text-gray-500 font-mono text-xs">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 text-gray-200 font-medium max-w-xs sm:max-w-md">
                                {item.description || (
                                  <span className="italic text-gray-500 text-xs">Unspecified</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center font-mono text-xs text-indigo-300">
                                {item.hsn_code ? (
                                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                                    {item.hsn_code}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-gray-300">
                                {item.quantity != null ? item.quantity : '-'}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-gray-300">
                                {safeToFixed(item.unit_price)}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-gray-300">
                                {safeToFixed(item.taxable_amount)}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-xs text-gray-300">
                                {item.cgst_rate != null || item.sgst_rate != null || item.igst_rate != null ? (
                                  <div className="space-y-0.5">
                                    {item.cgst_rate != null && (
                                      <div>{item.cgst_rate}% CGST</div>
                                    )}
                                    {item.sgst_rate != null && (
                                      <div>{item.sgst_rate}% SGST</div>
                                    )}
                                    {item.igst_rate != null && (
                                      <div>{item.igst_rate}% IGST</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                                {safeToFixed(item.total)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-gray-400 text-xs">
                              No line items match filter "{searchQuery}"
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
          ) : (
              <div className="p-8 rounded-2xl bg-gray-950/40 border border-gray-800/80 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-gray-500 mx-auto" />
                <p className="text-sm font-semibold text-gray-300">No Itemized Line Items</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Strict anti-hallucination rules prevent synthesizing line items when none are explicitly detailed in the document.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Raw JSON Inspector Tab */
        <div className="rounded-2xl sm:rounded-3xl bg-gray-950/90 border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-800 bg-gray-900/60 gap-3">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Validated JSON Output
              </span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors cursor-pointer"
              >
                {jsonCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{jsonCopied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-purple-300 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>
          <div className="p-3.5 sm:p-6 overflow-x-auto font-mono text-[11px] sm:text-xs text-gray-200 bg-[#06090f] leading-relaxed">
            <pre className="whitespace-pre">{JSON.stringify(invoiceData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
