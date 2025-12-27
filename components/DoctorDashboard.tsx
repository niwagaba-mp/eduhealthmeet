
import React, { useState, useEffect } from 'react';
import { HealthRecord, User, CallLog, DiseaseProtocol, AiConfig, CaseDiscussion } from '../types';
import { Users, FileText, X, Save, Pill, BriefcaseMedical, Video, Plus, Trash2, Clock, Calendar, Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, Mic, PlayCircle, Upload, MessageSquare, Bot, BarChart3, Settings, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AppointmentScheduler from './AppointmentScheduler';
import GroupCall from './GroupCall';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DoctorDashboardProps {
  user: User;
  patientRecords: HealthRecord[];
  onNavigate: (view: string) => void;
  walletBalance: number;
  callLogs: CallLog[];
  protocols: DiseaseProtocol[];
  onUpdateProtocols: (protocols: DiseaseProtocol[]) => void;
  aiConfig: AiConfig;
  onUpdateAiConfig: (config: AiConfig) => void;
  onStartVideoCall: (participantName: string) => void;
}

// Mock Cases
const MOCK_CASES: CaseDiscussion[] = [
    { id: 'c1', patientId: 'p1', patientName: 'Jane Doe', title: 'Persistent Migraines & Hypertension', participants: ['Dr. Samuel', 'Dr. Mary (Neuro)'], status: 'Open' },
    { id: 'c2', patientId: 'p3', patientName: 'Mary K.', title: 'Post-Op Recovery Complications', participants: ['Dr. Samuel', 'Dr. John (Surg)'], status: 'Open', activeCall: true },
];

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, patientRecords, onNavigate, walletBalance, callLogs, protocols, onUpdateProtocols, aiConfig, onUpdateAiConfig, onStartVideoCall }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'patients' | 'calendar' | 'board' | 'financials' | 'calls' | 'ai_training'>('patients');
  const [cases, setCases] = useState<CaseDiscussion[]>(MOCK_CASES);
  const [activeCaseCall, setActiveCaseCall] = useState<CaseDiscussion | null>(null);
  
  // AI Training State
  const [newProtocolCondition, setNewProtocolCondition] = useState('');
  const [newProtocolSymptoms, setNewProtocolSymptoms] = useState('');
  const [newProtocolQuestions, setNewProtocolQuestions] = useState('');
  const [newProtocolRedFlags, setNewProtocolRedFlags] = useState('');
  const [newProtocolLabs, setNewProtocolLabs] = useState('');
  const [newProtocolInstruction, setNewProtocolInstruction] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);

  // Audio Training State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Knowledge Base State
  const [knowledgeBase, setKnowledgeBase] = useState<{name: string, size: string, date: string, type: string}[]>([
      {name: 'Clinical_Guidelines_2024.pdf', size: '2.4 MB', date: '2024-05-10', type: 'application/pdf'},
      {name: 'Pediatric_Dosage_Chart.docx', size: '1.1 MB', date: '2024-05-15', type: 'application/docx'}
  ]);

  // Modals & State
  const [showSOAP, setShowSOAP] = useState(false);
  const [showRx, setShowRx] = useState(false);
  const [showCreateCase, setShowCreateCase] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Referral Points State
  const [referralPoints, setReferralPoints] = useState(user.referralPoints || 0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Create Case State
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCasePatient, setNewCasePatient] = useState('');

  // SOAP & Rx State
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  
  // Expanded Prescription State
  const [diagnosisTitle, setDiagnosisTitle] = useState('');
  const [medications, setMedications] = useState<{ name: string; dosage: string; freq: string; duration: string; instructions: string }[]>([]);
  // Temp inputs for adding a med
  const [tempDrugName, setTempDrugName] = useState('');
  const [tempDosage, setTempDosage] = useState('');
  const [tempFreq, setTempFreq] = useState('');
  const [tempDuration, setTempDuration] = useState('');
  const [tempInstructions, setTempInstructions] = useState('');

  // Call Management State
  const [callNote, setCallNote] = useState('');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  // Financial Calculations
  const myLogs = callLogs.filter(log => log.receiverId === user.id && log.status === 'Completed');
  const totalConsultationRevenue = myLogs.reduce((acc, log) => acc + log.cost, 0);
  const doctorShare = totalConsultationRevenue * 0.52;
  const taxShare = totalConsultationRevenue * 0.08;
  const platformShare = totalConsultationRevenue * 0.40;

  const financialData = [
      { name: 'Doctor Share (52%)', value: doctorShare, color: '#4f46e5' },
      { name: 'Govt Tax (8%)', value: taxShare, color: '#f43f5e' },
      { name: 'Platform Fee (40%)', value: platformShare, color: '#94a3b8' }
  ];

  const [patients, setPatients] = useState([
      { id: 'p1', name: 'Jane Doe', age: 24, status: 'Attention', lastVisit: '2024-05-12', phone: '+256 772 123456' },
      { id: 'p2', name: 'John Smith', age: 32, status: 'Normal', lastVisit: '2024-05-10', phone: '+256 700 987654' },
      { id: 'p3', name: 'Mary K.', age: 29, status: 'Critical', lastVisit: '2024-05-11', phone: '+256 788 112233' },
  ]);

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter Call Logs for this Doctor
  const doctorCalls = callLogs.filter(log => log.receiverId === user.id || log.callerId === user.id);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
        interval = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } else {
        setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSaveSOAP = (e: React.FormEvent) => {
      e.preventDefault(); alert("SOAP Note Saved"); setShowSOAP(false);
  };
  
  const handleAddMedication = () => {
    if(tempDrugName && tempDosage && tempFreq) {
        setMedications([...medications, { 
            name: tempDrugName, 
            dosage: tempDosage, 
            freq: tempFreq,
            duration: tempDuration,
            instructions: tempInstructions
        }]);
        setTempDrugName('');
        setTempDosage('');
        setTempFreq('');
        setTempDuration('');
        setTempInstructions('');
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSaveRx = (e: React.FormEvent) => {
      e.preventDefault();
      if(medications.length === 0) {
          alert("Please add at least one medication.");
          return;
      }
      alert(`Prescription Issued for ${diagnosisTitle || 'General Treatment'} with ${medications.length} medications.`);
      setShowRx(false);
      setDiagnosisTitle('');
      setMedications([]);
  };

  const handleCreateCase = (e: React.FormEvent) => {
      e.preventDefault();
      const newCase: CaseDiscussion = {
          id: Date.now().toString(),
          patientId: 'unknown',
          patientName: newCasePatient,
          title: newCaseTitle,
          participants: [user.name],
          status: 'Open'
      };
      setCases([newCase, ...cases]);
      setShowCreateCase(false);
      setNewCaseTitle('');
      setNewCasePatient('');
  };

  const handleSimulateRegistration = (e: React.FormEvent) => {
      e.preventDefault();
      const newPatient = {
          id: `p-${Date.now()}`,
          name: regName,
          age: 0,
          status: 'Normal',
          lastVisit: 'Just now',
          phone: regPhone
      };
      setPatients([newPatient, ...patients]);
      setReferralPoints(prev => prev + 150);
      setShowRegistrationModal(false);
      setRegName('');
      setRegPhone('');
      alert(`Patient registered successfully! You earned 150 Referral Points.`);
  };

  const handleCallback = (callerName: string) => {
      if(confirm(`Initiate call to ${callerName}?\n\nRate: 500 UGX/min.\nThis cost will be charged to the Patient's Wallet.`)) {
          onStartVideoCall(callerName);
      }
  };

  const handleMessagePatient = (patientName: string) => {
    alert(`Opening secure chat channel with ${patientName}...`);
    // Logic to open chat view would go here
  };

  const handleSaveCallNote = (id: string) => {
      alert(`Note saved for call #${id}: "${callNote}"`);
      setCallNote('');
      setSelectedCallId(null);
  };

  // Case Board Logic
  const startCaseCall = (c: CaseDiscussion) => {
      setActiveCaseCall(c);
  };

  // AI Training Logic
  const handleSaveProtocol = (e: React.FormEvent) => {
      e.preventDefault();
      setIsTraining(true);
      
      setTimeout(() => {
          const protocolData: DiseaseProtocol = {
              id: editingProtocolId || Date.now().toString(),
              condition: newProtocolCondition,
              symptoms: newProtocolSymptoms.split(',').map(s => s.trim()),
              questions: newProtocolQuestions.split(',').map(s => s.trim()),
              redFlags: newProtocolRedFlags.split(',').map(s => s.trim()),
              recommendedLabs: newProtocolLabs.split(',').map(s => s.trim()),
              activationThreshold: 80,
              triageInstruction: newProtocolInstruction
          };

          if (editingProtocolId) {
              onUpdateProtocols(protocols.map(p => p.id === editingProtocolId ? protocolData : p));
              alert("Protocol Updated Successfully!");
          } else {
              onUpdateProtocols([protocolData, ...protocols]);
              alert("New Protocol Added Successfully!");
          }

          setIsTraining(false);
          setEditingProtocolId(null);
          setNewProtocolCondition('');
          setNewProtocolSymptoms('');
          setNewProtocolQuestions('');
          setNewProtocolRedFlags('');
          setNewProtocolLabs('');
          setNewProtocolInstruction('');
      }, 1500);
  };

  const handleSimulateAnalysis = (source: 'recording' | 'upload') => {
      setIsTraining(true);
      setTimeout(() => {
          setNewProtocolCondition("Acute Bronchitis");
          setNewProtocolSymptoms("Persistent cough, production of mucus, fatigue, slight fever and chills, chest discomfort");
          setNewProtocolQuestions("How long have you been coughing?, Is the mucus clear or colored?, Do you smoke?");
          setNewProtocolRedFlags("Coughing up blood, high fever > 38C, shortness of breath");
          setNewProtocolLabs("Chest X-ray, Sputum Culture, CBC");
          setNewProtocolInstruction("Advise rest and fluids. Prescribe cough suppressant if sleep is disturbed. Antibiotics only if bacterial infection confirmed.");
          
          setIsTraining(false);
          alert(`AI has analyzed the ${source === 'recording' ? 'consultation recording' : 'uploaded audio file'}. A draft protocol has been generated below for your review.`);
          const form = document.getElementById('protocol-form');
          if(form) form.scrollIntoView({ behavior: 'smooth' });
      }, 3000);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          handleSimulateAnalysis('upload');
      }
  };

  if (activeCaseCall) {
      return <GroupCall 
        title={`Medical Board: ${activeCaseCall.patientName}`} 
        participants={activeCaseCall.participants.filter(p => p !== user.name)} 
        type="doctor" 
        onEndCall={() => setActiveCaseCall(null)} 
      />;
  }

  // --- RENDER CONTENT BASED ON VIEW MODE ---
  const renderContent = () => {
    switch (viewMode) {
      case 'calls':
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Call Logs & Triage</h2>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                    <span className="text-slate-500">Secure Line:</span> <span className="font-bold text-emerald-600">Active</span>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Patient / Colleague</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Duration</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {doctorCalls.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No call history found.</td></tr>
                        ) : (
                            doctorCalls.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        {log.type === 'video' ? <Video size={18} className="text-purple-500" /> : <Phone size={18} className="text-blue-500" />}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{log.callerId === user.id ? `Outgoing to: ${log.receiverId}` : `From: ${log.callerId}`}</div>
                                        <div className="text-xs text-slate-500">{new Date(log.startTime).toLocaleString()}</div>
                                    </td>
                                    <td className="p-4 text-sm font-mono">{Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            log.status === 'Missed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>{log.status}</span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleCallback(log.callerId === user.id ? log.receiverId : log.callerId)} className="p-2 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg transition-colors" title="Call Back">
                                            <PhoneOutgoing size={16} />
                                        </button>
                                        <button onClick={() => setSelectedCallId(selectedCallId === log.id ? null : log.id)} className="p-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors" title="Add Note">
                                            <FileText size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
             {/* Call Note Quick Input */}
             {selectedCallId && (
                 <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 animate-fade-in">
                     <h4 className="text-sm font-bold text-yellow-800 mb-2">Add Clinical Note to Call #{selectedCallId}</h4>
                     <textarea 
                        value={callNote} 
                        onChange={(e) => setCallNote(e.target.value)} 
                        className="w-full p-3 bg-white border border-yellow-200 rounded-lg text-sm mb-2"
                        placeholder="Patient reported..."
                     />
                     <button onClick={() => handleSaveCallNote(selectedCallId)} className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700">Save Note</button>
                 </div>
             )}
          </div>
        );

      case 'financials':
          return (
              <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800">Practice Financials</h2>
                  <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-sm text-slate-500">Total Revenue</div>
                          <div className="text-3xl font-bold text-slate-800 mt-1">UGX {totalConsultationRevenue.toLocaleString()}</div>
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-sm text-slate-500">Net Income (After Tax)</div>
                          <div className="text-3xl font-bold text-emerald-600 mt-1">UGX {doctorShare.toLocaleString()}</div>
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-sm text-slate-500">Pending Payout</div>
                          <div className="text-3xl font-bold text-blue-600 mt-1">UGX {doctorShare.toLocaleString()}</div>
                      </div>
                  </div>
                  <div className="h-80 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-700 mb-4">Revenue Split</h3>
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value">
                                {financialData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          );

      case 'board':
          return (
              <div className="space-y-6">
                   <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Collaborative Boards</h2>
                        <button onClick={() => setShowCreateCase(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            <Plus size={18} /> New Case
                        </button>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                        {cases.map(c => (
                            <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">{c.status}</div>
                                    <button onClick={() => startCaseCall(c)} className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100">
                                        <Video size={20} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{c.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">Patient: {c.patientName}</p>
                                <div className="flex -space-x-2">
                                    {c.participants.map((p, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={p}>
                                            {p.charAt(0)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                   </div>
              </div>
          );

      case 'ai_training':
          return (
              <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800">AI Knowledge Base & Protocols</h2>
                  <div className="grid grid-cols-2 gap-6">
                      {/* Left: Input Form */}
                      <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Mic size={18} className="text-blue-500"/> Train via Voice / Audio</h3>
                                <div className="flex gap-4">
                                    <button onClick={() => setIsRecording(!isRecording)} className={`flex-1 py-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${isRecording ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-500'}`}>
                                        <div className={`p-3 rounded-full ${isRecording ? 'bg-red-200 animate-pulse' : 'bg-slate-200'}`}>
                                            <Mic size={24} />
                                        </div>
                                        <span className="font-bold text-sm">{isRecording ? `Recording ${recordingDuration}s...` : 'Record Consultation'}</span>
                                    </button>
                                    <label className="flex-1 py-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-500">
                                        <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                                        <div className="p-3 bg-slate-200 rounded-full">
                                            <Upload size={24} />
                                        </div>
                                        <span className="font-bold text-sm">Upload Audio</span>
                                    </label>
                                </div>
                            </div>

                            <form id="protocol-form" onSubmit={handleSaveProtocol} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Define Protocol Rules</h3>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1">Condition Name</label><input required value={newProtocolCondition} onChange={e=>setNewProtocolCondition(e.target.value)} className="w-full p-2 border rounded-lg text-sm" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1">Symptoms (comma sep)</label><textarea required value={newProtocolSymptoms} onChange={e=>setNewProtocolSymptoms(e.target.value)} className="w-full p-2 border rounded-lg text-sm h-16" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1">Triage AI Questions</label><textarea required value={newProtocolQuestions} onChange={e=>setNewProtocolQuestions(e.target.value)} className="w-full p-2 border rounded-lg text-sm h-16" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1">Red Flags (Urgent)</label><textarea required value={newProtocolRedFlags} onChange={e=>setNewProtocolRedFlags(e.target.value)} className="w-full p-2 border rounded-lg text-sm h-16 border-red-200 bg-red-50" /></div>
                                <button disabled={isTraining} type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                                    {isTraining ? 'Processing...' : 'Save to AI Model'}
                                </button>
                            </form>
                      </div>
                      
                      {/* Right: Existing Protocols */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full overflow-y-auto">
                           <h3 className="font-bold text-slate-700 mb-4">Active Protocols ({protocols.length})</h3>
                           <div className="space-y-3">
                                {protocols.map(p => (
                                    <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                        <div className="font-bold text-slate-800">{p.condition}</div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{p.triageInstruction}</div>
                                    </div>
                                ))}
                           </div>
                      </div>
                  </div>
              </div>
          );

      case 'calendar':
          return <AppointmentScheduler user={user} onSchedule={() => {}} appointments={[]} onStartCall={onStartVideoCall} />;

      case 'patients':
      default:
        return (
            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search patients by name..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button onClick={() => setShowRegistrationModal(true)} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 flex items-center gap-2">
                        <Plus size={20} /> Register Patient
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map(patient => (
                        <div key={patient.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                    {patient.name.charAt(0)}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    patient.status === 'Critical' ? 'bg-red-100 text-red-600' : 
                                    patient.status === 'Attention' ? 'bg-amber-100 text-amber-600' : 
                                    'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {patient.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">{patient.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{patient.age} yrs • Last visit: {patient.lastVisit}</p>
                            
                            <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
                                <button onClick={() => { setSelectedPatient(patient.name); setShowSOAP(true); }} className="flex flex-col items-center gap-1 text-slate-500 hover:text-purple-600 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-purple-50"><FileText size={18} /></div>
                                    <span className="text-[10px] font-bold">SOAP</span>
                                </button>
                                <button onClick={() => { setSelectedPatient(patient.name); setShowRx(true); }} className="flex flex-col items-center gap-1 text-slate-500 hover:text-teal-600 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-50"><Pill size={18} /></div>
                                    <span className="text-[10px] font-bold">Rx</span>
                                </button>
                                <button onClick={() => handleMessagePatient(patient.name)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50"><MessageSquare size={18} /></div>
                                    <span className="text-[10px] font-bold">Chat</span>
                                </button>
                                <button onClick={() => handleCallback(patient.name)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50"><Video size={18} /></div>
                                    <span className="text-[10px] font-bold">Video</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
            <div className="p-6">
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                    <BriefcaseMedical className="text-emerald-400" /> Med<span className="text-emerald-400">Wise</span>
                </div>
                <div className="mt-6 p-4 bg-slate-800 rounded-xl">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Wallet Balance</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                        UGX {walletBalance.toLocaleString()}
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
                <button onClick={() => setViewMode('patients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'patients' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'hover:bg-slate-800'}`}>
                    <Users size={20} /> Patients
                </button>
                <button onClick={() => setViewMode('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'hover:bg-slate-800'}`}>
                    <Calendar size={20} /> Schedule
                </button>
                <button onClick={() => setViewMode('calls')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'calls' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'hover:bg-slate-800'}`}>
                    <Phone size={20} /> Call Logs
                </button>
                <button onClick={() => setViewMode('board')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'board' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'hover:bg-slate-800'}`}>
                    <BriefcaseMedical size={20} /> Boards
                </button>
                <button onClick={() => setViewMode('ai_training')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'ai_training' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'hover:bg-slate-800'}`}>
                    <Bot size={20} /> AI Training
                </button>
                <button onClick={() => setViewMode('financials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'financials' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'hover:bg-slate-800'}`}>
                    <BarChart3 size={20} /> Financials
                </button>
            </nav>

            <div className="p-6 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">General Practitioner</div>
                    </div>
                </div>
            </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto p-8 relative">
            {renderContent()}
        </main>

        {/* --- MODALS (Fixed Position) --- */}

        {/* Registration Modal */}
        {showRegistrationModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-emerald-50">
                        <h3 className="text-lg font-bold text-emerald-900">Patient Self-Registration</h3>
                        <p className="text-xs text-emerald-700">Simulating link click...</p>
                    </div>
                    <form onSubmit={handleSimulateRegistration} className="p-6 space-y-4">
                        <p className="text-sm text-slate-500">Entering patient details here will link them to your account.</p>
                        <input required type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Patient Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                        <input required type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Phone Number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                        <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Register & Link</button>
                        <button type="button" onClick={() => setShowRegistrationModal(false)} className="w-full py-2 text-slate-400 text-sm">Cancel</button>
                    </form>
                </div>
            </div>
        )}

        {/* SOAP Modal */}
        {showSOAP && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-purple-50">
                        <div>
                            <h3 className="text-xl font-bold text-purple-900">Clinical Note (SOAP)</h3>
                            <p className="text-xs text-purple-700">Patient: {selectedPatient || 'Jane Doe'}</p>
                        </div>
                        <button onClick={() => setShowSOAP(false)} className="p-2 hover:bg-purple-100 rounded-full text-purple-700">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSaveSOAP} className="p-6 space-y-4 overflow-y-auto flex-1">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subjective</label><textarea value={subjective} onChange={e => setSubjective(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-20 focus:ring-2 focus:ring-purple-500 outline-none" required></textarea></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Objective</label><textarea value={objective} onChange={e => setObjective(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-20 focus:ring-2 focus:ring-purple-500 outline-none" required></textarea></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assessment</label><textarea value={assessment} onChange={e => setAssessment(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-20 focus:ring-2 focus:ring-purple-500 outline-none" required></textarea></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plan</label><textarea value={plan} onChange={e => setPlan(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-20 focus:ring-2 focus:ring-purple-500 outline-none" required></textarea></div>
                        
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg flex items-center gap-2">
                                <Save size={18} /> Save Clinical Note
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Create Case Modal */}
        {showCreateCase && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-purple-50">
                        <div>
                            <h3 className="text-xl font-bold text-purple-900">New Case Board</h3>
                            <p className="text-xs text-purple-700">Collaborate with other specialists</p>
                        </div>
                        <button onClick={() => setShowCreateCase(false)} className="p-2 hover:bg-purple-100 rounded-full text-purple-700">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleCreateCase} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Name</label>
                            <input type="text" value={newCasePatient} onChange={e => setNewCasePatient(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. John Doe" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Case Title / Topic</label>
                            <input type="text" value={newCaseTitle} onChange={e => setNewCaseTitle(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Unusual Cardiac Rhythms" required />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg flex items-center gap-2">
                                <BriefcaseMedical size={18} /> Create Board
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Prescription Modal */}
        {showRx && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 bg-teal-50 flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center font-serif text-2xl font-bold">Rx</div>
                            <div>
                                <h3 className="text-xl font-bold text-teal-900">e-Prescription</h3>
                                <p className="text-sm text-teal-700 font-medium">Patient: {selectedPatient || 'Jane Doe'}</p>
                                <p className="text-xs text-teal-600 mt-1">Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowRx(false)} className="p-2 hover:bg-teal-100 rounded-full text-teal-700">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        {/* Diagnosis Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Diagnosis / Condition</label>
                            <input type="text" value={diagnosisTitle} onChange={e => setDiagnosisTitle(e.target.value)} placeholder="e.g. Acute Bacterial Sinusitis" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-800 shadow-sm" />
                        </div>

                        {/* Medications List */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase flex justify-between items-center">
                                <span>Medications Prescribed</span>
                                <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full">{medications.length} Items</span>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                                {medications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm italic flex flex-col items-center gap-2">
                                        <Pill size={24} className="opacity-20" />
                                        No medications added yet.
                                    </div>
                                ) : (
                                    medications.map((med, idx) => (
                                        <div key={idx} className="p-4 flex justify-between items-center group hover:bg-slate-50 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">{idx + 1}. {med.name}</span>
                                                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">{med.dosage}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                    <Clock size={10} /> {med.freq} 
                                                    {med.duration && <span className="flex items-center gap-1 border-l border-slate-300 pl-2 ml-2"><Calendar size={10} /> {med.duration}</span>}
                                                </div>
                                                {med.instructions && (
                                                    <div className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 p-1.5 rounded border border-slate-100 inline-block">
                                                        Note: {med.instructions}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => removeMedication(idx)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Add New Medication Form */}
                        <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-3">
                            <p className="text-xs font-bold text-teal-700 uppercase flex items-center gap-2">
                                <Plus size={12} className="bg-teal-200 rounded-full p-0.5" /> Add Medication
                            </p>
                            <div>
                                <input type="text" value={tempDrugName} onChange={e => setTempDrugName(e.target.value)} placeholder="Drug Name (e.g. Amoxicillin)" className="w-full p-2.5 bg-white border border-teal-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none mb-2 shadow-sm" />
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input type="text" value={tempDosage} onChange={e => setTempDosage(e.target.value)} placeholder="Dosage (e.g. 500mg)" className="w-full p-2.5 bg-white border border-teal-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-sm" />
                                    <input type="text" value={tempFreq} onChange={e => setTempFreq(e.target.value)} placeholder="Freq (e.g. 3x Daily)" className="w-full p-2.5 bg-white border border-teal-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input type="text" value={tempDuration} onChange={e => setTempDuration(e.target.value)} placeholder="Duration (e.g. 7 days)" className="w-full p-2.5 bg-white border border-teal-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-sm" />
                                    <input type="text" value={tempInstructions} onChange={e => setTempInstructions(e.target.value)} placeholder="Instructions (e.g. After meals)" className="w-full p-2.5 bg-white border border-teal-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-sm" />
                                </div>
                            </div>
                            <button type="button" onClick={handleAddMedication} disabled={!tempDrugName || !tempDosage || !tempFreq} className="w-full py-2.5 bg-teal-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-teal-700 flex items-center justify-center gap-1 disabled:opacity-50 transition-colors">
                                <Plus size={14} /> Add to List
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button onClick={handleSaveRx} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg flex items-center gap-2">
                            <Save size={18} /> Issue Prescription
                        </button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default DoctorDashboard;
