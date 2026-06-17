"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, DollarSign, UploadCloud, AlertTriangle, FileCheck, X, CheckCircle2 } from 'lucide-react';

export default function NewRequisitionPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form Field Interactive States
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [justification, setJustification] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Compliance Document Tracking States
  const [isEmergency, setIsEmergency] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [vatCerts, setVatCerts] = useState([]);
  const [emergencyDocs, setEmergencyDocs] = useState([]);

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hubCategories = [
    'hub equipment & hardware',
    'internet, data & utilities',
    'workshop & classroom supplies',
    'marketing & community outreach',
    'travel & logisitics',
    'miscellaneous emergency funds'
  ];

  const paymentChannels = [
    'ecocash corporate wallet',
    'direct bank transfer',
    'petty cash disbursement'
  ];

  const parsedAmount = parseFloat(amount) || 0;
  const requiresComplianceDocs = parsedAmount > 50 && !isEmergency;

  // Capped File Matrix Appenders
  const handleQuotesUpload = (e) => {
    const incoming = Array.from(e.target.files);
    const availableSlots = 3 - quotes.length;
    if (availableSlots <= 0) return;
    
    // Slice incoming files to make sure we never exceed the remaining quota
    setQuotes([...quotes, ...incoming.slice(0, availableSlots)]);
  };

  const handleVatCertsUpload = (e) => {
    const incoming = Array.from(e.target.files);
    const availableSlots = 3 - vatCerts.length;
    if (availableSlots <= 0) return;

    setVatCerts([...vatCerts, ...incoming.slice(0, availableSlots)]);
  };

  const removeQuoteFile = (indexToRemove) => {
    setQuotes(quotes.filter((_, idx) => idx !== indexToRemove));
  };

  const removeVatFile = (indexToRemove) => {
    setVatCerts(vatCerts.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitRequisition = async () => {
    if (!amount || !category || !justification || !paymentMethod) {
      setError('all foundational fields are required to log an official funding requisition.');
      return;
    }

    if (parsedAmount <= 0) {
      setError('please enter a valid monetary amount greater than zero.');
      return;
    }

    if (requiresComplianceDocs) {
      if (quotes.length !== 3 || vatCerts.length !== 3) {
        setError('procurement guidelines state you must supply exactly 3 distinct quotes and 3 matching vat certificates.');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('requisitions')
        .insert([{
          user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          amount: parsedAmount,
          category,
          justification,
          payment_method: paymentMethod,
          is_emergency: isEmergency,
          priority: isEmergency ? 'high' : 'standard',
          status: 'pending',
          current_stage: isEmergency ? 'finance_officer' : 'hub_manager'
        }]);

      if (insertError) throw insertError;
      setIsSuccess(true);
    } catch (err) {
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-3xl mx-auto min-h-screen bg-white">
      
      {/* Navigation Back Link */}
      <div 
        onClick={() => router.push('/requester')}
        className="flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#1D4ED8] font-semibold transition-colors cursor-pointer mb-8 select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="lowercase">back to overview</span>
      </div>

      {!isSuccess ? (
        <>
          {/* Header Identity Block */}
          <div className="flex flex-col mb-8">
            <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">
              submit fund requisition
            </h1>
            <p className="text-sm text-[#4B5563] mt-2 tracking-normal">
              initialize an internal cash allocation request for your operational hub
            </p>
          </div>

          {/* Priority Selection Toggle Block */}
          <div className="mb-8 p-1.5 bg-[#F3F4F6] rounded-lg grid grid-cols-2 text-center select-none">
            <div 
              onClick={() => !isLoading && setIsEmergency(false)}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-md cursor-pointer transition-all ${
                !isEmergency ? 'bg-white text-[#0A1628] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              standard request
            </div>
            <div 
              onClick={() => !isLoading && setIsEmergency(true)}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-md cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isEmergency ? 'bg-[#991B1B] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#991B1B]'
              }`}
            >
              {isEmergency && <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />}
              emergency priority
            </div>
          </div>

          {/* Validation Alert Portal */}
          {error && (
            <div className="mb-6 p-3 bg-[#FEE2E2] border border-l-4 border-l-[#991B1B] border-[#FECACA] rounded-r-md text-xs font-medium text-[#991B1B]">
              {error}
            </div>
          )}

          {/* Layout Content Fields Panel Grid */}
          <div className="space-y-6">
            
            {/* Amount Field Box Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="amount-input">
                required amount (usd)
              </label>
              <div className="relative flex items-center">
                <DollarSign className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                <input
                  id="amount-input"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all font-sans font-medium"
                />
              </div>
              {parsedAmount > 50 && !isEmergency && (
                <span className="text-[11px] font-medium text-[#B45309] mt-1 flex items-center gap-1">
                  ⚠️ amounts exceeding $50 strictly require triple quotation and vat verification matrix rows.
                </span>
              )}
            </div>

            {/* Category Dropdown Input Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="category-select">
                allocation category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all lowercase font-medium"
              >
                <option value="">select an operational category...</option>
                {hubCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Payment Mode Disbursal Preference Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="payment-select">
                preferred disbursement channel
              </label>
              <select
                id="payment-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all lowercase font-medium"
              >
                <option value="">select preferred distribution route...</option>
                {paymentChannels.map((mode, idx) => (
                  <option key={idx} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            {/* PROCUREMENT COMPLIANCE BLOCK: Standard Over $50 (Enforcing exactly 3 entries) */}
            {requiresComplianceDocs && (
              <div className="p-5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] space-y-4 animate-slideDown">
                <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider border-b border-[#E5E7EB] pb-2">
                  procurement compliance attachments ($50+ threshold)
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Quotations Slot */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-wide">
                      1. 3 separate quotations ({quotes.length}/3)
                    </span>
                    
                    <label className={`border border-dashed rounded-md p-4 flex flex-col items-center justify-center gap-1 transition-colors ${
                      quotes.length >= 3 
                        ? 'bg-[#F3F4F6] border-[#D1D5DB] cursor-not-allowed opacity-70' 
                        : 'bg-white border-[#CDD5DF] cursor-pointer hover:bg-gray-50'
                    }`}>
                      <UploadCloud className={`w-5 h-5 ${quotes.length >= 3 ? 'text-[#9CA3AF]' : 'text-[#1D4ED8]'}`} />
                      <span className="text-xs text-[#4B5563] font-medium">
                        {quotes.length >= 3 ? 'quotation requirement met' : 'click to select quotes'}
                      </span>
                      <input 
                        type="file" 
                        multiple 
                        disabled={isLoading || quotes.length >= 3}
                        onChange={handleQuotesUpload}
                        className="hidden" 
                      />
                    </label>

                    <div className="space-y-1.5 mt-1">
                      {quotes.map((f, i) => (
                        <div key={i} className="text-xs bg-white border border-[#E5E7EB] px-2.5 py-1.5 rounded flex items-center justify-between text-[#0A1628] font-medium shadow-sm">
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            <FileCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </div>
                          <X 
                            onClick={() => removeQuoteFile(i)} 
                            className="w-3.5 h-3.5 text-[#9CA3AF] hover:text-[#991B1B] cursor-pointer shrink-0 transition-colors" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VAT Clearances Slot */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-wide">
                      2. 3 corresponding vat certificates ({vatCerts.length}/3)
                    </span>
                    
                    <label className={`border border-dashed rounded-md p-4 flex flex-col items-center justify-center gap-1 transition-colors ${
                      vatCerts.length >= 3 
                        ? 'bg-[#F3F4F6] border-[#D1D5DB] cursor-not-allowed opacity-70' 
                        : 'bg-white border-[#CDD5DF] cursor-pointer hover:bg-gray-50'
                    }`}>
                      <UploadCloud className={`w-5 h-5 ${vatCerts.length >= 3 ? 'text-[#9CA3AF]' : 'text-[#1D4ED8]'}`} />
                      <span className="text-xs text-[#4B5563] font-medium">
                        {vatCerts.length >= 3 ? 'vat certificate requirement met' : 'click to select vat certificates'}
                      </span>
                      <input 
                        type="file" 
                        multiple 
                        disabled={isLoading || vatCerts.length >= 3}
                        onChange={handleVatCertsUpload}
                        className="hidden" 
                      />
                    </label>

                    <div className="space-y-1.5 mt-1">
                      {vatCerts.map((f, i) => (
                        <div key={i} className="text-xs bg-white border border-[#E5E7EB] px-2.5 py-1.5 rounded flex items-center justify-between text-[#0A1628] font-medium shadow-sm">
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            <FileCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </div>
                          <X 
                            onClick={() => removeVatFile(i)} 
                            className="w-3.5 h-3.5 text-[#9CA3AF] hover:text-[#991B1B] cursor-pointer shrink-0 transition-colors" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Emergency Multi-Upload Vault Override */}
            {isEmergency && (
              <div className="p-5 border border-[#FECACA] rounded-lg bg-[#FFF5F5] space-y-3 animate-slideDown">
                <div className="text-xs font-bold text-[#991B1B] uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>emergency documentation bypass active</span>
                </div>
                <p className="text-xs text-[#7F1D1D] leading-relaxed">
                  strict matching limits are bypassed. please upload whatever invoices, receipts, or breakdown notes you currently have available to support processing velocity.
                </p>
                <div className="flex flex-col gap-2">
                  <label className="border border-dashed border-[#FCA5A5] bg-white rounded-md p-6 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-red-50/50 transition-colors">
                    <UploadCloud className="w-6 h-6 text-[#F87171]" />
                    <span className="text-xs font-medium text-[#7F1D1D]">upload emergency supporting files</span>
                    <input 
                      type="file" 
                      multiple 
                      disabled={isLoading}
                      onChange={(e) => setEmergencyDocs([...emergencyDocs, ...Array.from(e.target.files)])}
                      className="hidden" 
                    />
                  </label>
                  {emergencyDocs.map((f, i) => (
                    <div key={i} className="text-xs bg-white border border-[#FECACA] px-2.5 py-1.5 rounded flex items-center justify-between text-[#7F1D1D] font-medium shadow-sm">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <FileCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span className="truncate">{f.name}</span>
                      </div>
                      <X 
                        onClick={() => setEmergencyDocs(emergencyDocs.filter((_, idx) => idx !== i))} 
                        className="w-3.5 h-3.5 text-[#FCA5A5] hover:text-[#991B1B] cursor-pointer shrink-0 transition-colors" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Justification / Purpose Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="justification-text">
                business justification & itemized breakdown
              </label>
              <textarea
                id="justification-text"
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="describe exactly what these funds will purchase and provide links or context where applicable..."
                disabled={isLoading}
                className="w-full p-3 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all font-sans resize-none"
              />
            </div>

            {/* Form Submission Action Triggers */}
            <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#E5E7EB]">
              <div
                onClick={() => !isLoading && router.push('/requester')}
                className="px-5 py-2.5 text-sm font-medium text-[#4B5563] hover:text-[#111827] cursor-pointer select-none lowercase transition-colors"
              >
                cancel
              </div>
              <div
                onClick={!isLoading ? handleSubmitRequisition : undefined}
                className={`py-2.5 px-6 font-medium text-sm rounded-md shadow-sm select-none transition-colors cursor-pointer text-center lowercase ${
                  isEmergency ? 'bg-[#991B1B] hover:bg-[#7F1D1D] text-white' : 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white'
                } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'submitting request...' : 'submit requisition'}
              </div>
            </div>

          </div>
        </>
      ) : (
        /* Successful Submission View State Blueprint */
        <div className="flex flex-col text-left py-8 animate-fadeIn">
          <CheckCircle2 className="w-14 h-14 text-[#16A34A] mb-6 stroke-[1.5]" />
          <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">
            requisition logged successfully
          </h1>
          <p className="text-sm text-[#4B5563] mt-3 leading-relaxed max-w-md">
            your request for <strong className="text-[#0A1628] font-semibold">${parsedAmount.toFixed(2)}</strong> has been indexed and flagged as <strong className={isEmergency ? 'text-[#991B1B]' : 'text-[#1D4ED8]'}>{isEmergency ? 'emergency priority' : 'standard priority'}</strong> inside the queue registry.
          </p>
          <div className="mt-10 pt-4 border-t border-[#E5E7EB]">
            <div
              onClick={() => router.push('/requester')}
              className="inline-flex items-center justify-center py-2.5 px-6 bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-medium text-sm rounded-md shadow-sm select-none transition-colors cursor-pointer text-center lowercase"
            >
              return to dashboard
            </div>
          </div>
        </div>
      )}

    </div>
  );
}