
import React, { useState, useRef } from 'react';
import { HealthRecord, RecordType, HealthCategory } from '../types';
import { categorizeHealthRecord, generateClinicianSummary } from '../services/geminiService';
import { Plus, Loader2, FileText, Trash2, Activity, AlertCircle, Stethoscope, Paperclip, X, Download } from 'lucide-react';

interface HealthRecordsProps {
  records: HealthRecord[];
  onAddRecord: (t: HealthRecord) => void;
  onDeleteRecord: (id: string) => void;
}

const HealthRecords: React.FC<HealthRecordsProps> = ({ records, onAddRecord, onDeleteRecord }) => {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [type, setType] = useState<RecordType>(RecordType.LAB_RESULT);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // File Attachment State
  const [attachment, setAttachment] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit check
            alert("File is too large. Max 5MB.");
            return;
        }
        setFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachment(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
      setAttachment(null);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsAnalyzing(true);
    let category = HealthCategory.GENERAL as string;
    let status: 'Normal' | 'Attention' | 'Critical' = 'Normal';
    let doctorNote = 'Self-reported entry.';

    try {
      // 1. Categorize
      category = await categorizeHealthRecord(title, value);
      
      // 2. Generate Clinician Summary if it's a lab result or vital with value
      if (value) {
          const analysis = await generateClinicianSummary(title, value, unit);
          status = analysis.status;
          doctorNote = analysis.summary;
      }
    } catch (error) {
      console.error("AI analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }

    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      date,
      type,
      title,
      value: value || undefined,
      unit: unit || undefined,
      category,
      status,
      doctorNote,
      attachmentUrl: attachment || undefined
    };

    onAddRecord(newRecord);
    setTitle('');
    setValue('');
    setUnit('');
    clearFile();
  };

  // Helper to determine extension from data URL
  const getExtension = (dataUrl: string) => {
      if (dataUrl.startsWith('data:application/pdf')) return '.pdf';
      if (dataUrl.startsWith('data:image/jpeg')) return '.jpg';
      if (dataUrl.startsWith('data:image/png')) return '.png';
      return '';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                <Plus size={20} />
             </div>
             <h3 className="text-lg font-semibold text-slate-800">Add Diagnostic Record</h3>
          </div>
          
          <form onSubmit={handleAdd} className="space-y-4">
            {/* Record Type Buttons */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Record Type</label>
              <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setType(RecordType.LAB_RESULT)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${type === RecordType.LAB_RESULT ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200 text-slate-500'}`}
                  >
                    Lab Result
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setType(RecordType.VITAL_SIGN)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${type === RecordType.VITAL_SIGN ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200 text-slate-500'}`}
                  >
                    Vital Sign
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setType(RecordType.SYMPTOM)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${type === RecordType.SYMPTOM ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200 text-slate-500'}`}
                  >
                    Symptom
                  </button>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                  {type === RecordType.SYMPTOM ? 'Symptom Description' : 'Test Name'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === RecordType.LAB_RESULT ? "e.g., HbA1c" : "e.g., Headache"}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            {/* Value & Unit Inputs */}
            {type !== RecordType.SYMPTOM && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Value</label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="e.g. 5.4"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Unit</label>
                        <input
                            type="text"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder="e.g. %"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            {/* File Attachment */}
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Attachment (Optional)</label>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf"
                    className="hidden"
                />
                
                {!attachment ? (
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-3 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 hover:border-teal-400 hover:text-teal-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Paperclip size={18} />
                        Attach Report / Image
                    </button>
                ) : (
                    <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-100 rounded-xl">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileText size={18} className="text-teal-600 flex-shrink-0" />
                            <span className="text-sm text-teal-800 truncate">{fileName}</span>
                        </div>
                        <button type="button" onClick={clearFile} className="text-slate-400 hover:text-red-500">
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                <Stethoscope size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                    Our AI Clinician will automatically analyze this result and provide a summary.
                </p>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !title}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal-200"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add to Health Profile
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                  <h3 className="text-lg font-semibold text-slate-800">My Diagnostics History</h3>
                  <p className="text-xs text-slate-500">Lab results from Cynosure & Self-reports</p>
              </div>
              <span className="text-sm bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-slate-500">{records.length} Records</span>
           </div>
           <div className="flex-1 overflow-y-auto p-4">
             {records.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <FileText size={32} className="opacity-50" />
                 </div>
                 <p>No diagnostic records found.</p>
               </div>
             ) : (
               <div className="space-y-4">
                   {records.slice().reverse().map((r) => (
                     <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-100 hover:border-teal-100 hover:shadow-md transition-all group">
                       <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                   r.type === RecordType.LAB_RESULT ? 'bg-blue-50 text-blue-600' : 
                                   r.type === RecordType.VITAL_SIGN ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                               }`}>
                                   {r.type === RecordType.LAB_RESULT ? <FileText size={18}/> : <Activity size={18} />}
                               </div>
                               <div>
                                   <div className="flex items-center gap-2">
                                       <h4 className="font-bold text-slate-800">{r.title}</h4>
                                       {r.attachmentUrl && (
                                           <span className="bg-slate-100 text-slate-500 p-1 rounded-full" title="Has Attachment">
                                               <Paperclip size={12} />
                                           </span>
                                       )}
                                   </div>
                                   <div className="flex items-center gap-2 text-xs text-slate-500">
                                       <span>{r.date}</span>
                                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                       <span className="uppercase tracking-wider font-medium text-[10px]">{r.category}</span>
                                   </div>
                               </div>
                           </div>
                           <div className="text-right">
                               {r.value && (
                                   <div className="text-lg font-bold text-slate-800">{r.value} <span className="text-sm font-normal text-slate-500">{r.unit}</span></div>
                               )}
                               <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                                   r.status === 'Normal' ? 'bg-green-100 text-green-700' : 
                                   r.status === 'Attention' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                               }`}>
                                   {r.status !== 'Normal' && <AlertCircle size={10} />}
                                   {r.status}
                               </div>
                           </div>
                       </div>
                       
                       {/* Clinician Summary Section */}
                       {r.doctorNote && (
                           <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-3">
                               <Stethoscope size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                               <div>
                                   <p className="text-xs font-bold text-teal-800 mb-0.5">Clinician Summary</p>
                                   <p className="text-sm text-slate-600 leading-relaxed">"{r.doctorNote}"</p>
                               </div>
                           </div>
                       )}

                       {/* Action Footer */}
                       <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                           {r.attachmentUrl ? (
                               <a 
                                 href={r.attachmentUrl} 
                                 download={`Report-${r.date}${getExtension(r.attachmentUrl)}`} 
                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
                               >
                                   <Download size={12} /> View/Download Report
                               </a>
                           ) : <div></div>}
                           
                           <button 
                                onClick={() => onDeleteRecord(r.id)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <Trash2 size={12} /> Delete Record
                           </button>
                       </div>
                     </div>
                   ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
