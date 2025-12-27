
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, HealthSummary, User, CallLog, DiseaseProtocol, AiConfig, SystemAction, SpecialistType, FamilyMember, LabFacility, HealthRecord, RecordType, HealthCategory } from '../types';
import { getHealthAdvice } from '../services/geminiService';
import { Bot, User as UserIcon, Stethoscope, Loader2, Zap, Phone, Mic, PhoneOff, Globe, PhoneIncoming, Calculator, CornerDownLeft, AudioLines, Plus, X, UserPlus, Copy, Check, FileText, Printer, Sparkles, Paperclip, Send, CalendarCheck, CheckCircle2, Play, Pause, AlertTriangle, ShieldCheck, Microscope, Pill, Activity, MapPin, Video, Lock, Ambulance, Wallet, Square, Download, Clock, Save, Brain, Heart, Eye } from 'lucide-react';

interface AdvisorProps {
  summary: HealthSummary;
  onDeductBalance: (amount: number) => void;
  onCallComplete: (log: CallLog) => void;
  onAddRecord?: (record: HealthRecord) => void;
  user: User;
  protocols: DiseaseProtocol[];
  aiConfig: AiConfig;
  familyHistory?: FamilyMember[];
  onTriggerAmbulance?: () => void;
}

const QUICK_PROMPTS = [
    "Analyze my symptoms",
    "Interpret this lab report",
    "Listen to my cough (Voice)",
    "Prescribe malaria meds",
    "Diet for high BP",
    "Nearest specialist"
];

const SPECIALIST_SESSION_FEE = 10000;
const SPECIALIST_MIN_BALANCE = 20000;
const HUMAN_CALL_RATE = 500;

const Advisor: React.FC<AdvisorProps> = ({ summary, onDeductBalance, onCallComplete, onAddRecord, user, protocols, aiConfig, familyHistory, onTriggerAmbulance }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  
  // Specialist Mode State
  const [specialistMode, setSpecialistMode] = useState<SpecialistType>('General');
  
  // File & Audio Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; type: string; data: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Modals
  const [showLabModal, setShowLabModal] = useState(false);
  const [activeLabRequest, setActiveLabRequest] = useState<{tests: string[], reason: string} | null>(null);
  const [showPrintableForm, setShowPrintableForm] = useState(false);
  
  // Payment Modal
  const [paymentModal, setPaymentModal] = useState<{title: string, amount: number, onConfirm: () => void} | null>(null);

  // Call Specialist Modal & Active Call State
  const [showCallModal, setShowCallModal] = useState(false);
  const [callDetails, setCallDetails] = useState({ specialist: 'General Doctor', duration: 10 });
  const [activeCallSession, setActiveCallSession] = useState<{specialist: string, elapsed: number} | null>(null);

  // Prescription Modal
  const [showRxForm, setShowRxForm] = useState(false);
  const [activeRx, setActiveRx] = useState<{medications: {name: string, dosage: string, duration: string}[]} | null>(null);

  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<{item: string, cost: number, id?: string} | null>(null);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeReport, setActiveReport] = useState<{title: string, findings: string[], status: string, summary?: string} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // TTS State
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
      const savedMessages = localStorage.getItem('eduwellness_chat_history');
      const savedMode = localStorage.getItem('eduwellness_specialist_mode');
      
      if (savedMode) {
          setSpecialistMode(savedMode as SpecialistType);
      }

      if (savedMessages) {
          try {
              setMessages(JSON.parse(savedMessages));
          } catch (e) {
              console.error("Failed to parse chat history", e);
          }
      } else {
          setMessages([{
              id: 'welcome',
              role: 'model',
              text: `Hello ${user.name.split(' ')[0]}! I'm Dr. Wise, your Professor-level medical assistant. \n\nI can analyze symptoms, read lab reports (images/PDFs), and even listen to your voice. How can I help you today?`,
              timestamp: Date.now()
          }]);
      }

      // Cleanup TTS on unmount
      return () => {
          window.speechSynthesis.cancel();
      };
  }, []);

  // Call Timer
  useEffect(() => {
      let interval: any;
      if (activeCallSession) {
          interval = setInterval(() => {
              setActiveCallSession(prev => {
                  if(!prev) return null;
                  return {...prev, elapsed: prev.elapsed + 1};
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [activeCallSession]);

  // Persistence
  useEffect(() => {
      if(messages.length > 0) {
          localStorage.setItem('eduwellness_chat_history', JSON.stringify(messages));
      }
      localStorage.setItem('eduwellness_specialist_mode', specialistMode);
      scrollToBottom();
  }, [messages, isLoading, specialistMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const newFiles: { name: string; type: string; data: string }[] = [];

      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Limit file size to 5MB
          if (file.size > 5 * 1024 * 1024) {
              alert(`File ${file.name} is too large. Max 5MB.`);
              continue;
          }

          const reader = new FileReader();
          await new Promise<void>((resolve) => {
              reader.onloadend = () => {
                  const base64String = reader.result as string;
                  const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
                  newFiles.push({
                      name: file.name,
                      type: file.type,
                      data: base64Data
                  });
                  resolve();
              };
              reader.readAsDataURL(file);
          });
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); 
              const reader = new FileReader();
              reader.onloadend = () => {
                  const base64String = reader.result as string;
                  const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
                  handleSend(null as any, "", [{ name: "Voice Note", type: "audio/webm", data: base64Data }]);
              };
              reader.readAsDataURL(audioBlob);
              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          console.error("Error accessing microphone:", err);
          alert("Could not access microphone.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const extractJson = (text: string) => {
      const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) return codeBlockMatch[1].trim();

      const openBrace = text.indexOf('{');
      const closeBrace = text.lastIndexOf('}');
      if (openBrace !== -1 && closeBrace > openBrace) {
          return text.substring(openBrace, closeBrace + 1).trim();
      }
      return null;
  };

  const handleSend = async (e: React.FormEvent, overrideInput?: string, overrideFiles?: { name: string; type: string; data: string }[]) => {
    if(e) e.preventDefault();
    const textToSend = overrideInput || input;
    const filesToSend = overrideFiles || selectedFiles;

    if ((!textToSend.trim() && filesToSend.length === 0) || isLoading) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
      // Store all attachments in the message object if needed, but for simplicity display summary
      attachment: filesToSend.length > 0 ? {
          type: filesToSend[0].type.startsWith('image') ? 'image' : filesToSend[0].type.startsWith('audio') ? 'audio' : 'file',
          name: filesToSend.length === 1 ? filesToSend[0].name : `${filesToSend.length} Attached Files`,
          mimeType: filesToSend[0].type,
          url: filesToSend[0].type.startsWith('audio') ? '#' : `data:${filesToSend[0].type};base64,${filesToSend[0].data}` 
      } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    clearFiles();
    setIsLoading(true);

    const history = messages
        .filter(m => m.text && m.text.trim() !== '') 
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }] 
        }));

    const responseTextRaw = await getHealthAdvice(
        summary, 
        textToSend, 
        history, 
        user, 
        language, 
        filesToSend.length > 0 ? filesToSend.map(f => ({ mimeType: f.type, data: f.data })) : undefined,
        specialistMode,
        familyHistory
    );

    let finalText = responseTextRaw;
    let systemAction: SystemAction | undefined = undefined;

    const potentialJson = extractJson(responseTextRaw);
    
    if (potentialJson) {
        try {
            const parsed = JSON.parse(potentialJson);
            if (parsed.type && parsed.data) {
                systemAction = parsed as SystemAction;
                finalText = responseTextRaw.replace(potentialJson, '').replace(/```json/g, '').replace(/```/g, '').trim();
            }
        } catch (e) {
            console.error("Failed to parse system action JSON", e);
        }
    }

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: finalText,
      timestamp: Date.now(),
      systemAction: systemAction
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleGenerateReport = async () => {
      await handleSend(null as any, "Please generate a detailed summary explanation report of our session findings in a structured format.");
  };

  const handleToggleSpeech = (text: string, msgId: string) => {
      if (activeSpeechId === msgId) {
          window.speechSynthesis.cancel();
          setActiveSpeechId(null);
          return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; 
      utterance.onstart = () => setActiveSpeechId(msgId);
      utterance.onend = () => setActiveSpeechId(null);
      utterance.onerror = () => setActiveSpeechId(null);
      window.speechSynthesis.speak(utterance);
  };

  const handleConnectSpecialist = (e: React.MouseEvent, type: string) => {
      e.preventDefault(); e.stopPropagation();
      const displayType = type || 'Specialist';
      if (summary.walletBalance < SPECIALIST_MIN_BALANCE) {
          if (confirm(`Insufficient Funds. Required: ${SPECIALIST_MIN_BALANCE.toLocaleString()} UGX. Continue with General AI?`)) {
              setSpecialistMode('General');
          }
          return;
      }
      setPaymentModal({
          title: `${displayType} AI Consultation`, amount: SPECIALIST_SESSION_FEE,
          onConfirm: () => {
              onDeductBalance(SPECIALIST_SESSION_FEE);
              setSpecialistMode(displayType as SpecialistType);
              setPaymentModal(null);
              setMessages(prev => [...prev, 
                  { id: Date.now().toString(), role: 'model', text: '', timestamp: Date.now(), systemAction: { type: 'RECEIPT', data: { item: `${displayType} AI Consultation`, cost: SPECIALIST_SESSION_FEE } } },
                  { id: (Date.now() + 1).toString(), role: 'model', text: `**SYSTEM:** Connected to ${displayType} Specialist AI.\n\nHello, I am the specialized AI assistant.`, timestamp: Date.now() }
              ]);
          }
      });
  };

  const handleSwitchMode = (mode: SpecialistType) => {
      setSpecialistMode(mode);
      if (mode !== 'General') {
          setMessages(prev => [...prev, 
              { id: Date.now().toString(), role: 'model', text: `**SYSTEM:** Switched to **${mode} Mode**. \n\nPlease upload any relevant medical images or provide detailed symptoms for analysis.`, timestamp: Date.now() }
          ]);
      }
  };

  const handleBookLab = (e: React.MouseEvent, tests: any, reason: string) => {
      e.preventDefault(); e.stopPropagation();
      const testsArray = Array.isArray(tests) ? tests : [tests];
      setActiveLabRequest({ tests: testsArray, reason: reason || 'Medical Requirement' });
      setShowLabModal(true);
  };

  const triggerPdfDownload = (filename: string) => {
      const originalTitle = document.title;
      document.title = filename;
      window.focus();
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 2000);
  };

  const handlePrintRx = (e: React.MouseEvent, data: any) => {
      e.preventDefault(); e.stopPropagation();
      if (!data || !data.medications) { alert("Incomplete prescription."); return; }
      setActiveRx(data);
      setShowRxForm(true);
      setTimeout(() => { triggerPdfDownload(`Prescription_${user.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`); }, 500);
  };

  const handlePrintReport = (e: React.MouseEvent, data: any) => {
      e.preventDefault(); e.stopPropagation();
      setActiveReport(data);
      setShowReportModal(true);
  };

  const handleViewReceipt = (e: React.MouseEvent, data: any) => {
      e.preventDefault(); e.stopPropagation();
      setActiveReceipt(data);
      setShowReceiptModal(true);
  };

  const handleSaveReportToRecords = () => {
      if (!activeReport || !onAddRecord) return;
      
      const newRecord: HealthRecord = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          type: RecordType.LAB_RESULT,
          title: activeReport.title || 'Clinical Report',
          value: 'See Report',
          unit: 'PDF',
          category: HealthCategory.GENERAL,
          status: activeReport.status === 'Abnormal' ? 'Attention' : 'Normal',
          doctorNote: activeReport.summary || 'AI Generated Report saved from Advisor session.',
      };
      
      onAddRecord(newRecord);
      alert("Report saved to your Health Records successfully!");
      setShowReportModal(false);
  };

  const handleInitiateCall = () => {
      const cost = callDetails.duration * HUMAN_CALL_RATE;
      if (summary.walletBalance < cost) { alert("Insufficient Funds"); return; }
      onDeductBalance(cost);
      setShowCallModal(false);
      setActiveCallSession({ specialist: callDetails.specialist, elapsed: 0 });
  };

  const handleEndCall = () => {
      if (activeCallSession) {
          onCallComplete({
              id: Date.now().toString(), callerId: user.id, callerName: user.name, receiverId: 'doc-1', receiverName: activeCallSession.specialist,
              startTime: new Date().toISOString(), durationSeconds: activeCallSession.elapsed, status: 'Completed', cost: Math.ceil(activeCallSession.elapsed / 60) * HUMAN_CALL_RATE, type: 'audio'
          });
          setActiveCallSession(null);
      }
  };

  const handleDispatchAmbulance = (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (onTriggerAmbulance) onTriggerAmbulance();
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSystemAction = (action: SystemAction) => {
      if (action.type === 'CONNECT_SPECIALIST') {
          const specialty = action.data.specialty || action.data.specialist || 'Specialist';
          return (
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 my-2 shadow-sm animate-fade-in relative z-20 pointer-events-auto select-none">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Sparkles size={24} /></div>
                      <div>
                          <p className="font-bold text-indigo-900">Specialist Consultation Recommended</p>
                          <p className="text-xs text-indigo-700">Expertise: {specialty}</p>
                      </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">"{action.data.reason || 'Referral for specialized care'}"</p>
                  <button onClick={(e) => handleConnectSpecialist(e, specialty)} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95">
                      <Zap size={16} /> Pay & Connect
                  </button>
              </div>
          );
      }
      if (action.type === 'LAB_REQUEST') {
          const tests = action.data.tests || action.data.labTests || [];
          return (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 my-2 shadow-sm animate-fade-in relative z-20 pointer-events-auto select-none">
                  <div className="flex items-center gap-3 mb-3 border-b border-emerald-100 pb-2">
                      <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Activity size={24} /></div>
                      <div><p className="font-bold text-emerald-900">Approved Lab Request</p></div>
                  </div>
                  <ul className="space-y-1 mb-4">
                      {Array.isArray(tests) && tests.map((test: string, i: number) => (
                          <li key={i} className="text-sm font-medium text-slate-700 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> {test}</li>
                      ))}
                  </ul>
                  <button onClick={(e) => handleBookLab(e, tests, action.data.reason)} className="py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1 w-full"><CalendarCheck size={14} /> Book Lab</button>
              </div>
          );
      }
      if (action.type === 'PRESCRIPTION') {
          return (
              <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 my-2 shadow-sm animate-fade-in relative z-20 pointer-events-auto select-none">
                  <div className="flex items-center gap-2 mb-3 border-b border-teal-100 pb-2">
                      <div className="bg-teal-100 p-2 rounded-lg text-teal-600"><Pill size={20} /></div>
                      <div><p className="font-bold text-teal-900 text-sm">e-Prescription Issued</p></div>
                  </div>
                  {action.data.medications?.map((med: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm text-slate-700 py-1">
                          <span className="font-bold">• {med.name}</span>
                          <span className="bg-white px-2 py-0.5 rounded border text-xs">{med.dosage}</span>
                      </div>
                  ))}
                  <button onClick={(e) => handlePrintRx(e, action.data)} className="w-full mt-3 py-3 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 flex items-center justify-center gap-1"><Download size={16} /> Download PDF</button>
              </div>
          );
      }
      if (action.type === 'REPORT') {
          return (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 my-2 shadow-sm animate-fade-in relative z-20 pointer-events-auto select-none">
                  <div className="flex items-center gap-3 mb-2 border-b border-blue-100 pb-2">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                      <div>
                          <p className="font-bold text-blue-900 text-sm">Analysis Report</p>
                          <p className="text-xs text-blue-600">{action.data.title || 'Document Analysis'}</p>
                      </div>
                  </div>
                  <div className="text-sm text-slate-700 mb-3 space-y-1">
                      <p><strong>Status:</strong> {action.data.status}</p>
                      <ul className="list-disc pl-4 text-xs">
                          {action.data.findings?.slice(0,3).map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                  </div>
                  <button onClick={(e) => handlePrintReport(e, action.data)} className="w-full py-3 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"><Download size={16} /> View & Save PDF</button>
              </div>
          );
      }
      if (action.type === 'BOOK_APPOINTMENT') {
          return (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 my-2 shadow-sm animate-pulse-slow relative z-20 pointer-events-auto select-none">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-100 text-red-600 rounded-full"><Video size={24} /></div>
                      <div><p className="font-bold text-red-900">Complex Case Escalation</p></div>
                  </div>
                  <button onClick={() => setShowCallModal(true)} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"><Phone size={18} /> Call Human Doctor</button>
              </div>
          );
      }
      if (action.type === 'CALL_AMBULANCE') {
          return (
              <div className="bg-red-600 border-2 border-red-800 rounded-xl p-4 my-2 shadow-xl animate-bounce relative z-20 pointer-events-auto select-none">
                  <div className="flex items-center gap-3 mb-2 text-white">
                      <div className="p-2 bg-white/20 rounded-full"><Ambulance size={28} /></div>
                      <div><p className="font-bold text-lg">CRITICAL EMERGENCY</p></div>
                  </div>
                  <button onClick={handleDispatchAmbulance} className="w-full py-3 bg-white text-red-700 font-extrabold rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"><PhoneIncoming size={18} /> DISPATCH AMBULANCE</button>
              </div>
          );
      }
      if (action.type === 'RECEIPT') {
          return (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-2 max-w-sm shadow-sm relative z-20 pointer-events-auto select-none animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                      <span className="font-bold text-slate-700 text-xs uppercase">Payment Receipt</span>
                      <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-slate-500">{action.data.item}</span>
                      <span className="font-bold text-lg text-slate-800">{action.data.cost.toLocaleString()} UGX</span>
                  </div>
                  <button onClick={(e) => handleViewReceipt(e, action.data)} className="w-full py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2"><Download size={14} /> Download PDF</button>
              </div>
          );
      }
      return null;
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-6rem)] rounded-2xl shadow-sm border overflow-hidden relative transition-colors duration-500 ${specialistMode === 'Radiologist' ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-100'}`}>
      
      {/* Styles for Printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-content, .printable-content * { visibility: visible; }
          .printable-content { 
            position: fixed;
            left: 0; 
            top: 0; 
            width: 100%;
            height: 100%;
            margin: 0; 
            padding: 20px;
            background: white;
            z-index: 9999;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      {/* Active Call Overlay */}
      {activeCallSession && (
          <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-sm text-center">
                  <div className="relative mb-8">
                      <div className="w-32 h-32 bg-slate-800 rounded-full mx-auto flex items-center justify-center border-4 border-slate-700 shadow-2xl relative z-10">
                          <UserIcon size={64} className="text-slate-500" />
                      </div>
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping blur-xl"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{activeCallSession.specialist}</h2>
                  <p className="text-emerald-400 font-medium mb-6 animate-pulse">Call in Progress...</p>
                  <div className="text-6xl font-mono font-bold text-white mb-12 tracking-wider">{formatTime(activeCallSession.elapsed)}</div>
                  <div className="flex justify-center gap-6">
                      <button onClick={handleEndCall} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/50 transition-transform active:scale-95"><PhoneOff size={32} /></button>
                  </div>
              </div>
          </div>
      )}

      {/* Various Modals */}
      {showCallModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-6 animate-scale-in">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Phone className="text-red-500" /> Human Specialist</h3>
                      <button onClick={() => setShowCallModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Specialist</label>
                          <select value={callDetails.specialist} onChange={(e) => setCallDetails({...callDetails, specialist: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                              <option>General Practitioner</option><option>Cardiologist</option><option>Pediatrician</option><option>Gynecologist</option>
                          </select>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2 mt-2"><span className="text-slate-800">Total Cost</span><span className="text-indigo-600">{(callDetails.duration * HUMAN_CALL_RATE).toLocaleString()} UGX</span></div></div>
                  </div>
                  <button onClick={handleInitiateCall} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 flex items-center justify-center gap-2"><PhoneIncoming size={18} /> Pay & Call Now</button>
              </div>
          </div>
      )}

      {paymentModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-6 animate-scale-in">
                  <div className="text-center mb-6"><h3 className="text-xl font-bold text-slate-800">Authorize Payment</h3><p className="text-slate-500 text-sm mt-1">{paymentModal.title}</p></div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6"><div className="flex justify-between items-center mb-2"><span className="text-sm text-slate-500">Amount</span><span className="text-lg font-bold text-slate-800">{paymentModal.amount.toLocaleString()} UGX</span></div></div>
                  <div className="space-y-3">
                      <button onClick={paymentModal.onConfirm} className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Confirm & Pay</button>
                      <button onClick={() => setPaymentModal(null)} className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                  </div>
              </div>
          </div>
      )}

      {showReportModal && activeReport && (
          <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white w-full max-w-2xl rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] printable-content relative">
                  {/* Header for Screen */}
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden">
                      <h3 className="font-bold text-slate-800">Report Preview</h3>
                      <div className="flex gap-2">
                          {onAddRecord && (
                              <button onClick={handleSaveReportToRecords} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-200">
                                  <Save size={16} /> Save to Records
                              </button>
                          )}
                          <button onClick={() => triggerPdfDownload(`Report_${Date.now()}.pdf`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
                              <Printer size={16} /> Print / Download PDF
                          </button>
                          <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-600">
                              <X size={20} />
                          </button>
                      </div>
                  </div>

                  {/* Actual Report Content - Scrollable on screen, Full on print */}
                  <div className="p-8 overflow-y-auto bg-white text-slate-900 print:overflow-visible print:h-auto" id="clinical-report">
                      {/* Letterhead */}
                      <div className="border-b-2 border-slate-800 pb-6 mb-6 flex justify-between items-start">
                          <div>
                              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">EduWellness</h1>
                              <p className="text-sm font-bold text-slate-500">AI-Powered Clinical Summary</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-slate-400 uppercase font-bold">Report Date</p>
                              <p className="text-lg font-mono font-bold">{new Date().toLocaleDateString()}</p>
                          </div>
                      </div>

                      {/* Patient Info Table */}
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 print:border-slate-300">
                          <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-wider border-b border-slate-200 pb-2">Patient Details</h4>
                          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                              <div>
                                  <span className="block text-xs text-slate-500 font-medium uppercase">Name</span>
                                  <span className="font-bold text-slate-900 text-lg">{user.name}</span>
                              </div>
                              <div>
                                  <span className="block text-xs text-slate-500 font-medium uppercase">Patient ID / Ref</span>
                                  <span className="font-bold text-slate-900 font-mono">{user.id.substring(0,8).toUpperCase()}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <span className="block text-xs text-slate-500 font-medium uppercase">Age</span>
                                      <span className="font-bold text-slate-900">{user.age || 'N/A'}</span>
                                  </div>
                                  <div>
                                      <span className="block text-xs text-slate-500 font-medium uppercase">Gender</span>
                                      <span className="font-bold text-slate-900">{user.gender || 'N/A'}</span>
                                  </div>
                              </div>
                              <div>
                                  <span className="block text-xs text-slate-500 font-medium uppercase">Current Status</span>
                                  <span className={`font-bold ${activeReport.status === 'Abnormal' ? 'text-red-600' : 'text-emerald-600'}`}>{activeReport.status}</span>
                              </div>
                          </div>
                      </div>

                      {/* Findings */}
                      <div className="mb-8">
                          <h3 className="text-sm font-black text-slate-900 uppercase border-b border-slate-200 pb-2 mb-4">Clinical Findings</h3>
                          <ul className="space-y-3">
                              {activeReport.findings?.map((finding: string, i: number) => (
                                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-800">
                                      <span className="font-mono font-bold text-slate-400 select-none">{String(i+1).padStart(2, '0')}.</span>
                                      <span>{finding}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>

                      {/* Summary Text */}
                      {activeReport.summary && (
                          <div className="mb-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                              <h3 className="text-sm font-black text-blue-900 uppercase mb-3">Executive Summary</h3>
                              <p className="text-sm leading-relaxed text-slate-800 font-medium">{activeReport.summary}</p>
                          </div>
                      )}

                      {/* Footer */}
                      <div className="mt-12 pt-6 border-t border-slate-100 text-center">
                          <p className="text-xs text-slate-400 italic">
                              This report was generated by EduWellness AI (Dr. Wise) based on the session data. It is a summary and does not replace a physical medical diagnosis.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className={`p-4 border-b transition-colors flex flex-col md:flex-row items-center justify-between gap-4 ${
          specialistMode === 'Radiologist' ? 'bg-slate-800 border-slate-700 text-white' : 
          specialistMode !== 'General' ? 'bg-indigo-50 border-indigo-100' : 
          'bg-teal-50/50 border-slate-100'
      }`}>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`p-2 rounded-lg ${
                specialistMode === 'Radiologist' ? 'bg-slate-700 text-emerald-400' : 
                specialistMode !== 'General' ? 'bg-indigo-100 text-indigo-600' : 
                'bg-teal-100 text-teal-600'
            }`}>
                {specialistMode === 'General' ? <Stethoscope size={24} /> : 
                 specialistMode === 'Radiologist' ? <Microscope size={24} /> :
                 specialistMode === 'Cardiologist' ? <Heart size={24} /> :
                 <Sparkles size={24} />
                }
            </div>
            <div>
                <h3 className={`font-bold ${specialistMode === 'Radiologist' ? 'text-white' : specialistMode !== 'General' ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {specialistMode === 'General' ? 'Dr. Wise AI' : specialistMode === 'Radiologist' ? 'AI Radiologist' : `${specialistMode} Assistant`}
                </h3>
                <p className={`text-[10px] font-medium ${specialistMode === 'Radiologist' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {specialistMode === 'General' ? 'General Practitioner & Triage' : 
                     specialistMode === 'Radiologist' ? 'Medical Imaging Expert' : 
                     'Specialized Expert Consultation'}
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button 
                onClick={handleGenerateReport}
                className={`flex items-center gap-1 border px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                    specialistMode === 'Radiologist' ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Generate PDF Report of current session"
            >
                <FileText size={14} /> Report
            </button>
            
            {/* Specialist Selector */}
            <div className={`flex items-center px-2 py-1 rounded-lg border ${
                specialistMode === 'Radiologist' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'
            }`}>
                <Brain size={14} className={`mr-1 ${specialistMode === 'Radiologist' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <select 
                    value={specialistMode} 
                    onChange={(e) => handleSwitchMode(e.target.value as SpecialistType)} 
                    className={`text-xs font-bold outline-none cursor-pointer bg-transparent ${
                        specialistMode === 'Radiologist' ? 'text-white option:text-black' : 'text-slate-700'
                    }`}
                >
                    <option value="General">General</option>
                    <option value="Radiologist">Radiologist (Expert)</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Dermatologist">Dermatologist</option>
                </select>
            </div>

            <div className={`flex items-center px-2 py-1 rounded-lg border ${
                specialistMode === 'Radiologist' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'
            }`}>
                <Globe size={14} className={`mr-1 ${specialistMode === 'Radiologist' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)} 
                    className={`text-xs font-bold outline-none cursor-pointer bg-transparent ${
                        specialistMode === 'Radiologist' ? 'text-white option:text-black' : 'text-slate-700'
                    }`}
                >
                    <option>English</option><option>Luganda</option><option>Swahili</option>
                </select>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth ${
          specialistMode === 'Radiologist' ? 'bg-slate-900 text-slate-200' : 
          specialistMode === 'General' ? 'bg-slate-50/30' : 'bg-indigo-50/20'
      }`}>
          {messages.length === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 animate-fade-in">
                  {QUICK_PROMPTS.map((prompt, i) => (
                      <button key={i} onClick={() => handleSend(null as any, prompt)} className={`text-xs p-3 rounded-xl border transition-all font-medium text-left cursor-pointer ${
                          specialistMode === 'Radiologist' ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100'
                      }`}>{prompt}</button>
                  ))}
              </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 
                        specialistMode === 'Radiologist' ? 'bg-slate-700 text-emerald-400' :
                        specialistMode === 'General' ? 'bg-teal-100 text-teal-600' : 
                        'bg-indigo-100 text-indigo-600'
                    }`}>
                        {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`flex flex-col gap-2 w-full`}>
                        {msg.attachment && (
                            <div className={`p-3 rounded-xl border shadow-sm w-fit ${
                                msg.role === 'user' ? 'self-end bg-white' : 'self-start bg-slate-50'
                            }`}>
                                {msg.attachment.type === 'image' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1">
                                            <Paperclip size={12} /> {msg.attachment.name}
                                        </div>
                                        <img src={msg.attachment.url} alt="Attachment" className="max-w-[200px] max-h-[200px] rounded-lg object-cover" />
                                    </div>
                                ) : msg.attachment.type === 'audio' ? (
                                    <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-lg min-w-[150px]">
                                        <div className="p-2 bg-white rounded-full text-slate-600"><Mic size={16} /></div>
                                        <div className="flex-1 h-1 bg-slate-300 rounded overflow-hidden"><div className="h-full bg-slate-500 w-1/2"></div></div>
                                        <span className="text-[10px] font-mono text-slate-500">{msg.attachment.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={20} /></div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-xs">{msg.attachment.name}</p>
                                            <p className="text-[10px] text-slate-400">Document Uploaded</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {msg.text && (
                            <div className={`relative p-4 rounded-2xl shadow-sm ${
                                msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 
                                specialistMode === 'Radiologist' ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none pr-10' :
                                specialistMode === 'General' ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none pr-10' : 
                                'bg-white text-indigo-900 border border-indigo-100 rounded-tl-none pr-10'
                            }`}>
                                <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                                {msg.role === 'model' && (
                                    <button onClick={() => handleToggleSpeech(msg.text, msg.id)} className="absolute top-2 right-2 text-slate-300 hover:text-teal-600 transition-colors cursor-pointer" title={activeSpeechId === msg.id ? "Stop Audio" : "Play Audio"}>
                                        {activeSpeechId === msg.id ? <Square size={16} className="fill-current text-red-500 animate-pulse" /> : <Play size={16} />}
                                    </button>
                                )}
                            </div>
                        )}
                        {msg.systemAction && renderSystemAction(msg.systemAction)}
                    </div>
                </div>
            </div>
          ))}
          {isLoading && (
              <div className="flex gap-4 animate-fade-in">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${specialistMode === 'Radiologist' ? 'bg-slate-700 text-emerald-400' : 'bg-teal-100 text-teal-600'}`}><Bot size={16} /></div>
                  <div className={`p-4 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-3 ${specialistMode === 'Radiologist' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                      <div className={`flex gap-1 ${specialistMode === 'Radiologist' ? 'bg-transparent' : ''}`}>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${specialistMode === 'Radiologist' ? 'bg-emerald-500' : 'bg-teal-400'}`}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce delay-75 ${specialistMode === 'Radiologist' ? 'bg-emerald-500' : 'bg-teal-400'}`}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce delay-150 ${specialistMode === 'Radiologist' ? 'bg-emerald-500' : 'bg-teal-400'}`}></div>
                      </div>
                      <span className={`text-xs font-medium ${specialistMode === 'Radiologist' ? 'text-slate-400' : 'text-slate-400'}`}>
                          {specialistMode === 'Radiologist' ? 'Analyzing scan details...' : 'Dr. Wise is analyzing...'}
                      </span>
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={(e) => handleSend(e)} className={`p-4 border-t ${specialistMode === 'Radiologist' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          {selectedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 animate-slide-in-up">
                  {selectedFiles.map((file, idx) => (
                      <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg w-fit border shadow-sm ${specialistMode === 'Radiologist' ? 'bg-slate-700 border-slate-600' : 'bg-teal-50 border-teal-100'}`}>
                          <div className={`p-1 rounded-full ${specialistMode === 'Radiologist' ? 'bg-slate-600' : 'bg-white'}`}><FileText size={12} className={specialistMode === 'Radiologist' ? 'text-emerald-400' : 'text-teal-600'}/></div>
                          <span className={`text-xs font-medium truncate max-w-[120px] ${specialistMode === 'Radiologist' ? 'text-slate-200' : 'text-teal-800'}`}>{file.name}</span>
                          <button type="button" onClick={() => removeFile(idx)} className={`rounded-full p-0.5 transition-colors cursor-pointer ml-1 ${specialistMode === 'Radiologist' ? 'bg-slate-600 text-slate-300 hover:bg-red-900 hover:text-red-400' : 'bg-teal-200 text-teal-800 hover:bg-red-200 hover:text-red-700'}`}><X size={12} /></button>
                      </div>
                  ))}
              </div>
          )}

          <div className="flex gap-2 relative items-end">
              <div className="relative flex-shrink-0">
                  <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,application/pdf"
                      multiple
                      className="hidden"
                  />
                  <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className={`p-3 border rounded-xl transition-all mb-0.5 cursor-pointer relative ${
                          specialistMode === 'Radiologist' 
                          ? 'bg-slate-700 border-slate-600 text-emerald-400 hover:bg-slate-600 hover:text-emerald-300' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-teal-50 hover:text-teal-600'
                      }`}
                      title="Upload Files (Images or PDF)"
                  >
                      <Paperclip size={20} />
                      {selectedFiles.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-scale-in">{selectedFiles.length}</span>}
                  </button>
              </div>

              <div className="flex-1 relative">
                  <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isRecording ? "Listening..." : specialistMode === 'Radiologist' ? "Upload scan or describe findings..." : specialistMode === 'General' ? "Message Dr. Wise..." : `Ask the ${specialistMode} Assistant...`}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none min-h-[48px] max-h-[150px] text-sm ${
                          specialistMode === 'Radiologist' 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-emerald-500' 
                          : specialistMode === 'General' 
                            ? 'bg-slate-50 border-slate-200 focus:ring-teal-500' 
                            : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'
                      }`}
                      rows={1}
                      disabled={isLoading || isRecording}
                  />
              </div>
              
              {input.trim() || selectedFiles.length > 0 ? (
                  <button
                      type="submit"
                      disabled={isLoading}
                      className={`p-3 text-white rounded-xl transition-colors shadow-md mb-0.5 ${
                          specialistMode === 'Radiologist' ? 'bg-emerald-600 hover:bg-emerald-700' :
                          specialistMode === 'General' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                  >
                      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
                  </button>
              ) : (
                  <button
                      type="button"
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`p-3 rounded-xl transition-all shadow-md mb-0.5 cursor-pointer ${
                          isRecording ? 'bg-red-500 text-white animate-pulse scale-110' : 
                          specialistMode === 'Radiologist' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                          specialistMode === 'General' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                  >
                      <Mic size={20} />
                  </button>
              )}
          </div>
          <p className={`text-[10px] text-center mt-2 ${specialistMode === 'Radiologist' ? 'text-slate-500' : 'text-slate-400'}`}>
              {isRecording ? "Recording... Release to send." : specialistMode === 'Radiologist' ? "Upload X-Rays, MRIs, or CT Scans for AI Analysis." : "Hold Mic to record voice note. Upload multiple files via paperclip."}
          </p>
      </form>
    </div>
  );
};

export default Advisor;
