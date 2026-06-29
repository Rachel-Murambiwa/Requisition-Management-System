"use client";

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  Printer, 
  LogOut, 
  Receipt, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  FileText,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

export default function CountryManagerDashboard() {
  const router = useRouter();
  
  // 🛠️ FIXED: Wrapped initialization to guarantee a single persistent client instance across render flashes
  const [supabase] = useState(() => createClient());
  
  // Initialize state as an empty array ready for real-time relational data pipelines
  const [items, setItems] = useState([]);
  const [viewMode, setViewMode] = useState("manifest"); // 'manifest' or 'analytics'
  const [disbursalStatus, setDisbursalStatus] = useState("idle"); // 'idle', 'processing', 'completed'
  const [selectedChannel, setSelectedChannel] = useState("ecocash corporate wallet");

  // Fetch all pre-vetted requisitions cleared by the Finance Officer
  useEffect(() => {
    const fetchApprovedManifestPool = async () => {
      const { data, error } = await supabase
        .from('requisitions')
        .select('*')
        .eq('status', 'approved'); // Pulls items cleared forward to the master batch

      if (!error && data) {
        // Safe mapping engine shapes table rows to fit your spreadsheet matrix structure
        const structuredPool = data.map(row => ({
          id: row.id,
          desc: row.justification || row.description || 'operational fund allocation',
          class: row.class || "Core Programs",
          location: row.location || row.hub_name || "Harare",
          section: row.section || "Admin",
          category: row.category || "General Procurement",
          qty: 1,
          unitPrice: parseFloat(row.amount) || 0
        }));
        setItems(structuredPool);
      } else if (error) {
        console.error("executive registry synchronization failure:", error.message);
      }
    };

    fetchApprovedManifestPool();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- MATHEMATICAL AGGREGATION ENGINES ---
  const regionalTotals = items.reduce((acc, line) => {
    const totalCost = line.qty * line.unitPrice;
    const loc = line.location.toLowerCase();
    
    if (loc.includes("harare")) acc["harare"] += totalCost;
    else if (loc.includes("bulawayo")) acc["bulawayo"] += totalCost;
    else if (loc.includes("falls") || loc.includes("vic")) acc["victoria falls"] += totalCost;
    
    return acc;
  }, { harare: 0, bulawayo: 0, "victoria falls": 0 });

  const grandTotal = Object.values(regionalTotals).reduce((a, b) => a + b, 0);

  const structuredCategories = items.reduce((acc, curr) => {
    let catNode = acc.find(c => c.category === curr.category);
    if (!catNode) {
      catNode = { category: curr.category, sections: [] };
      acc.push(catNode);
    }
    let secNode = catNode.sections.find(s => s.title === curr.section);
    if (!secNode) {
      secNode = { title: curr.section, lines: [] };
      catNode.sections.push(secNode);
    }
    secNode.lines.push(curr);
    return acc;
  }, []);

  const categoryMetrics = items.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + (curr.qty * curr.unitPrice);
    return acc;
  }, {});

  // Executes the live final release payout handshake across your database ledger
  const runDisbursalRelease = async () => {
    setDisbursalStatus("processing");

    // Extract all tracking IDs currently loaded in the batch matrix array
    const itemIdsToRelease = items.map(i => i.id);

    try {
      // 1. Update the master voucher index rows to disbursed status parameters
      const { error: updateError } = await supabase
        .from('requisitions')
        .update({ status: 'disbursed' })
        .in('id', itemIdsToRelease);

      if (updateError) throw updateError;

      // 2. 🚀 OPTIONAL EXTENSION PLACEHOLDER: Insert notification rows here if you want 
      //    to instantly signal requesters that their funding is dispatched!

      setTimeout(() => {
        setDisbursalStatus("completed");
        setItems([]); // Clear screen list frame since items are successfully pushed out of pipeline
      }, 1200);

    } catch (err) {
      console.error("treasury execution error:", err.message);
      setDisbursalStatus("idle");
      alert("failed releasing capital. verify profile role-based privileges mapping.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans antialiased pb-16">
      
      {/* Universal Executive Navigation Header */}
      <nav className="w-full bg-[#0A1628] text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#0747A1] text-white font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">treasury</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#1A2E4A] p-1 rounded-md border border-slate-700">
              <button 
                onClick={() => setViewMode('manifest')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all focus:outline-none lowercase cursor-pointer border-none ${
                  viewMode === 'manifest' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white bg-transparent'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>invoice manifest</span>
              </button>
              <button 
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all focus:outline-none lowercase cursor-pointer border-none ${
                  viewMode === 'analytics' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white bg-transparent'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>analytics trends</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-700" />
            <NotificationCenter role="country-manager" />
            <div className="h-6 w-px bg-slate-700" />
            
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors focus:outline-none bg-transparent border-none cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-[#0A1628] tracking-tight lowercase">executive oversight terminal</h1>
            <p className="text-xs text-[#4B5563] mt-0.5">final corporate sign-off, historical chart tracking, and capital release channel control</p>
          </div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#4B5563] text-xs font-bold px-4 py-2 rounded-md shadow-sm transition-all cursor-pointer"><Printer className="w-3.5 h-3.5" /> <span className="lowercase">print file view</span></button>
        </div>

        {disbursalStatus === "completed" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-sm text-green-800 animate-fadeIn print:hidden">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
            <div><strong>disbursal completed successfully.</strong> central billing manifest pipeline has been released.</div>
          </div>
        )}

        {viewMode === 'manifest' ? (
          <div className="w-full bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6 sm:p-10 print:border-none print:shadow-none animate-fadeIn">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-b border-gray-200 pb-6">
              <div className="border border-gray-300 rounded overflow-hidden max-w-sm">
                <div className="bg-[#0747A1] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">billed to</div>
                <div className="p-3 text-xs text-[#111827] font-medium leading-relaxed">
                  <div className="font-bold text-sm text-[#0A1628]">Uncommon.org Inc</div>
                  <div>Peter Kazickas</div>
                  <div>5 Hamlin Lane</div>
                  <div>Amagansett, NY 11930</div>
                </div>
              </div>

              <div className="md:text-right space-y-3">
                <h2 className="text-2xl font-bold text-[#0A1628] lowercase">requisition request</h2>
                <div className="inline-block text-left border border-gray-200 bg-gray-50 rounded p-2.5 text-xs font-medium space-y-0.5">
                  <div><span className="text-[#4B5563]">Invoice No:</span> <span className="font-mono font-bold text-[#0A1628]">1106</span></div>
                  {/* 📆 UPDATED: Formats dynamically to match current tracking context dates */}
                  <div><span className="text-[#4B5563]">Approval Date:</span> <span className="font-mono font-bold text-[#0A1628]">{new Date().toISOString().split('T')[0].replace(/-/g, '/')}</span></div>
                </div>
              </div>
            </div>

            <div className="my-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
              <div className="w-full max-w-sm border border-gray-300 rounded overflow-hidden shadow-sm">
                <div className="bg-[#0747A1] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider">payment amounts</div>
                <div className="p-4 bg-white space-y-3">
                  <div className="text-xs font-bold text-[#0A1628]">Purpose of Funds: <span className="font-medium text-[#4B5563]">June Program Expenses</span></div>
                  <div className="space-y-1.5 text-xs font-medium text-[#4B5563] border-b border-gray-100 pb-2.5">
                    <div className="flex justify-between"><span>Harare</span><span className="font-mono font-bold text-[#0A1628]">${regionalTotals['harare'].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span>Vic Falls</span><span className="font-mono font-bold text-[#0A1628]">${regionalTotals['victoria falls'].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span>Bulawayo</span><span className="font-mono font-bold text-[#0A1628]">${regionalTotals['bulawayo'].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                  </div>
                  <div className="flex justify-between items-baseline text-sm font-bold text-[#0A1628]">
                    <span>GRAND TOTAL</span>
                    <span className="font-mono text-[#0747A1] text-base">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-slate-200 bg-slate-50 rounded-lg w-full max-w-md space-y-4 print:hidden">
                <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#0747A1]" />
                  <span>treasury disbursal release channel</span>
                </div>
                
                <select 
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  disabled={disbursalStatus !== "idle"}
                  className="w-full p-2 text-xs border border-slate-300 rounded bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0747A1] uppercase tracking-wide cursor-pointer"
                >
                  <option value="ecocash corporate wallet">ecocash corporate wallet run</option>
                  <option value="direct bank transfer">direct bank wire transfer batch</option>
                  <option value="petty cash pool">petty cash allocation ledger</option>
                </select>

                {items.length > 0 ? (
                  <button
                    onClick={runDisbursalRelease}
                    disabled={disbursalStatus === "processing"}
                    className={`w-full py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider text-white shadow transition-all border-none cursor-pointer ${
                      disbursalStatus === 'processing' ? 'bg-slate-400 cursor-wait' : 'bg-[#0747A1] hover:opacity-90'
                    }`}
                  >
                    {disbursalStatus === 'idle' ? `authorize & disburse $${grandTotal.toLocaleString()}` : "processing treasury payout pipelines..."}
                  </button>
                ) : (
                  <div className="text-center p-3 text-xs bg-gray-100 rounded text-gray-400 font-medium select-none lowercase">
                    no pending master vouchers loaded to release
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200">
                <thead>
                  <tr className="border-b border-gray-400 text-[10px] font-bold text-[#4B5563] uppercase tracking-wider bg-gray-50 select-none">
                    <th className="py-2.5 px-3 w-5/12">description</th>
                    <th className="py-2.5 px-3">class</th>
                    <th className="py-2.5 px-3">location</th>
                    <th className="py-2.5 px-3 text-center">qty</th>
                    <th className="py-2.5 px-3 text-right">unit price</th>
                    <th className="py-2.5 px-3 text-right">total</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-800">
                  {items.length > 0 ? (
                    structuredCategories.map((cat, cIdx) => (
                      <Fragment key={cIdx}>
                        <tr className="bg-[#FBBF24]/90 border-t border-b border-gray-300">
                          <td colSpan="6" className="py-2 px-3 font-bold text-[#0A1628] text-xs lowercase">{cat.category}</td>
                        </tr>
                        {cat.sections.map((sec, sIdx) => (
                          <Fragment key={sIdx}>
                            <tr className="bg-gray-100/60">
                              <td colSpan="6" className="py-1.5 px-3 font-extrabold text-[#0A1628] pl-4 border-b border-gray-200 lowercase">{sec.title}</td>
                            </tr>
                            {sec.lines.map((line, lIdx) => (
                              <tr key={lIdx} className="hover:bg-gray-50/50 border-b border-gray-200">
                                <td className="py-3 px-3 pl-6 text-gray-700 font-medium lowercase">{line.desc}</td>
                                <td className="py-3 px-3 text-gray-500 font-medium lowercase">{line.class}</td>
                                <td className="py-3 px-3 text-gray-600 font-bold lowercase">{line.location}</td>
                                <td className="py-3 px-3 text-center font-mono">{line.qty}</td>
                                <td className="py-3 px-3 text-right font-mono text-gray-500">${line.unitPrice.toFixed(2)}</td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-[#0A1628]">${(line.qty * line.unitPrice).toFixed(2)}</td>
                              </tr>
                            ))}
                          </Fragment>
                        ))}
                      </Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-12 bg-white text-gray-400 select-none lowercase">
                        no approved vouchers waiting inside master manifest pipeline.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-8 sm:p-12 print:border-none print:shadow-none space-y-12 animate-slideDown">
            <div className="flex justify-between border-b border-gray-200 pb-6">
              <div>
                <div className="text-2xl font-black text-[#0747A1]">uncommon</div>
                <div className="text-xs text-[#4B5563] font-bold uppercase tracking-wider mt-1">executive audit & trend matrix</div>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">registry: active pipeline overview</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-[#4B5563] flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-[#0747A1]" /> 6-cycle operations investment scaling</h3>
                <div className="border border-gray-100 rounded p-4 bg-white shadow-sm">
                  <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="cmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0747A1" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#0747A1" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#F9FAFB" strokeWidth="1" />
                    <line x1="0" y1="110" x2="500" y2="110" stroke="#F9FAFB" strokeWidth="1" />
                    <line x1="0" y1="180" x2="500" y2="180" stroke="#E5E7EB" strokeWidth="1.5" />

                    <polygon points="0,180 100,130 200,160 300,100 400,140 500,40 500,180 0,180" fill="url(#cmGrad)" />
                    <polyline points="0,130 100,130 200,160 300,100 400,140 500,40" fill="transparent" stroke="#0747A1" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="500" cy="40" r="5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />

                    <text x="0" y="194" className="text-[9px] font-bold fill-gray-400 font-mono uppercase">jan</text>
                    <text x="100" y="194" className="text-[9px] font-bold fill-gray-400 font-mono uppercase">feb</text>
                    <text x="200" y="194" className="text-[9px] font-bold fill-gray-400 font-mono uppercase">mar</text>
                    <text x="300" y="194" className="text-[9px] font-bold fill-gray-400 font-mono uppercase">apr</text>
                    <text x="400" y="194" className="text-[9px] font-bold fill-gray-400 font-mono uppercase">may</text>
                    <text x="440" y="194" className="text-[9px] font-bold fill-[#0747A1] font-mono uppercase">jun (approved)</text>
                    
                    <text x="420" y="25" className="text-xs font-black fill-[#0747A1] font-mono">${grandTotal.toLocaleString()}</text>
                  </svg>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-[#4B5563] flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#0747A1]" /> platform pipeline conversion health</h3>
                <div className="border border-gray-100 rounded p-4 shadow-sm flex flex-col items-center justify-center min-h-[190px]">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="42" stroke="#F3F4F6" strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="42" stroke="#16A34A" strokeWidth="8" fill="transparent" strokeDasharray={263.8} strokeDashoffset={263.8 - (263.8 * 0.88)} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-lg font-black text-[#0A1628]">88%</span>
                      <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tight">clearance score</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#4B5563] mt-4 font-medium text-center max-w-xs">high clearance percentage reflects strict baseline pre-vetting validation checks by the finance officer before hopping layers.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase text-[#4B5563] mb-4 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> asset intensity allocation map</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(categoryMetrics).map(([catName, val]) => {
                  const sharePercentage = grandTotal > 0 ? ((val / grandTotal) * 100).toFixed(0) : 0;
                  return (
                    <div key={catName} className="p-4 border border-gray-100 bg-[#F9FAFB] rounded">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block truncate">{catName}</span>
                      <span className="text-base font-bold text-[#0A1628] font-mono mt-1 block">${val.toFixed(2)}</span>
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-[#0747A1]" style={{ width: `${sharePercentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-12 border-t border-dashed border-gray-300 flex justify-between items-end text-xs text-gray-500">
              <div className="leading-relaxed text-[11px]">autogenerated via uncommon rms audit systems module<br />internal use only • confidential programmatic financial ledger report</div>
              <div className="text-center w-48 shrink-0">
                <div className="w-full h-px bg-gray-400 mb-2" />
                <div className="text-[10px] font-bold text-[#0A1628] uppercase tracking-widest">head of operations signature</div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}