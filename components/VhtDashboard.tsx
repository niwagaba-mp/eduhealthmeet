
import React, { useState } from 'react';
import { User } from '../types';
import { Search, Stethoscope, Thermometer, Pill, UserPlus, Phone, MapPin, MessageCircle, AlertTriangle, X, ChevronRight, Plus, Baby, Users, Activity, Save, ClipboardList, CheckCircle2, Send } from 'lucide-react';

interface VhtDashboardProps {
    user: User;
    onChat: (target: { id: string; name: string; avatar: string; role: string }) => void;
    onEmergency: () => void;
    onNavigate: (view: string) => void;
}

interface HouseholdMember {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female';
    relation: 'Head' | 'Spouse' | 'Child' | 'Parent' | 'Relative';
    condition: string;
    status: 'Healthy' | 'Monitor' | 'Critical';
    lastCheckup: string;
    avatar: string;
}

interface Household {
    id: string;
    headName: string;
    location: string;
    phone: string;
    members: HouseholdMember[];
    lastVisit: string;
    riskLevel: 'Low' | 'Medium' | 'High';
}

const MOCK_HOUSEHOLDS: Household[] = [
    { 
        id: 'h1', headName: 'Mukasa Joseph', location: 'Zone B, Gulu', phone: '+256 772 123456', lastVisit: '2 days ago', riskLevel: 'Medium',
        members: [
            { id: 'm1', name: 'Mukasa Joseph', age: 78, gender: 'Male', relation: 'Head', condition: 'Hypertension', status: 'Monitor', lastCheckup: '2 days ago', avatar: 'https://randomuser.me/api/portraits/men/88.jpg' },
            { id: 'm2', name: 'Mama Fiina', age: 34, gender: 'Female', relation: 'Child', condition: 'Pregnancy (Trim 3)', status: 'Healthy', lastCheckup: 'Yesterday', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
            { id: 'm3', name: 'Kato Child', age: 5, gender: 'Male', relation: 'Relative', condition: 'Fever', status: 'Critical', lastCheckup: 'Today', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' }
        ]
    },
    { 
        id: 'h2', headName: 'Sarah Akello', location: 'Zone A, Gulu', phone: '+256 701 998877', lastVisit: '1 week ago', riskLevel: 'Low',
        members: [
            { id: 'm4', name: 'Sarah Akello', age: 29, gender: 'Female', relation: 'Head', condition: 'None', status: 'Healthy', lastCheckup: '1 week ago', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' }
        ]
    }
];

const VhtDashboard: React.FC<VhtDashboardProps> = ({ user, onChat, onEmergency, onNavigate }) => {
    const [households, setHouseholds] = useState<Household[]>(MOCK_HOUSEHOLDS);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Feature Modals
    const [activeModal, setActiveModal] = useState<'register' | 'vitals' | 'restock' | 'triage' | null>(null);

    // Registration Form State
    const [regStep, setRegStep] = useState(1);
    const [newHead, setNewHead] = useState({ name: '', phone: '', location: '', age: '', gender: 'Male' });
    const [newMembers, setNewMembers] = useState<any[]>([]);
    const [tempMember, setTempMember] = useState({ name: '', age: '', gender: 'Female', relation: 'Child', condition: '' });

    // Vitals Form State
    const [vitalsData, setVitalsData] = useState({ sys: '', dia: '', temp: '', pulse: '', patientId: '' });

    // Restock State
    const [restockItems, setRestockItems] = useState({ panadol: false, zinc: false, ors: false, malaria_kits: false, gloves: false });

    // --- HANDLERS ---

    const handleAddMember = () => {
        if (!tempMember.name || !tempMember.age) return;
        setNewMembers([...newMembers, { ...tempMember, id: `tmp-${Date.now()}` }]);
        setTempMember({ name: '', age: '', gender: 'Female', relation: 'Child', condition: '' });
    };

    const handleRemoveMember = (idx: number) => {
        setNewMembers(newMembers.filter((_, i) => i !== idx));
    };

    const handleCompleteRegistration = () => {
        const headMember: HouseholdMember = {
            id: `m-${Date.now()}`,
            name: newHead.name,
            age: parseInt(newHead.age) || 30,
            gender: newHead.gender as any,
            relation: 'Head',
            condition: 'None',
            status: 'Healthy',
            lastCheckup: 'Just now',
            avatar: `https://ui-avatars.com/api/?name=${newHead.name}&background=random`
        };

        const dependantMembers: HouseholdMember[] = newMembers.map(m => ({
            id: `m-${Date.now()}-${Math.random()}`,
            name: m.name,
            age: parseInt(m.age),
            gender: m.gender,
            relation: m.relation,
            condition: m.condition || 'None',
            status: 'Healthy',
            lastCheckup: 'Never',
            avatar: `https://ui-avatars.com/api/?name=${m.name}&background=random`
        }));

        const newHousehold: Household = {
            id: `h-${Date.now()}`,
            headName: newHead.name,
            location: newHead.location,
            phone: newHead.phone,
            members: [headMember, ...dependantMembers],
            lastVisit: 'Just now',
            riskLevel: 'Low'
        };

        setHouseholds([newHousehold, ...households]);
        setActiveModal(null);
        setRegStep(1);
        setNewHead({ name: '', phone: '', location: '', age: '', gender: 'Male' });
        setNewMembers([]);
        alert("Household and Dependants Registered Successfully!");
    };

    const handleSubmitVitals = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Vitals Logged Successfully! Synced with Doctor Dashboard.");
        setActiveModal(null);
        setVitalsData({ sys: '', dia: '', temp: '', pulse: '', patientId: '' });
    };

    const handleSubmitRestock = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Restock Request Sent to District Pharmacy.");
        setActiveModal(null);
        setRestockItems({ panadol: false, zinc: false, ors: false, malaria_kits: false, gloves: false });
    };

    const filteredHouseholds = households.filter(h => 
        h.headName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        h.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-20 relative">
            
            {/* Header Card */}
            <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl border border-slate-700 flex justify-between items-start">
                <div className="flex gap-4">
                    <img src={user.avatar} className="w-16 h-16 rounded-xl border-2 border-emerald-500" />
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Village Health Team (VHT)</p>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                            <MapPin size={12} /> {user.location || 'Gulu District'}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-white">{households.length}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Households</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveModal('triage')} className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 flex flex-col items-center gap-2 hover:bg-emerald-700 transition-colors active:scale-95 group">
                    <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                        <Stethoscope size={32} />
                    </div>
                    <span className="font-bold text-sm">Start Triage</span>
                </button>
                <button onClick={() => setActiveModal('register')} className="bg-white text-slate-700 p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors active:scale-95 group">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                        <UserPlus size={32} />
                    </div>
                    <span className="font-bold text-sm">Register Household</span>
                </button>
            </div>

            {/* Community List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-800">Assigned Community</h3>
                        <p className="text-xs text-slate-500">Manage households and dependants</p>
                    </div>
                    <div className="relative">
                        <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-40"
                        />
                    </div>
                </div>
                <div className="divide-y divide-slate-50">
                    {filteredHouseholds.map(h => (
                        <div key={h.id} onClick={() => setSelectedHousehold(h)} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{h.headName} & Family</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin size={10} /> {h.location} • {h.members.length} Members
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {h.members.some(m => m.status === 'Critical') && (
                                    <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold animate-pulse">
                                        <AlertTriangle size={10} /> Critical
                                    </span>
                                )}
                                <button className="p-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-full transition-all">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* VHT Tools */}
            <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setActiveModal('vitals')} className="bg-white p-3 rounded-xl border border-slate-100 text-center hover:shadow-md hover:border-emerald-200 transition-all active:scale-95 group">
                    <div className="w-10 h-10 mx-auto bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <Activity size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">Log Vitals</span>
                </button>
                <button onClick={() => setActiveModal('restock')} className="bg-white p-3 rounded-xl border border-slate-100 text-center hover:shadow-md hover:border-emerald-200 transition-all active:scale-95 group">
                    <div className="w-10 h-10 mx-auto bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <Pill size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">Restock Meds</span>
                </button>
                <button onClick={() => alert("Calling Doctor Support...")} className="bg-white p-3 rounded-xl border border-slate-100 text-center hover:shadow-md hover:border-emerald-200 transition-all active:scale-95 group">
                    <div className="w-10 h-10 mx-auto bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Phone size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">Call Doctor</span>
                </button>
            </div>

            {/* --- MODALS --- */}

            {/* Household Detail Modal */}
            {selectedHousehold && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
                        <div className="p-6 bg-slate-800 text-white flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold">{selectedHousehold.headName}'s Household</h3>
                                <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                                    <MapPin size={14} /> {selectedHousehold.location}
                                </p>
                                <p className="text-slate-400 text-sm flex items-center gap-1">
                                    <Phone size={14} /> {selectedHousehold.phone}
                                </p>
                            </div>
                            <button onClick={() => setSelectedHousehold(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><X size={20} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                            {selectedHousehold.members.map(member => (
                                <div key={member.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatar} className="w-12 h-12 rounded-full border-2 border-slate-100" />
                                            <div>
                                                <h4 className="font-bold text-slate-800">{member.name}</h4>
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{member.relation} • {member.age} yrs</span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                            member.status === 'Critical' ? 'bg-red-100 text-red-600' :
                                            member.status === 'Monitor' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            {member.status}
                                        </span>
                                    </div>
                                    {member.condition !== 'None' && (
                                        <div className="bg-red-50 text-red-700 text-xs p-2 rounded mb-3 font-medium border border-red-100">
                                            Condition: {member.condition}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => { setActiveModal('vitals'); setVitalsData(prev => ({...prev, patientId: member.id})); }} className="py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-1">
                                            <Activity size={14} /> Log Vitals
                                        </button>
                                        <button onClick={() => onChat({id: member.id, name: member.name, avatar: member.avatar, role: 'Patient'})} className="py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 flex items-center justify-center gap-1">
                                            <MessageCircle size={14} /> Message
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-white">
                            <button onClick={onEmergency} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 flex items-center justify-center gap-2 animate-pulse">
                                <AlertTriangle size={18} /> REPORT EMERGENCY
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Modal */}
            {activeModal === 'register' && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
                        <div className="p-6 border-b border-slate-100 bg-blue-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-blue-900">Register Household</h3>
                                <p className="text-xs text-blue-700">Step {regStep} of 2</p>
                            </div>
                            <button onClick={() => { setActiveModal(null); setRegStep(1); }} className="p-2 hover:bg-blue-100 rounded-full text-blue-700"><X size={20} /></button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {regStep === 1 ? (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 text-sm uppercase border-b border-slate-100 pb-2">Head of Household</h4>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                                        <input type="text" value={newHead.name} onChange={e => setNewHead({...newHead, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Age</label>
                                            <input type="number" value={newHead.age} onChange={e => setNewHead({...newHead, age: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="35" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Gender</label>
                                            <select value={newHead.gender} onChange={e => setNewHead({...newHead, gender: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                                                <option>Male</option>
                                                <option>Female</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                                        <input type="text" value={newHead.phone} onChange={e => setNewHead({...newHead, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="+256..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Location / Village Zone</label>
                                        <input type="text" value={newHead.location} onChange={e => setNewHead({...newHead, location: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Zone B, Village..." />
                                    </div>
                                    <button 
                                        disabled={!newHead.name || !newHead.phone} 
                                        onClick={() => setRegStep(2)} 
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next: Add Dependants
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm uppercase border-b border-slate-100 pb-2 mb-4">Add Dependants</h4>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                            <input type="text" placeholder="Dependant Name" value={tempMember.name} onChange={e => setTempMember({...tempMember, name: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                                            <div className="grid grid-cols-3 gap-2">
                                                <input type="number" placeholder="Age" value={tempMember.age} onChange={e => setTempMember({...tempMember, age: e.target.value})} className="p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                                                <select value={tempMember.gender} onChange={e => setTempMember({...tempMember, gender: e.target.value})} className="p-2 bg-white border border-slate-200 rounded-lg text-sm">
                                                    <option>Female</option>
                                                    <option>Male</option>
                                                </select>
                                                <select value={tempMember.relation} onChange={e => setTempMember({...tempMember, relation: e.target.value})} className="p-2 bg-white border border-slate-200 rounded-lg text-sm">
                                                    <option>Child</option>
                                                    <option>Spouse</option>
                                                    <option>Parent</option>
                                                    <option>Relative</option>
                                                </select>
                                            </div>
                                            <input type="text" placeholder="Condition (Optional)" value={tempMember.condition} onChange={e => setTempMember({...tempMember, condition: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                                            <button onClick={handleAddMember} className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900">
                                                <Plus size={14} className="inline mr-1" /> Add Member
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-600 text-xs uppercase mb-2">Members List ({newMembers.length + 1})</h4>
                                        <div className="space-y-2">
                                            <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                                                <span className="text-sm font-bold text-blue-800">{newHead.name} (Head)</span>
                                            </div>
                                            {newMembers.map((m, i) => (
                                                <div key={i} className="p-2 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                                                    <div className="text-sm">
                                                        <span className="font-bold text-slate-700">{m.name}</span>
                                                        <span className="text-slate-500 text-xs ml-2">{m.relation}, {m.age}</span>
                                                    </div>
                                                    <button onClick={() => handleRemoveMember(i)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setRegStep(1)} className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Back</button>
                                        <button onClick={handleCompleteRegistration} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg">Complete Registration</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Vitals Modal */}
            {activeModal === 'vitals' && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Activity className="text-rose-500"/> Log Vitals</h3>
                            <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmitVitals} className="space-y-4">
                            {!selectedHousehold && (
                                <p className="text-xs text-slate-500 italic">Select a household member first (Functionality mocked here)</p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Systolic (mmHg)</label>
                                    <input type="number" placeholder="120" value={vitalsData.sys} onChange={e=>setVitalsData({...vitalsData, sys: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Diastolic (mmHg)</label>
                                    <input type="number" placeholder="80" value={vitalsData.dia} onChange={e=>setVitalsData({...vitalsData, dia: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Temp (°C)</label>
                                    <input type="number" placeholder="36.5" value={vitalsData.temp} onChange={e=>setVitalsData({...vitalsData, temp: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Pulse (bpm)</label>
                                    <input type="number" placeholder="72" value={vitalsData.pulse} onChange={e=>setVitalsData({...vitalsData, pulse: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg hover:bg-rose-700 flex items-center justify-center gap-2">
                                <Save size={18} /> Save Record
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {activeModal === 'restock' && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Pill className="text-indigo-500"/> Restock Request</h3>
                            <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmitRestock} className="space-y-2">
                            {Object.keys(restockItems).map(key => (
                                <label key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                    <span className="font-bold text-slate-700 capitalize">{key.replace('_', ' ')}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={(restockItems as any)[key]} 
                                        onChange={e => setRestockItems({...restockItems, [key]: e.target.checked})}
                                        className="w-5 h-5 accent-indigo-600 rounded"
                                    />
                                </label>
                            ))}
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 mt-4 flex items-center justify-center gap-2">
                                <Send size={18} /> Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Triage Modal (Simulated) */}
            {activeModal === 'triage' && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-scale-in text-center">
                        <Stethoscope size={48} className="mx-auto text-emerald-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">AI Triage Assistant</h3>
                        <p className="text-slate-500 text-sm mb-6">Describe the patient's symptoms to receive immediate guidance.</p>
                        <button onClick={() => onNavigate('advisor')} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg">
                            Launch Dr. Wise
                        </button>
                        <button onClick={() => setActiveModal(null)} className="mt-4 text-slate-400 text-sm hover:text-slate-600">Cancel</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VhtDashboard;
