import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Code2, FileCode2, Info, Search } from 'lucide-react';

export function SchemaModal({ isOpen, onClose, schema }) {
  const [viewMode, setViewMode] = useState('doc'); // 'doc' | 'raw'
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const schemaString = schema ? JSON.stringify(schema, null, 2) : 'Loading schema...';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(schemaString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const schemaCategories = [
    {
      category: 'Header & Identification',
      fields: [
        { name: 'invoice_number', type: 'string | null', desc: 'Unique invoice identifier or document number' },
        { name: 'invoice_date', type: 'string | null', desc: 'Date of invoice issuance (YYYY-MM-DD)' },
        { name: 'due_date', type: 'string | null', desc: 'Payment due date (YYYY-MM-DD)' },
        { name: 'order_number', type: 'string | null', desc: 'Purchase order (PO) or sales order reference number' },
        { name: 'currency', type: 'string | null', desc: 'Standard 3-letter currency code (e.g., INR, USD, EUR)' },
        { name: 'payment_method', type: 'string | null', desc: 'Mode of payment explicitly printed on invoice (e.g., Credit Card, Bank Transfer, UPI)' },
      ]
    },
    {
      category: 'Vendor & Customer Details',
      fields: [
        { name: 'vendor_name', type: 'string | null', desc: 'Legal business name of the seller or issuing entity' },
        { name: 'vendor_address', type: 'string | null', desc: 'Complete physical or registered address of the vendor' },
        { name: 'vendor_gstin', type: 'string | null', desc: 'Vendor 15-character GSTIN registration number' },
        { name: 'vendor_pan', type: 'string | null', desc: 'Vendor 10-character Permanent Account Number' },
        { name: 'customer_name', type: 'string | null', desc: 'Name of the billed customer or recipient business' },
        { name: 'billing_address', type: 'string | null', desc: 'Full billing address of the customer' },
        { name: 'shipping_address', type: 'string | null', desc: 'Full delivery / shipping destination address' },
        { name: 'customer_gstin', type: 'string | null', desc: 'Customer 15-character GSTIN registration number' },
        { name: 'customer_pan', type: 'string | null', desc: 'Customer 10-character Permanent Account Number' },
      ]
    },
    {
      category: 'GST & Compliance',
      fields: [
        { name: 'place_of_supply', type: 'string | null', desc: 'State / jurisdiction of tax supply' },
        { name: 'place_of_delivery', type: 'string | null', desc: 'State / jurisdiction of destination delivery' },
        { name: 'reverse_charge', type: 'boolean | null', desc: 'Whether GST is payable on reverse charge mechanism (RCM)' },
      ]
    },
    {
      category: 'Financial Totals & Taxes',
      fields: [
        { name: 'subtotal', type: 'number | null', desc: 'Taxable amount before taxes and discounts' },
        { name: 'cgst_amount', type: 'number | null', desc: 'Total Central GST amount' },
        { name: 'sgst_amount', type: 'number | null', desc: 'Total State / Union Territory GST amount' },
        { name: 'igst_amount', type: 'number | null', desc: 'Total Integrated GST amount' },
        { name: 'cess_amount', type: 'number | null', desc: 'Total GST Cess amount' },
        { name: 'tax_amount', type: 'number | null', desc: 'Total aggregate tax / GST amount' },
        { name: 'total_amount', type: 'number | null', desc: 'Grand total payable amount' },
        { name: 'amount_in_words', type: 'string | null', desc: 'Grand total written in words' },
      ]
    },
    {
      category: 'Line Items Array',
      fields: [
        { name: 'line_items', type: 'array of LineItem', desc: 'Itemized breakdown containing description, HSN/SAC code, quantity, unit_price, taxable_amount, cgst/sgst/igst rates & amounts, and total' },
      ]
    }
  ];

  const getTypeBadgeClass = (type) => {
    if (type.includes('number')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (type.includes('boolean')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (type.includes('array')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
  };

  const filteredCategories = schemaCategories.map(cat => ({
    ...cat,
    fields: cat.fields.filter(f => 
      !searchTerm.trim() || 
      f.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) || 
      f.desc.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
  })).filter(cat => cat.fields.length > 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-800 bg-gray-950/90 gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Schema Reference
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate">
                27-field strict JSON specification • Missing values resolve to null
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-gray-950 border border-gray-800">
              <button
                onClick={() => setViewMode('doc')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'doc' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Fields</span>
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'raw' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Raw JSON</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white border border-gray-700/80 transition-colors cursor-pointer"
              title="Copy schema JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar when in doc mode */}
        {viewMode === 'doc' && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-800/80 bg-gray-950/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search schema fields or types..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <span className="text-xs text-gray-500 hidden sm:inline">
              27 Properties Defined
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {viewMode === 'doc' ? (
            <div className="space-y-6">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400/90 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>{group.category}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {group.fields.map((f, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/70 hover:border-gray-700 transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-xs text-indigo-300 truncate">
                              {f.name}
                            </span>
                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border whitespace-nowrap ${getTypeBadgeClass(f.type)}`}>
                              {f.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {f.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 text-xs">
                  No schema fields found matching "{searchTerm}"
                </div>
              )}
            </div>
          ) : (
            <div className="font-mono text-xs text-gray-200 bg-[#06090f] p-5 rounded-xl border border-gray-800 leading-relaxed overflow-x-auto">
              <pre className="whitespace-pre">{schemaString}</pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-800 bg-gray-950/90 flex items-center justify-between text-xs text-gray-400 shrink-0">
          <span className="text-gray-500">27 Root & Item Properties</span>
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
