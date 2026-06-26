"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Paperclip, X, UploadCloud, File, Loader2 } from 'lucide-react';

export default function AttachmentUploader({ onAttachmentsChange }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Tracks files locally in current form instance

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newUploads = [...uploadedFiles];

    for (const file of files) {
      try {
        // Formulate a clean, collision-free filename namespace string
        const fileExtension = file.name.split('.').pop();
        const cleanedName = file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
        const uniquePathName = `${Date.now()}_${cleanedName}.${fileExtension}`;

        // 1. Push binary blob directly into the Supabase bucket structure
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('requisition-attachments')
          .upload(uniquePathName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // 2. Extract the public CDN download URL
        const { data: urlData } = supabase.storage
          .from('requisition-attachments')
          .getPublicUrl(uniquePathName);

        // 3. Construct the clean metadata asset tracking object
        const assetPayload = {
          name: file.name.toLowerCase(),
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.type.includes('pdf') ? 'compliance PDF' : 'receipt image',
          storagePath: uploadData.path,
          url: urlData.publicUrl
        };

        newUploads.push(assetPayload);
      } catch (err) {
        console.error("Storage transmission pipeline fault:", err.message);
        alert(`Failed to upload ${file.name}. Please re-verify file size constraints.`);
      }
    }

    setUploadedFiles(newUploads);
    onAttachmentsChange(newUploads); // Push state array bubble upstream to the parent creation form
    setUploading(false);
  };

  const removeFile = async (indexToRemove, storagePath) => {
    // Optional: Clean up storage bucket instantly to preserve space allocation arrays
    await supabase.storage.from('requisition-attachments').remove([storagePath]);

    const updatedFiles = uploadedFiles.filter((_, idx) => idx !== indexToRemove);
    setUploadedFiles(updatedFiles);
    onAttachmentsChange(updatedFiles);
  };

  return (
    <div className="space-y-4 font-avenir text-xs font-semibold">
      <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5">
        <Paperclip className="w-3.5 h-3.5" /> 
        <span>supporting validation file attachments</span>
      </div>

      {/* Drag & Drop Visual Box Frame */}
      <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group select-none">
        <div className="flex flex-col items-center gap-2 text-center text-gray-500 font-normal">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#0747A1] animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#0747A1] transition-colors" />
          )}
          <p className="lowercase">
            <span className="font-bold text-[#0747A1] group-hover:underline">click to add files</span> or drag pro-forma invoices & receipts here
          </p>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">pdf, png, jpg up to 5mb</span>
        </div>
        <input 
          type="file" 
          multiple 
          disabled={uploading} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
        />
      </label>

      {/* Uploaded Queue Files Feed List */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="border border-gray-200 rounded p-3 bg-white flex items-center justify-between hover:border-[#0747A1] transition-colors animate-fadeIn">
              <div className="min-w-0 truncate pr-2 flex items-center gap-2">
                <File className="w-4 h-4 text-[#0747A1] shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] text-[#0747A1] uppercase block tracking-wider font-bold">{file.type}</span>
                  <span className="text-xs font-bold text-gray-900 truncate block lowercase mt-0.5" title={file.name}>
                    {file.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-gray-400 font-mono">{file.size}</span>
                <button 
                  type="button" 
                  onClick={() => removeFile(idx, file.storagePath)}
                  className="p-1 text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}