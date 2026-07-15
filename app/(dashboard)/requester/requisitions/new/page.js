"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  ArrowLeft, 
  DollarSign, 
  UploadCloud, 
  AlertTriangle, 
  X, 
  Plus,
  Users,
  MapPin,
  Calendar,
  Briefcase,
  Loader2,
  CheckCircle2,
  LogOut 
} from 'lucide-react';

export default function NewRequisitionPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [activeUser, setActiveUser] = useState({
    name: 'staff member',
    hub: 'harare',
    role: 'requester'
  });

  useEffect(() => {
    async function resolveAuthenticatedSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setActiveUser({
          name: user.user_metadata?.name || 'staff member',
          hub: user.user_metadata?.hub_name || 'harare',
          role: user.user_metadata?.role || 'requester'
        });
      }
    }
    resolveAuthenticatedSession();
  }, []); 

  const [requestType, setRequestType] = useState('standard');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [justification, setJustification] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const [quotes, setQuotes] = useState([]);
  const [vatCerts, setVatCerts] = useState([]);
  const [emergencyDocs, setEmergencyDocs] = useState([]);

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Travel variables
  const [travelPurpose, setTravelPurpose] = useState('');
  const [travelLocation, setTravelLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transportType, setTransportType] = useState('Car Hire');
  const [transportCost, setTransportCost] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [tollsCost, setTollsCost] = useState('');
  const [lodgingPerDiem, setLodgingPerDiem] = useState('');
  const [mealsPerDiem, setMealsPerDiem] = useState('');
  const [accomResponsibility, setAccomResponsibility] = useState('Self');
  const [airbnbLinks, setAirbnbLinks] = useState('');

  const [travelers, setTravelers] = useState([{ name: '', title: '' }]);
  const [itinerary, setItinerary] = useState([{ day: 1, activity: '', location: '' }]);

  const hubCategories = [
    'hub equipment & hardware',
    'internet, data & utilities',
    'workshop & classroom supplies',
    'marketing & community outreach',
    'travel & logistics',
    'miscellaneous emergency funds'
  ];

  const paymentChannels = [
    'ecocash corporate wallet',
    'direct bank transfer',
    'petty cash disbursement'
  ];

  // 🗓️ Calculate total trip duration dynamically
  const calculatedDays = (startDate && endDate) 
    ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
    : 1;

  // 👥 Calculate number of travelers dynamically
  const totalTravelerCount = travelers.length;

  // 💰 Mathematically scale lodging and meals by Travelers AND Days
  const scaledLodgingTotal = accomResponsibility === 'Self' 
    ? (parseFloat(lodgingPerDiem) || 0) * calculatedDays * totalTravelerCount
    : 0; // If Uncommon pays lodging directly, exclude it from per-diem release calculations

  const scaledMealsTotal = (parseFloat(mealsPerDiem) || 0) * calculatedDays * totalTravelerCount;

  // 📈 Calculated Travel Manifest Sum
  const calculatedTravelTotal = 
    (parseFloat(transportCost) || 0) + 
    (parseFloat(fuelCost) || 0) + 
    (parseFloat(tollsCost) || 0) + 
    scaledLodgingTotal + 
    scaledMealsTotal;

  // 🚀 FIXED: Strictly bind final amount to active request type to prevent state leakage
  const finalAmount = requestType === 'travel' 
    ? calculatedTravelTotal 
    : (parseFloat(amount) || 0);

  const requiresComplianceDocs = finalAmount > 50 && requestType === 'standard';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const uploadBinaryToStorageBucket = async (file, docTypeLabel) => {
    try {
      const fileExtension = file.name.split('.').pop();
      const randomizedPath = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;

      const { data, error } = await supabase.storage
        .from('requisition-attachments')
        .upload(randomizedPath, file);

      if (error) throw error;

      const { data: urlRes } = supabase.storage
        .from('requisition-attachments')
        .getPublicUrl(randomizedPath);

      return {
        name: file.name.toLowerCase(),
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: docTypeLabel,
        storagePath: data.path,
        url: urlRes.publicUrl
      };
    } catch (err) {
      console.error("Storage vault error:", err.message);
      throw new Error(`failed pushing file attachment asset: ${file.name}`);
    }
  };

  const handleQuotesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsFileUploading(true);
    setError('');

    try {
      const newQuotes = [...quotes];
      for (const file of files) {
        if (newQuotes.length >= 3) break;
        const uploadedMeta = await uploadBinaryToStorageBucket(file, 'procurement quotation');
        newQuotes.push(uploadedMeta);
      }
      setQuotes(newQuotes);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleVatCertsUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsFileUploading(true);
    setError('');

    try {
      const newVat = [...vatCerts];
      for (const file of files) {
        if (newVat.length >= 3) break;
        const uploadedMeta = await uploadBinaryToStorageBucket(file, 'tax clearance cert');
        newVat.push(uploadedMeta);
      }
      setVatCerts(newVat);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleEmergencyDocsUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsFileUploading(true);
    setError('');

    try {
      const newEmergency = [...emergencyDocs];
      for (const file of files) {
        const uploadedMeta = await uploadBinaryToStorageBucket(file, 'emergency evidence receipt');
        newEmergency.push(uploadedMeta);
      }
      setEmergencyDocs(newEmergency);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFileUploading(false);
    }
  };

  const removeFileAsset = async (fileObj, type) => {
    await supabase.storage.from('requisition-attachments').remove([fileObj.storagePath]);

    if (type === 'quote') setQuotes(quotes.filter(q => q.storagePath !== fileObj.storagePath));
    if (type === 'vat') setVatCerts(vatCerts.filter(v => v.storagePath !== fileObj.storagePath));
    if (type === 'emergency') setEmergencyDocs(emergencyDocs.filter(e => e.storagePath !== fileObj.storagePath));
  };

  const addTravelerRow = () => setTravelers([...travelers, { name: '', title: '' }]);
  const removeTravelerRow = (index) => setTravelers(travelers.filter((_, i) => i !== index));
  const updateTraveler = (index, field, value) => {
    const updated = [...travelers];
    updated[index][field] = value;
    setTravelers(updated);
  };

  const addItineraryDay = () => setItinerary([...itinerary, { day: itinerary.length + 1, activity: '', location: '' }]);
  const updateItinerary = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  const handleSubmitRequisition = async () => {
    setError('');

    if (requestType === 'travel') {
      if (!travelPurpose || !travelLocation || !startDate || !endDate || !paymentMethod) {
        setError('all essential travel routing fields must be populated to log a domestic manifest.');
        return;
      }
      if (calculatedTravelTotal <= 0) {
        setError('calculated travel budget summary metrics must total greater than $0.00.');
        return;
      }
    } else {
      if (!amount || !category || !justification || !paymentMethod) {
        setError('all foundational fields are required to log an official funding requisition.');
        return;
      }
      if (finalAmount <= 0) {
        setError('please enter a valid monetary allocation amount greater than zero.');
        return;
      }
      if (requiresComplianceDocs && (quotes.length !== 3 || vatCerts.length !== 3)) {
        setError('procurement guidelines state you must supply exactly 3 distinct quotes and 3 matching vat certificates.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const compiledDocumentsArray = requestType === 'emergency' ? emergencyDocs : [...quotes, ...vatCerts];

      const { error: insertError } = await supabase
        .from('requisitions')
        .insert([{
          user_id: user?.id,
          requester: activeUser.name,
          location: activeUser.hub,
          amount: finalAmount,
          category: requestType === 'travel' ? 'travel & logistics' : category,
          justification: requestType === 'travel' 
            ? `travel purpose: ${travelPurpose}. location route: ${travelLocation}.` 
            : justification,
          payment_method: paymentMethod,
          is_emergency: requestType === 'emergency',
          status: 'pending',
          documents: compiledDocumentsArray, 
          travel_meta: requestType === 'travel' ? {
            travelPurpose,
            travelLocation,
            startDate,
            endDate,
            totalDays: calculatedDays,
            transportType,
            accomResponsibility,
            airbnbLinks,
            breakdown: { transportCost, fuelCost, tollsCost, lodgingPerDiem, mealsPerDiem },
            travelers,
            itinerary
          } : null
        }]);

      if (insertError) throw insertError;
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'database transaction error encountered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-20">
      
      {/* Top Workspace Navigation Header Panel */}
      <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#0747A1] text-white font-semibold px-1.5 py-0.5 rounded uppercase">requester panel</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block text-xs font-semibold text-slate-300 lowercase">
              <div>{activeUser.name}</div>
              <div className="text-[10px] text-slate-400">{activeUser.hub} hub</div>
            </div>
            <NotificationCenter role="requester" />
            <div className="h-6 w-px bg-slate-700" />
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Workspace core */}
      <main className="max-w-3xl mx-auto px-4 mt-10">
        
        <div onClick={() => router.push('/requester')} className="inline-flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#0747A1] font-semibold transition-colors cursor-pointer mb-8 select-none">
          <ArrowLeft className="w-4 h-4" /> <span className="lowercase">back to overview</span>
        </div>

        {!isSuccess ? (
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6 sm:p-10 space-y-6">
            
            <div className="flex flex-col border-b border-gray-100 pb-4">
              <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">submit fund requisition</h1>
              <p className="text-sm text-[#4B5563] mt-2">initialize an internal cash allocation request or detailed travel manifest block</p>
            </div>

            {/* Tri-Toggle Workflow Tabs */}
            <div className="p-1.5 bg-[#F3F4F6] rounded-lg grid grid-cols-3 text-center select-none text-xs font-semibold uppercase tracking-wider">
              <div onClick={() => !isLoading && setRequestType('standard')} className={`py-2.5 rounded-md cursor-pointer transition-all ${requestType === 'standard' ? 'bg-white text-[#0A1628] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}>standard items</div>
              <div onClick={() => !isLoading && setRequestType('travel')} className={`py-2.5 rounded-md cursor-pointer transition-all ${requestType === 'travel' ? 'bg-white text-[#0747A1] shadow-sm font-bold' : 'text-[#6B7280] hover:text-[#0747A1]'}`}>travel request</div>
              <div onClick={() => !isLoading && setRequestType('emergency')} className={`py-2.5 rounded-md cursor-pointer transition-all flex items-center justify-center gap-1 ${requestType === 'emergency' ? 'bg-[#991B1B] text-white shadow-sm font-bold' : 'text-[#6B7280] hover:text-[#991B1B]'}`}>{requestType === 'emergency' && <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />} emergency block</div>
            </div>

            {error && <div className="p-3 bg-[#FEE2E2] border border-l-4 border-l-[#991B1B] border-[#FECACA] rounded-r-md text-xs font-medium text-[#991B1B] lowercase">{error}</div>}

            {/* Travel Parameters View Block */}
            {requestType === 'travel' && (
              <div className="space-y-8 text-xs font-semibold animate-fadeIn">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 1. trip overview parameters</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5"><label className="text-gray-400 uppercase tracking-wide text-[10px]">trip purpose specs</label><input type="text" value={travelPurpose} onChange={(e) => setTravelPurpose(e.target.value)} placeholder="e.g. Sensitization Workshop" className="w-full px-3 py-2 border border-[#E5E7EB] bg-[#F9FAFB] text-sm rounded-md focus:outline-none focus:border-[#0747A1]" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-gray-400 uppercase tracking-wide text-[10px]">trip target location</label><input type="text" value={travelLocation} onChange={(e) => setTravelLocation(e.target.value)} placeholder="e.g. Gokwe" className="w-full px-3 py-2 border border-[#E5E7EB] bg-[#F9FAFB] text-sm rounded-md focus:outline-none focus:border-[#0747A1]" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-gray-400 uppercase tracking-wide text-[10px]">start travel date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] bg-[#F9FAFB] text-sm rounded-md focus:outline-none focus:border-[#0747A1] font-sans" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-gray-400 uppercase tracking-wide text-[10px]">end travel date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] bg-[#F9FAFB] text-sm rounded-md focus:outline-none focus:border-[#0747A1] font-sans" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 2. traveling employees manifest</span>
                    <button type="button" onClick={addTravelerRow} className="text-[#0747A1] hover:opacity-80 flex items-center gap-1 text-[9px] uppercase tracking-widest bg-transparent border-none cursor-pointer"><Plus className="w-3 h-3" /> append traveler</button>
                  </div>
                  <div className="space-y-2.5">
                    {travelers.map((traveler, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <input type="text" value={traveler.name} onChange={(e) => updateTraveler(index, 'name', e.target.value)} placeholder="Full Name" className="col-span-6 px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F9FAFB] text-xs focus:outline-none" />
                        <input type="text" value={traveler.title} onChange={(e) => updateTraveler(index, 'title', e.target.value)} placeholder="Job Title" className="col-span-5 px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F9FAFB] text-xs focus:outline-none" />
                        <button type="button" onClick={() => travelers.length > 1 && removeTravelerRow(index)} className="col-span-1 p-2 text-gray-400 hover:text-red-700 bg-transparent border-none cursor-pointer"><X className="w-4 h-4 mx-auto" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 3. daily scheduled itinerary matrix</span>
                    <button type="button" onClick={addItineraryDay} className="text-[#0747A1] hover:opacity-80 flex items-center gap-1 text-[9px] uppercase tracking-widest bg-transparent border-none cursor-pointer"><Plus className="w-3 h-3" /> append day</button>
                  </div>
                  <div className="space-y-2.5">
                    {itinerary.map((iti, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#F9FAFB] p-2 border border-gray-100 rounded-md">
                        <span className="col-span-2 text-[10px] text-gray-400 font-mono text-center uppercase">Day {iti.day}</span>
                        <input type="text" value={iti.activity} onChange={(e) => updateItinerary(idx, 'activity', e.target.value)} placeholder="Itinerary Action" className="col-span-6 px-3 py-1.5 border border-[#E5E7EB] rounded bg-white text-xs focus:outline-none" />
                        <input type="text" value={iti.location} onChange={(e) => updateItinerary(idx, 'location', e.target.value)} placeholder="City Location" className="col-span-4 px-3 py-1.5 border border-[#E5E7EB] rounded bg-white text-xs focus:outline-none" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-1.5 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> 4. financial ledger breakdown estimates</div>
                  <div className="p-4 border border-gray-200 bg-[#F9FAFB] rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-gray-400 text-[9px] uppercase tracking-wide">transport system</label><select value={transportType} onChange={(e) => setTransportType(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white focus:outline-none text-xs lowercase font-bold"><option value="Car Hire">car hire</option><option value="Taxi/Kombi">taxi / kombi</option><option value="Personal Vehicle">personal vehicle</option></select></div>
                    <div className="flex flex-col gap-1"><label className="text-gray-400 text-[9px] uppercase tracking-wide">ticket/hire cost</label><input type="number" placeholder="0.00" value={transportCost} onChange={(e) => setTransportCost(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none text-xs font-mono font-bold" /></div>
                    <div className="flex flex-col gap-1"><label className="text-gray-400 text-[9px] uppercase tracking-wide">estimated fuel</label><input type="number" placeholder="0.00" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none text-xs font-mono font-bold" /></div>
                    <div className="flex flex-col gap-1"><label className="text-gray-400 text-[9px] uppercase tracking-wide">tolls allocation</label><input type="number" placeholder="0.00" value={tollsCost} onChange={(e) => setTollsCost(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none text-xs font-mono font-bold" /></div>
                  </div>
                  <div className="p-4 border border-gray-200 bg-[#F9FAFB] rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-gray-400 text-[9px] uppercase tracking-wide">lodging responsibility</label><select value={accomResponsibility} onChange={(e) => setAccomResponsibility(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white focus:outline-none text-xs lowercase font-bold"><option value="Self">self (per-diem release)</option><option value="Uncommon">uncommon (direct pay)</option></select></div>
                    <div className="flex flex-col gap-1"><label className="text-gray-400 text-[9px] uppercase tracking-wide">lodging per-diem</label><input type="number" placeholder="0.00" value={lodgingPerDiem} onChange={(e) => setLodgingPerDiem(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none text-xs font-mono font-bold" /></div>
                    <div className="flex flex-col gap-1"><label className="text-gray-400 text-[9px] uppercase tracking-wide">meals per-diem</label><input type="number" placeholder="0.00" value={mealsPerDiem} onChange={(e) => setMealsPerDiem(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none text-xs font-mono font-bold" /></div>
                  </div>
                  
                  {/* Rolled-Up Aggregation Dashboard View */}
                  <div className="p-4 bg-gray-900 border border-gray-900 rounded-lg flex items-center justify-between text-white shadow-sm select-none">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block font-bold">rolled-up aggregation manifest</span>
                      <span className="text-xs text-gray-300 mt-0.5 block font-medium lowercase">
                        calculated for {totalTravelerCount} {totalTravelerCount === 1 ? 'person' : 'people'} over {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <span className="text-2xl font-mono font-black text-white">${calculatedTravelTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Requisition Inputs */}
            {requestType !== 'travel' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="amount-input">required amount (usd)</label>
                  <div className="relative flex items-center">
                    <DollarSign className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                    <input id="amount-input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" disabled={isLoading} className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0747A1] transition-all font-sans font-semibold" />
                  </div>
                  {requiresComplianceDocs && <span className="text-[11px] font-medium text-[#B45309] mt-1 flex items-center gap-1 lowercase">⚠️ amounts exceeding $50 strictly require triple quotation and vat verification matrix rows.</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="category-select">allocation category</label>
                  <select id="category-select" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isLoading} className="w-full px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0747A1] transition-all lowercase font-bold cursor-pointer"><option value="">select an operational category...</option>{hubCategories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}</select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="justification-text">business justification & itemized breakdown</label>
                  <textarea id="justification-text" rows={4} value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="describe exactly what these funds will purchase..." disabled={isLoading} className="w-full p-3 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0747A1] transition-all font-sans resize-none font-medium leading-relaxed" />
                </div>

                {/* Procurement Compliance Attachments Over $50 */}
                {requiresComplianceDocs && (
                  <div className="p-5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] space-y-4 text-xs font-semibold animate-slideDown">
                    <div className="text-[10px] font-bold text-[#0A1628] uppercase tracking-wider border-b border-[#E5E7EB] pb-2 flex items-center gap-2">
                      {isFileUploading && <Loader2 className="w-3.5 h-3.5 text-[#0747A1] animate-spin" />}
                      <span>procurement compliance attachments ($50+ threshold)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-wide">1. 3 separate quotations ({quotes.length}/3)</span>
                        <label className={`border border-dashed rounded-md p-4 flex flex-col items-center justify-center gap-1 transition-colors ${quotes.length >= 3 || isFileUploading ? 'bg-[#F3F4F6] border-[#D1D5DB] cursor-not-allowed opacity-70' : 'bg-white border-[#CDD5DF] cursor-pointer hover:bg-gray-50'}`}>
                          <UploadCloud className="w-5 h-5 text-[#0747A1]" />
                          <span className="text-xs text-[#4B5563] font-medium lowercase">select quote files</span>
                          <input type="file" multiple disabled={isLoading || isFileUploading || quotes.length >= 3} onChange={handleQuotesUpload} className="hidden" accept=".pdf,.png,.jpg" />
                        </label>
                        <div className="space-y-1.5 mt-1">
                          {quotes.map((f, i) => (
                            <div key={i} className="text-xs bg-white border border-[#E5E7EB] px-2.5 py-1.5 rounded flex items-center justify-between text-[#0A1628] font-medium shadow-sm lowercase">
                              <span className="truncate pr-2">{f.name}</span>
                              <X onClick={() => removeFileAsset(f, 'quote')} className="w-3.5 h-3.5 text-[#9CA3AF] hover:text-[#991B1B] cursor-pointer shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-wide">2. 3 tax clearance certs ({vatCerts.length}/3)</span>
                        <label className={`border border-dashed rounded-md p-4 flex flex-col items-center justify-center gap-1 transition-colors ${vatCerts.length >= 3 || isFileUploading ? 'bg-[#F3F4F6] border-[#D1D5DB] cursor-not-allowed opacity-70' : 'bg-white border-[#CDD5DF] cursor-pointer hover:bg-gray-50'}`}>
                          <UploadCloud className="w-5 h-5 text-[#0747A1]" />
                          <span className="text-xs text-[#4B5563] font-medium lowercase">select vat clearance files</span>
                          <input type="file" multiple disabled={isLoading || isFileUploading || vatCerts.length >= 3} onChange={handleVatCertsUpload} className="hidden" accept=".pdf,.png,.jpg" />
                        </label>
                        <div className="space-y-1.5 mt-1">
                          {vatCerts.map((f, i) => (
                            <div key={i} className="text-xs bg-white border border-[#E5E7EB] px-2.5 py-1.5 rounded flex items-center justify-between text-[#0A1628] font-medium shadow-sm lowercase">
                              <span className="truncate pr-2">{f.name}</span>
                              <X onClick={() => removeFileAsset(f, 'vat')} className="w-3.5 h-3.5 text-[#9CA3AF] hover:text-[#991B1B] cursor-pointer shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Emergency Documentation Layout */}
            {requestType === 'emergency' && (
              <div className="p-5 border border-[#FECACA] rounded-lg bg-[#FFF5F5] space-y-3 text-xs font-semibold animate-slideDown">
                <div className="text-[10px] font-bold text-[#991B1B] uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  <span>emergency documentation bypass active</span>
                </div>
                <p className="text-xs text-[#7F1D1D] leading-relaxed lowercase">strict pre-matching quotas are bypassed. upload receipts, breakdown photos, or pro-forma snapshots instantly to maintain velocity.</p>
                <div className="flex flex-col gap-2">
                  <label className="border border-dashed border-[#FCA5A5] bg-white rounded-md p-6 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-red-50/50 transition-colors">
                    {isFileUploading ? <Loader2 className="w-6 h-6 text-[#991B1B] animate-spin" /> : <UploadCloud className="w-6 h-6 text-[#F87171]" />}
                    <span className="text-xs font-medium text-[#7F1D1D] lowercase">upload emergency attachments</span>
                    <input type="file" multiple disabled={isLoading || isFileUploading} onChange={handleEmergencyDocsUpload} className="hidden" accept=".pdf,.png,.jpg" />
                  </label>
                  {emergencyDocs.map((f, i) => (
                    <div key={i} className="text-xs bg-white border border-[#FECACA] px-2.5 py-1.5 rounded flex items-center justify-between text-[#7F1D1D] font-medium shadow-sm lowercase">
                      <span className="truncate pr-2">{f.name}</span>
                      <X onClick={() => removeFileAsset(f, 'emergency')} className="w-3.5 h-3.5 text-[#FCA5A5] hover:text-[#991B1B] cursor-pointer shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-xs font-semibold">
              <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="payment-select">preferred disbursement channel</label>
              <select id="payment-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={isLoading} className="w-full px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0747A1] transition-all lowercase font-bold cursor-pointer"><option value="">select preferred distribution route...</option>{paymentChannels.map((mode, idx) => <option key={idx} value={mode}>{mode}</option>)}</select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#E5E7EB] text-xs font-semibold">
              <div onClick={() => !isLoading && router.push('/requester')} className="px-5 py-2.5 text-sm font-medium text-[#4B5563] hover:text-[#111827] cursor-pointer select-none lowercase transition-colors">cancel</div>
              <button
                type="button"
                onClick={!isLoading && !isFileUploading ? handleSubmitRequisition : undefined}
                disabled={isLoading || isFileUploading}
                className={`py-2.5 px-6 font-bold text-sm rounded-md shadow-sm select-none transition-colors cursor-pointer text-center lowercase text-white border border-transparent focus:outline-none ${
                  requestType === 'emergency' ? 'bg-[#991B1B] hover:bg-[#7F1D1D]' : 'bg-[#0747A1] hover:opacity-90'
                } ${isLoading || isFileUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'submitting rows...' : isFileUploading ? 'uploading file binaries...' : 'submit requisition'}
              </button>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-8 sm:p-12 flex flex-col text-left animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-[#16A34A] mb-6 stroke-[1.5]" />
            <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">requisition logged successfully</h1>
            <p className="text-sm text-[#4B5563] mt-3 leading-relaxed max-w-md lowercase">your request for <strong className="text-[#0A1628] font-semibold">${finalAmount.toFixed(2)}</strong> has been indexed and files are securely linked inside the repository queue.</p>
            <div className="mt-10 pt-4 border-t border-[#E5E7EB]">
              <div onClick={() => router.push('/requester')} className="inline-flex items-center justify-center py-2.5 px-6 bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-medium text-sm rounded-md shadow-sm select-none transition-colors cursor-pointer text-center lowercase">return to dashboard</div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}