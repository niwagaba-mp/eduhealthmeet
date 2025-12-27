
import React, { useState } from 'react';
import { CallLog, Institution, User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, PhoneMissed, PhoneOutgoing, TrendingUp, Search, FileText, CheckCircle2, AlertCircle, PlayCircle, Activity, Clock, DollarSign, Download, Plus, X, Upload, ShieldCheck, BadgeCheck, FileBadge, Hash, User as UserIcon, Globe, Mail, Send, Presentation, LogIn } from 'lucide-react';

interface AdminDashboardProps {
    institutions: Institution[];
    callLogs: CallLog[];
    onAddInstitution: (inst: Institution) => void;
    onUpdateInstitution: (id: string, updates: Partial<Institution>) => void;
    onOpenPitchDeck?: () => void;
    onImpersonate?: (user: User) => void;
}

interface PendingApplicant {
    id: string;
    type: 'Doctor' | 'Patient';
    name: string;
    email: string;
    details: string; // License or ID info
    region: string;
    appliedDate: string;
    documents: string[];
}

const MOCK_PENDING_USERS: PendingApplicant[] = [
    { id: 'u1', type: 'Doctor', name: 'Dr. Alex M.', email: 'alex.m@med.ug', details: 'Cardiologist • Lic: 88392', region: 'Kampala', appliedDate: '2024-05-20', documents: ['License.pdf', 'Diploma.jpg'] },
    { id: 'u2', type: 'Doctor', name: 'Dr. Sarah J.', email: 's.j@clinic.ug', details: 'Pediatrician • Lic: 99210', region: 'Gulu', appliedDate: '2024-05-21', documents: ['License.pdf'] },
    { id: 'u3', type: 'Patient', name: 'Joseph K.', email: 'joseph.k@mail.com', details: 'ID: 883-112-334', region: 'Jinja', appliedDate: '2024-05-22', documents: ['NationalID.jpg'] },
];

const MOCK_USERS_FOR_IMPERSONATION: User[] = [
    { id: 'imp1', name: 'Jane Doe (Patient)', email: 'jane@edu.ug', role: 'patient', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', subscriptionPlan: 'Pro', wellnessPoints: 200, location: 'Kampala' },
    { id: 'imp2', name: 'Dr. Samuel K. (GP)', email: 'doc@edu.ug', role: 'doctor', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', licenseNumber: 'MED-1234', referralPoints: 500 },
    { id: 'imp3', name: 'Grace A. (VHT)', email: 'vht@edu.ug', role: 'vht', avatar: 'https://randomuser.me/api/portraits/women/60.jpg', location: 'Gulu', district: 'Gulu' },
    { id: 'imp4', name: 'John Okello (Diaspora)', email: 'diaspora@edu.ug', role: 'diaspora', avatar: 'https://randomuser.me/api/portraits/men/85.jpg', location: 'London, UK', isDiaspora: true },
    { id: 'imp5', name: 'City Pharmacy (Vendor)', email: 'vendor@edu.ug', role: 'vendor', avatar: 'https://ui-avatars.com/api/?name=CP', location: 'Kampala', clinicName: 'City Pharmacy' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ institutions, callLogs, onAddInstitution, onUpdateInstitution, onOpenPitchDeck, onImpersonate }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'calls' | 'verifications' | 'users'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Verification State
    const [pendingUsers, setPendingUsers] = useState<PendingApplicant[]>(MOCK_PENDING_USERS);
    const [reviewItem, setReviewItem] = useState<PendingApplicant | Institution | null>(null);
    const [commMessage, setCommMessage] = useState('');
    const [commSubject, setCommSubject] = useState('');
    
    // Registration Modal State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [newInstName, setNewInstName] = useState('');
    const [newInstType, setNewInstType] = useState('Clinic');
    const [newInstLicense, setNewInstLicense] = useState('');
    const [newInstEmail, setNewInstEmail] = useState('');
    const [newInstPhone, setNewInstPhone] = useState('');
    const [newInstAddress, setNewInstAddress] = useState('');
    const [newInstContactPerson, setNewInstContactPerson] = useState('');
    const [newInstWebsite, setNewInstWebsite] = useState('');
    const [newInstTin, setNewInstTin] = useState('');
    const [newInstLevel, setNewInstLevel] = useState('Clinic');

    // Derived Analytics
    const totalCalls = callLogs.length;
    const missedCalls = callLogs.filter(c => c.status === 'Missed').length;
    const totalRevenue = institutions.reduce((acc, curr) => acc + curr.revenue, 0);
    const activeTenants = institutions.filter(i => i.subscriptionStatus === 'Active').length;
    const pendingTenants = institutions.filter(i => i.subscriptionStatus === 'Pending_Approval').length;
    const pendingUsersCount = pendingUsers.length;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const callVolumeData = [
        { name: 'Mon', calls: 120, missed: 5 },
        { name: 'Tue', calls: 132, missed: 8 },
        { name: 'Wed', calls: 101, missed: 2 },
        { name: 'Thu', calls: 134, missed: 10 },
        { name: 'Fri', calls: 190, missed: 15 },
        { name: 'Sat', calls: 90, missed: 3 },
        { name: 'Sun', calls: 70, missed: 1 },
    ];

    const filteredLogs = callLogs.filter(log => 
        log.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInstitutions = institutions.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const newInst: Institution = {
            id: `inst-${Date.now()}`,
            name: newInstName,
            type: newInstType as any,
            subscriptionStatus: 'Pending_Approval',
            patientCount: 0,
            doctorCount: 0,
            revenue: 0,
            licenseNumber: newInstLicense,
            adminEmail: newInstEmail,
            contactPhone: newInstPhone,
            address: newInstAddress,
            registrationDate: new Date().toISOString().split('T')[0],
            contactPerson: newInstContactPerson,
            websiteUrl: newInstWebsite,
            tinNumber: newInstTin,
            facilityLevel: newInstLevel as any
        };
        onAddInstitution(newInst);
        setShowRegisterModal(false);
        // Reset form
        setNewInstName('');
        setNewInstLicense('');
        setNewInstEmail('');
        setNewInstPhone('');
        setNewInstAddress('');
        setNewInstContactPerson('');
        setNewInstWebsite('');
        setNewInstTin('');
        setNewInstLevel('Clinic');
    };

    const openReviewModal = (item: PendingApplicant | Institution) => {
        setReviewItem(item);
        const isInst = 'subscriptionStatus' in item;
        const name = isInst ? item.name : item.name;
        setCommSubject(`Application Update: ${name}`);
        setCommMessage(
            `Dear ${name},\n\nWe have reviewed your application to join EduWellness. \n\nNext Steps:\n1. Complete your profile setup.\n2. Sign the data privacy agreement.\n\nWelcome aboard!`
        );
    };

    const handleFinalizeVerification = (status: 'Approved' | 'Rejected') => {
        if (!reviewItem) return;
        
        const isInst = 'subscriptionStatus' in reviewItem;
        
        if (status === 'Approved') {
            if (isInst) {
                onUpdateInstitution((reviewItem as Institution).id, { subscriptionStatus: 'Active' });
            } else {
                setPendingUsers(prev => prev.filter(u => u.id !== (reviewItem as PendingApplicant).id));
            }
            alert(`Application Approved.\nEmail Sent to: ${isInst ? (reviewItem as Institution).adminEmail : (reviewItem as PendingApplicant).email}\n\nMessage: "${commMessage}"`);
        } else {
            if (isInst) {
                onUpdateInstitution((reviewItem as Institution).id, { subscriptionStatus: 'Suspended' }); // Or rejected state
            } else {
                setPendingUsers(prev => prev.filter(u => u.id !== (reviewItem as PendingApplicant).id));
            }
            alert(`Application Rejected.\nReason sent to applicant.`);
        }
        setReviewItem(null);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 relative">
            
            {/* Communication / Review Modal */}
            {reviewItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-in">
                        <div className="p-6 border-b border-slate-100 bg-indigo-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-indigo-900">Verify Application</h3>
                                <p className="text-xs text-indigo-700">Review documents & communicate next steps.</p>
                            </div>
                            <button onClick={() => setReviewItem(null)} className="p-2 hover:bg-indigo-100 rounded-full text-indigo-700"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Applicant</span>
                                    <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded font-bold">
                                        {'subscriptionStatus' in reviewItem ? 'Institution' : (reviewItem as PendingApplicant).type}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg">{reviewItem.name}</h4>
                                <p className="text-sm text-slate-600">
                                    {'subscriptionStatus' in reviewItem 
                                        ? `${(reviewItem as Institution).type} • Lic: ${(reviewItem as Institution).licenseNumber}`
                                        : (reviewItem as PendingApplicant).details
                                    }
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 cursor-pointer">
                                        <FileText size={12} /> View License
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 cursor-pointer">
                                        <BadgeCheck size={12} /> Identity Check
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Subject</label>
                                <input type="text" value={commSubject} onChange={e => setCommSubject(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Communication Message</label>
                                <textarea 
                                    value={commMessage} 
                                    onChange={e => setCommMessage(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                                ></textarea>
                                <p className="text-[10px] text-slate-400 mt-1">This message will be sent to the applicant's registered email.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => handleFinalizeVerification('Rejected')}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-colors"
                                >
                                    Reject
                                </button>
                                <button 
                                    onClick={() => handleFinalizeVerification('Approved')}
                                    className="flex-1 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Send size={16} /> Approve & Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-teal-50">
                            <div>
                                <h3 className="text-xl font-bold text-teal-900">Register Medical Facility</h3>
                                <p className="text-xs text-teal-700">Add a new institution to the EduWellness Network</p>
                            </div>
                            <button onClick={() => setShowRegisterModal(false)} className="p-2 hover:bg-teal-100 rounded-full text-teal-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleRegister} className="p-6 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facility Name</label>
                                    <input required type="text" value={newInstName} onChange={e => setNewInstName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Kampala City Clinic" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facility Type</label>
                                    <select value={newInstType} onChange={e => setNewInstType(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                                        <option>Clinic</option>
                                        <option>Hospital</option>
                                        <option>NGO</option>
                                        <option>Corporate</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facility Level (MoH)</label>
                                    <select value={newInstLevel} onChange={e => setNewInstLevel(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                                        <option>National Referral</option>
                                        <option>Regional Referral</option>
                                        <option>General Hospital</option>
                                        <option>Health Centre IV</option>
                                        <option>Health Centre III</option>
                                        <option>Clinic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">TIN Number</label>
                                    <div className="relative">
                                        <input required type="text" value={newInstTin} onChange={e => setNewInstTin(e.target.value)} className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono" placeholder="1000..." />
                                        <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <BadgeCheck size={16} className="text-teal-600" /> License & Certification
                                </h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medical License Number</label>
                                    <input required type="text" value={newInstLicense} onChange={e => setNewInstLicense(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. LIC-2024-UG-883" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Certificate</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-white transition-colors">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs">Click to upload PDF or Image</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Email</label>
                                    <input required type="email" value={newInstEmail} onChange={e => setNewInstEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="admin@facility.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Contact</label>
                                    <input required type="text" value={newInstPhone} onChange={e => setNewInstPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="+256..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Contact Person</label>
                                    <input required type="text" value={newInstContactPerson} onChange={e => setNewInstContactPerson(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Dr. John Smith" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Official Website</label>
                                    <input type="url" value={newInstWebsite} onChange={e => setNewInstWebsite(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="https://..." />
                                </div>
                            </div>

                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Physical Address</label>
                                <input required type="text" value={newInstAddress} onChange={e => setNewInstAddress(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Plot 42..." />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-teal-700 transition-colors">
                                    <Plus size={18} /> Register Facility
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                     <h2 className="text-2xl font-bold text-slate-800">System Administration</h2>
                     <p className="text-slate-500 text-sm">Manage tenants, verification, and system health.</p>
                 </div>
                 <div className="flex gap-2">
                     <button onClick={onOpenPitchDeck} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-2">
                         <Presentation size={18} /> View Investor Pitch
                     </button>
                     <button onClick={() => setShowRegisterModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold shadow-sm hover:bg-teal-700 flex items-center gap-2">
                         <Plus size={18} /> Add Facility
                     </button>
                 </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                     <h3 className="text-2xl font-bold text-slate-800">{totalRevenue.toLocaleString()} <span className="text-xs text-slate-400">UGX</span></h3>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500">Active Tenants</p>
                     <h3 className="text-2xl font-bold text-emerald-600">{activeTenants} <span className="text-xs text-slate-400">/ {institutions.length}</span></h3>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500">System Calls</p>
                     <h3 className="text-2xl font-bold text-blue-600">{totalCalls}</h3>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
                     <h3 className="text-2xl font-bold text-amber-500">{pendingTenants + pendingUsersCount}</h3>
                 </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
                 {['overview', 'users', 'tenants', 'calls', 'verifications'].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors capitalize whitespace-nowrap ${
                            activeTab === tab ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                     >
                         {tab === 'users' ? 'User Management' : tab}
                     </button>
                 ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
                     <h3 className="font-bold text-slate-800 mb-4">Call Volume Analytics</h3>
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={callVolumeData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                             <YAxis hide />
                             <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                             <Bar dataKey="calls" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Total Calls" />
                             <Bar dataKey="missed" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Missed Calls" />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_USERS_FOR_IMPERSONATION.map(user => (
                            <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-slate-100" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                                        <p className="text-xs text-slate-500 uppercase font-bold">{user.role}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-4 space-y-1">
                                    <p>Email: {user.email}</p>
                                    <p>Loc: {user.location}</p>
                                </div>
                                <button 
                                    onClick={() => onImpersonate && onImpersonate(user)}
                                    className="w-full py-2 bg-slate-50 text-slate-700 font-bold text-xs rounded-lg hover:bg-teal-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogIn size={14} /> Login as {user.name.split(' ')[0]}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'tenants' && (
                 <div className="space-y-4">
                     <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input type="text" placeholder="Search facilities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {filteredInstitutions.map(inst => (
                             <div key={inst.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                 <div className="flex justify-between items-start mb-3">
                                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${inst.subscriptionStatus === 'Active' ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'}`}>
                                         <Building2 size={20} />
                                     </div>
                                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${inst.subscriptionStatus === 'Active' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                                         {inst.subscriptionStatus.replace('_', ' ')}
                                     </span>
                                 </div>
                                 <h4 className="font-bold text-slate-800">{inst.name}</h4>
                                 <p className="text-xs text-slate-500 mb-4">{inst.type} • {inst.address}</p>
                                 <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                                     <div className="bg-slate-50 p-2 rounded"><strong>{inst.doctorCount}</strong> Doctors</div>
                                     <div className="bg-slate-50 p-2 rounded"><strong>{inst.patientCount}</strong> Patients</div>
                                 </div>
                                 <div className="flex gap-2 border-t border-slate-50 pt-3">
                                     {inst.subscriptionStatus !== 'Active' && (
                                         <button onClick={() => openReviewModal(inst)} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Review</button>
                                     )}
                                     <button className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">Details</button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            )}

            {activeTab === 'calls' && (
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                     <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                         <h3 className="font-bold text-slate-800">System Call Logs</h3>
                         <div className="relative w-64">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                             <input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none" />
                         </div>
                     </div>
                     <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                             <tr>
                                 <th className="p-4">Time</th>
                                 <th className="p-4">Caller</th>
                                 <th className="p-4">Receiver</th>
                                 <th className="p-4">Status</th>
                                 <th className="p-4">Duration</th>
                                 <th className="p-4">Cost</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {filteredLogs.map(log => (
                                 <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                     <td className="p-4 text-slate-500">{new Date(log.startTime).toLocaleString()}</td>
                                     <td className="p-4 font-bold text-slate-700">{log.callerName}</td>
                                     <td className="p-4 text-slate-600">{log.receiverName}</td>
                                     <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${log.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span></td>
                                     <td className="p-4 font-mono text-slate-600">{formatDuration(log.durationSeconds)}</td>
                                     <td className="p-4 font-bold text-slate-800">{log.cost} UGX</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
            )}

            {activeTab === 'verifications' && (
                 <div className="space-y-4">
                     <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                         <ShieldCheck className="text-indigo-600" size={24} />
                         <div>
                             <h4 className="font-bold text-indigo-900">Verification Queue</h4>
                             <p className="text-xs text-indigo-700">{pendingUsers.length} applicants waiting for review.</p>
                         </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {pendingUsers.map(user => (
                             <div key={user.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                         {user.name[0]}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-slate-800">{user.name}</h4>
                                         <p className="text-xs text-slate-500">{user.type} • {user.region}</p>
                                         <p className="text-xs text-slate-400 mt-1">{user.details}</p>
                                     </div>
                                 </div>
                                 <button onClick={() => openReviewModal(user)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700">Review</button>
                             </div>
                         ))}
                         {pendingUsers.length === 0 && (
                             <div className="col-span-full py-10 text-center text-slate-400 italic">No pending applications.</div>
                         )}
                     </div>
                 </div>
            )}

        </div>
    );
};

export default AdminDashboard;
