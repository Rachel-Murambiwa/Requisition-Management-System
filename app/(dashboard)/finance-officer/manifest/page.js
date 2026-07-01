"use client";

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Printer, CheckSquare, Loader2, CheckCircle2 } from 'lucide-react';

export default function FinanceManifestCompilationPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // 📊 Dynamic State Management Engines
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardSuccess, setForwardSuccess] = useState(false);

  // Hydrate all entries currently pre-cleared by operations
  useEffect(() => {
    const fetchApprovedVouchers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('requisitions')
          .select('*')
          .eq('status', 'approved');

        if (error) throw error;
        if (data) setItems(data);
      } catch (err) {
        console.error("Manifest matrix collection error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedVouchers();
  }, [supabase]);

  // Group the isolated approved entries into structural headers dynamically
  const nestedManifest = items.reduce((acc, currentItem) => {
    const categoryName = currentItem.category || "General Procurement";
    const sectionName = currentItem.section || "Admin";

    let existingCategory = acc.find(c => c.category === categoryName);
    if (!existingCategory) {
      existingCategory = { category: categoryName, sections: [] };
      acc.push(existingCategory);
    }

    let existingSection = existingCategory.sections.find(s => s.sectionTitle === sectionName);
    if (!existingSection) {
      existingSection = { sectionTitle: sectionName, lines: [] };
      existingCategory.sections.push(existingSection);
    }

    existingSection.lines.push({
      desc: currentItem.justification || currentItem.description || 'operational allocation',
      class: currentItem.class || "Core Programs",
      location: currentItem.location || "Harare",
      hub: currentItem.hub_name || "HQ",
      qty: 1,
      unitPrice: parseFloat(currentItem.amount || 0)
    });
    return acc;
  }, []);

  // Compute subtotal boxes safely from normalized regional tags
  const regionalTotals = items.reduce((acc, line) => {
    const totalCost = parseFloat(line.amount || 0);
    const loc = (line.location || "").toLowerCase();
    
    if (loc.includes("harare")) acc["harare"] += totalCost;
    else if (loc.includes("bulawayo")) acc["bulawayo"] += totalCost;
    else if (loc.includes("falls") || loc.includes("vic")) acc["victoria falls"] += totalCost;
    
    return acc;
  }, { harare: 0, bulawayo: 0, "victoria falls": 0 });

  const grandTotal = Object.values(regionalTotals).reduce((a, b) => a + b, 0);

  // 🚀 HANDSHAKE DISPATCH: Transmits notification metrics to the Country Manager over WebSockets
  const handleForwardToManager = async () => {
    if (items.length === 0) return;
    
    setIsForwarding(true);
    setForwardSuccess(false);

    try {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert([{
          role: 'country-manager',
          type: 'stage_4',
          title: 'master invoice compiled',
          msg: `fo submitted a consolidated manifest of ${items.length} items totaling $${grandTotal.toFixed(2)}.`,
          time_label: 'just now',
          link: '/country-manager',
          read: false
        }]);

      if (notifyError) throw notifyError;

      setForwardSuccess(true);
      // Optional: Redirect back to main desk pool after a brief validation delay
      setTimeout(() => {
        router.push('/finance-officer');
      }, 2000);
    } catch (err) {
      console.error("Handshake bridge failed:", err.message);
      alert("failed dropping notification parameter logs onto the target database layer.");
    } finally {
      setIsForwarding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans antialiased pb-16">
      
      {/* Top Action Utility Toolbar */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => router.push('/finance-officer')}
            className="flex items-center gap-2 text-xs font-semibold text-[#4B5563] hover:text-[#0747A1] cursor-pointer select-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="lowercase">back to review pool</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#4B5563] text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-colors cursor-pointer select-none disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="lowercase">print manifestation sheet</span>
            </button>
            <button 
              onClick={handleForwardToManager}
              disabled={loading || items.length === 0 || champions || isForwarding}
              className="inline-flex items-center gap-2 bg-[#0747A1] hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-colors cursor-pointer select-none disabled:opacity-40 border-none"
            >
              {isForwarding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
              <span className="lowercase">{isForwarding ? "transmitting..." : "forward to country manager for disbursement"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* INVOICE CONTAINER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 print:mt-0 space-y-4">
        
        {forwardSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 text-xs font-bold text-green-800 rounded-lg flex items-center gap-2 lowercase shadow-sm animate-fadeIn print:hidden">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>manifest matrix cleared and routed onto the country manager gateway stream successfully.</span>
          </div>
        )}

        <div className="w-full bg-white shadow-sm border border-[#E5E7EB] rounded-lg p-6 sm:p-10 print:border-none print:shadow-none font-sans">
          
          {/* Header Metadata Section Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-b border-gray-200 pb-8">
            <div className="border border-gray-300 rounded overflow-hidden shadow-sm max-w-md">
              <div className="bg-[#0A4EA3] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                billed to
              </div>
              <div className="p-3 text-xs text-[#111827] font-medium leading-relaxed font-sans">
                <div className="font-bold text-sm text-[#0A1628]">Uncommon.org Inc</div>
                <div>Peter Kazickas</div>
                <div>5 Hamlin Lane</div>
                <div>Amagansett, NY 11930</div>
                <div className="text-[#0747A1] mt-1 font-semibold">Peter@uncommon.org</div>
              </div>
            </div>

            <div className="md:text-right space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0A1628] font-sans tracking-tight">Requisition Request</h1>
              </div>
              <div className="inline-block text-left border border-gray-200 bg-gray-50 rounded p-3 text-xs font-medium space-y-1">
                <div><span className="text-[#4B5563]">Invoice No:</span> <span className="font-mono font-bold text-[#0A1628]">1106</span></div>
                <div><span className="text-[#4B5563]">Approval Date:</span> <span className="font-mono font-bold text-[#0A1628]">{new Date().toISOString().split('T')[0].replace(/-/g, '/')}</span></div>
              </div>
            </div>
          </div>

          {/* REGIONAL ACCUMULATION CARD MATRIX BOX PANEL */}
          <div className="my-8 flex justify-start">
            <div className="w-full max-w-xl border border-gray-300 rounded overflow-hidden shadow-sm">
              <div className="bg-[#0A4EA3] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                payment amounts
              </div>
              <div className="p-4 bg-white space-y-3">
                <div className="text-xs font-bold text-[#0A1628]">
                  Purpose of Funds: <span className="font-medium text-[#4B5563]">June Program Expenses</span>
                </div>
                
                <div className="flex justify-between items-baseline border-b border-gray-200 pb-2 text-sm font-bold text-[#0A1628]">
                  <span>GRAND TOTAL</span>
                  <span className="font-mono text-[#0A4EA3] text-base">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="space-y-1.5 text-xs font-medium text-[#4B5563]">
                  <div className="flex justify-between">
                    <span>Subtotal Harare</span>
                    <span className="font-mono font-bold text-[#0A1628]">${regionalTotals['harare'].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal Bulawayo</span>
                    <span className="font-mono font-bold text-[#0A1628]">${regionalTotals['bulawayo'].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal Victoria Falls</span>
                    <span className="font-mono font-bold text-[#0A1628]">${regionalTotals['victoria falls'].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MASTER SPREADSHEET LEDGER VIEWPORT */}
          <div className="mt-10 overflow-x-auto">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 lowercase text-xs">
                <Loader2 className="w-5 h-5 text-[#0747A1] animate-spin" />
                <span>generating invoice ledger frames...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic lowercase select-none">
                no approved records found waiting compilation.
              </div>
            ) : (
              <table className="w-full text-left border-collapse border border-gray-200">
                <thead>
                  <tr className="border-b border-gray-400 text-[11px] font-bold text-[#4B5563] uppercase tracking-wider bg-gray-50/70">
                    <th className="py-3 px-4 w-5/12">description</th>
                    <th className="py-3 px-4">class</th>
                    <th className="py-3 px-4">location</th>
                    <th className="py-3 px-4">hub</th>
                    <th className="py-3 px-4 text-center">qty</th>
                    <th className="py-3 px-4 text-right">unit price</th>
                    <th className="py-3 px-4 text-right">total</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-[#111827]">
                  {nestedManifest.map((cat, catIdx) => (
                    <Fragment key={catIdx}>
                      <tr className="bg-[#FBBF24]/90 print:bg-[#FBBF24] border-t border-b border-gray-300">
                        <td colSpan="7" className="py-2 px-4 font-bold text-[#0A1628] tracking-wide text-xs lowercase">
                          {cat.category}
                        </td>
                      </tr>

                      {cat.sections.map((sec, secIdx) => (
                        <Fragment key={secIdx}>
                          <tr className="bg-gray-100/50">
                            <td colSpan="7" className="py-2 px-4 font-extrabold text-[#0A1628] tracking-tight border-b border-gray-200 lowercase">
                              {sec.sectionTitle}
                            </td>
                          </tr>

                          {sec.lines.map((line, lineIdx) => (
                            <tr key={lineIdx} className="hover:bg-gray-50/60 border-b border-gray-200">
                              <td className="py-3.5 px-4 font-sans text-gray-700 font-medium pl-6 lowercase">{line.desc}</td>
                              <td className="py-3.5 px-4 font-medium text-gray-600 lowercase">{line.class}</td>
                              <td className="py-3.5 px-4 text-gray-600 font-medium lowercase">{line.location}</td>
                              <td className="py-3.5 px-4 font-mono text-gray-400 uppercase">{line.hub}</td>
                              <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-600">{line.qty}</td>
                              <td className="py-3.5 px-4 text-right font-mono text-gray-600">${line.unitPrice.toFixed(2)}</td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0A1628]">${(line.qty * line.unitPrice).toFixed(2)}</td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}