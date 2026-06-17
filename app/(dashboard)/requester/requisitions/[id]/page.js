"use client";

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Tag, Wallet, FileText, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

export default function RequisitionDetailPage({ params: paramsPromise }) {
  const router = useRouter();
  // Safely unwrap the dynamic route parameters in Next.js
  const params = use(paramsPromise);
  const requisitionId = params.id;

  // Mock data representing the retrieved database record for this specific request
  const [requisition] = useState({
    id: requisitionId || 'REQ-001',
    date: 'jun 10, 2026',
    amount: 450.00,
    category: 'hub equipment & hardware',
    payment_method: 'ecocash corporate wallet',
    justification: 'purchase of 3 replacement uninterruptible power supply (ups) batteries for the harare hub classroom workstations to sustain teaching capacity during grid load-shedding cycles.',
    is_emergency: false,
    status: 'pending',
    current_stage: 'finance_officer',
    attachments: [
      { name: 'quotation_powervale.pdf', size: '142 kb' },
      { name: 'quotation_solargen.pdf', size: '198 kb' },
      { name: 'quotation_zimelec.pdf', size: '115 kb' },
      { name: 'vat_cert_powervale.pdf', size: '89 kb' },
      { name: 'vat_cert_solargen.pdf', size: '204 kb' },
      { name: 'vat_cert_zimelec.pdf', size: '94 kb' }
    ],
    // The underlying multi-tier signature workflow tracking matrix
    timeline: [
      { stage: 'submission', label: 'requisition logged', date: 'jun 10, 10:14 am', status: 'completed', actor: 'rachel murambiwa' },
      { stage: 'hub_manager', label: 'hub manager sign-off', date: 'jun 11, 02:30 pm', status: 'completed', actor: 'local hub head' },
      { stage: 'finance_officer', label: 'finance audit verification', date: 'pending', status: 'active', actor: 'finance pool' },
      { stage: 'country_manager', label: 'executive approval authorization', date: 'awaiting upstream', status: 'upcoming', actor: 'country director' },
      { stage: 'disbursal', label: 'cash payment disbursement', date: 'awaiting upstream', status: 'upcoming', actor: 'operations desk' }
    ]
  });

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto min-h-screen bg-white">
      
      {/* Navigation Return Trigger */}
      <div 
        onClick={() => router.push('/requester')}
        className="flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#1D4ED8] font-semibold transition-colors cursor-pointer mb-8 select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="lowercase">back to dashboard</span>
      </div>

      {/* Main Grid Splitting Data Panels and Workflow Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Comprehensive Detail Overview Forms (Takes 2 blocks of horizontal weight) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Identity Descriptor Block */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold font-mono text-[#1D4ED8] tracking-tight">{requisition.id}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium lowercase ${
                requisition.status === 'approved' ? 'bg-[#DCFCE7] text-[#166534]' : 
                requisition.status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' : 
                'bg-[#FEF9C3] text-[#854D0E]'
              }`}>
                {requisition.status}
              </span>
              {requisition.is_emergency && (
                <span className="bg-[#FFF5F5] border border-[#FCA5A5] text-[#991B1B] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  emergency priority
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight lowercase">
              allocation breakdown
            </h1>
          </div>

          {/* Core Descriptive Parameters List Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E5E7EB] pt-6">
            
            <div className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-lg">
              <Calendar className="w-4 h-4 text-[#9CA3AF] mt-0.5" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">submission date</div>
                <div className="text-sm font-medium text-[#0A1628] lowercase mt-0.5">{requisition.date}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-lg">
              <Tag className="w-4 h-4 text-[#9CA3AF] mt-0.5" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">budget category</div>
                <div className="text-sm font-medium text-[#0A1628] lowercase mt-0.5">{requisition.category}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-lg">
              <Wallet className="w-4 h-4 text-[#9CA3AF] mt-0.5" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">preferred channel</div>
                <div className="text-sm font-medium text-[#0A1628] lowercase mt-0.5">{requisition.payment_method}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg">
              <span className="text-sm font-bold text-[#1D4ED8] mt-0.5">$</span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8]">total volume (usd)</div>
                <div className="text-base font-bold text-[#0A1628] mt-0.5">${requisition.amount.toFixed(2)}</div>
              </div>
            </div>

          </div>

          {/* Justification Text Block Container Panel */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              business purpose justification
            </h2>
            <div className="p-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#374151] leading-relaxed font-sans shadow-sm">
              {requisition.justification}
            </div>
          </div>

          {/* Compliance Safe Vault File Index Matrix Row list */}
          {requisition.attachments.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
                attached verification attachments ({requisition.attachments.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {requisition.attachments.map((file, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg bg-white shadow-sm hover:border-[#1D4ED8] transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-medium text-[#1D4ED8] truncate pr-4 lowercase">{file.name}</span>
                    <span className="text-[10px] font-mono text-[#9CA3AF] bg-[#F9FAFB] px-2 py-0.5 rounded border border-[#E5E7EB] shrink-0">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Visual Real-time Audit Validation Flow Timeline Tracker */}
        <div className="border border-[#E5E7EB] rounded-lg p-6 bg-[#F9FAFB] h-fit space-y-6 shadow-sm">
          <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider border-b border-[#E5E7EB] pb-3">
            approval lifecycle pipeline
          </div>
          
          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
            {requisition.timeline.map((step, idx) => (
              <div key={idx} className="flex gap-4 relative animate-fadeIn">
                
                {/* Visual Circle Icon Stepper Nodes */}
                <div className="mt-0.5 z-10 shrink-0 bg-[#F9FAFB]">
                  {step.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] fill-white stroke-[2.5]" />
                  )}
                  {step.status === 'active' && (
                    <Clock className="w-5 h-5 text-[#EAB308] fill-white stroke-[2.5] animate-spin-slow" />
                  )}
                  {step.status === 'upcoming' && (
                    <Circle className="w-5 h-5 text-[#D1D5DB] fill-white stroke-[2]" />
                  )}
                </div>

                {/* Content Texts Descriptor Stack for the Approval Milestones */}
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-bold lowercase ${
                    step.status === 'completed' ? 'text-[#0A1628]' :
                    step.status === 'active' ? 'text-[#EAB308]' : 'text-[#9CA3AF]'
                  }`}>
                    {step.label}
                  </span>
                  <span className="text-[11px] text-[#6B7280] font-medium capitalize">
                    {step.actor}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-mono lowercase">
                    {step.date}
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}