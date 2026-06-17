"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, CheckSquare } from 'lucide-react';

// Unified row items database cache matching your precise invoice template fields
const UNFILTERED_POOL_DATA = [
  { desc: "Transport for Nkosi ( recurring until PDC residence is completed )", class: "Core Programs", location: "Harare", section: "Admin", category: "Business Travel and Expenses", qty: 1, unitPrice: 130.00, status: "approved" },
  { desc: "Transport for Nkosi to VF for Guests", class: "Core Programs", location: "Harare", section: "Admin", category: "Business Travel and Expenses", qty: 1, unitPrice: 215.00, status: "approved" },
  { desc: "Indrive Expenses for Ronald", class: "Fundraising", location: "Harare", section: "Admin", category: "Business Travel and Expenses", qty: 1, unitPrice: 70.00, status: "approved" },
  { desc: "Admin travel to Gwoke Sensitisation Workshop", class: "Core Programs", location: "Harare", section: "Site Visits", category: "Business Travel and Expenses", qty: 1, unitPrice: 1190.00, status: "approved" },
  { desc: "Admin travel to Victoria Falls", class: "Core Programs", location: "Harare", section: "Site Visits", category: "Business Travel and Expenses", qty: 1, unitPrice: 1390.00, status: "approved" },
  { desc: "Deep-cycle solar inverter battery cells backup replacement", class: "Core Programs", location: "Bulawayo", section: "Hub Enhancements", category: "Operational Infrastructure Assets", qty: 1, unitPrice: 100.00, status: "approved" },
  { desc: "Classroom fiber drop line link termination splicing kits", class: "Core Programs", location: "Victoria Falls", section: "Hub Enhancements", category: "Operational Infrastructure Assets", qty: 1, unitPrice: 1555.00, status: "approved" },
  { desc: "Marketing banners for tech recruitment drive", class: "Marketing", location: "Bulawayo", section: "Outreach", category: "Marketing & Outreach", qty: 1, unitPrice: 180.00, status: "pending" } // Skipped automatically
];

export default function FinanceManifestCompilationPage() {
  const router = useRouter();

  // STRICT RULE: Filter the array on the fly to pick ONLY items approved by Head of Operations
  const approvedItems = UNFILTERED_POOL_DATA.filter(item => item.status === "approved");

  // Group the isolated approved entries into structural headers dynamically
  const nestedManifest = approvedItems.reduce((acc, currentItem) => {
    let existingCategory = acc.find(c => c.category === currentItem.category);
    if (!existingCategory) {
      existingCategory = { category: currentItem.category, sections: [] };
      acc.push(existingCategory);
    }

    let existingSection = existingCategory.sections.find(s => s.sectionTitle === currentItem.section);
    if (!existingSection) {
      existingSection = { sectionTitle: currentItem.section, lines: [] };
      existingCategory.sections.push(existingSection);
    }

    existingSection.lines.push(currentItem);
    return acc;
  }, []);

  // Compute subtotal boxes safely from normalized regional tags
  const regionalTotals = approvedItems.reduce((acc, line) => {
    const totalCost = line.qty * line.unitPrice;
    const loc = line.location.toLowerCase();
    if (acc[loc] !== undefined) acc[loc] += totalCost;
    return acc;
  }, { harare: 0, bulawayo: 0, "victoria falls": 0 });

  const grandTotal = Object.values(regionalTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans antialiased pb-16">
      
      {/* Top Action Utility Toolbar */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => router.push('/finance-officer')}
            className="flex items-center gap-2 text-xs font-semibold text-[#4B5563] hover:text-[#1D4ED8] cursor-pointer select-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="lowercase">back to review pool</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#4B5563] text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-colors cursor-pointer select-none"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="lowercase">print manifestation sheet</span>
            </button>
            <button 
              onClick={() => alert('manifest compiled and forwarded successfully to the country manager authorization stream.')}
              className="inline-flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-colors cursor-pointer select-none"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="lowercase">forward to country manager for disbursement</span>
            </button>
          </div>
        </div>
      </div>

      {/* INVOICE CONTAINER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 print:mt-0">
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
                <div className="text-[#1D4ED8] mt-1">Peter@uncommon.org</div>
              </div>
            </div>

            <div className="md:text-right space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0A1628] font-sans tracking-tight">Requisition Request</h1>
              </div>
              <div className="inline-block text-left border border-gray-200 bg-gray-50 rounded p-3 text-xs font-medium space-y-1">
                <div><span className="text-[#4B5563]">Invoice No:</span> <span className="font-mono font-bold text-[#0A1628]">1106</span></div>
                <div><span className="text-[#4B5563]">Approval Date:</span> <span className="font-mono font-bold text-[#0A1628]">2026/05/29</span></div>
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
                  <div key={catIdx} className="contents">
                    <tr className="bg-[#FBBF24]/90 print:bg-[#FBBF24] border-t border-b border-gray-300">
                      <td colSpan="7" className="py-2 px-4 font-bold text-[#0A1628] tracking-wide text-xs">
                        {cat.category}
                      </td>
                    </tr>

                    {cat.sections.map((sec, secIdx) => (
                      <div key={secIdx} className="contents">
                        <tr className="bg-gray-100/50">
                          <td colSpan="7" className="py-2 px-4 font-extrabold text-[#0A1628] tracking-tight border-b border-gray-200">
                            {sec.sectionTitle}
                          </td>
                        </tr>

                        {sec.lines.map((line, lineIdx) => (
                          <tr key={lineIdx} className="hover:bg-gray-50/60 border-b border-gray-200">
                            <td className="py-3.5 px-4 font-sans text-gray-700 font-medium pl-6">{line.desc}</td>
                            <td className="py-3.5 px-4 font-medium text-gray-600">{line.class}</td>
                            <td className="py-3.5 px-4 text-gray-600 font-medium">{line.location}</td>
                            <td className="py-3.5 px-4 font-mono text-gray-400">{line.hub}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-600">{line.qty}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-gray-600">${line.unitPrice.toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0A1628]">${(line.qty * line.unitPrice).toFixed(2)}</td>
                          </tr>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}