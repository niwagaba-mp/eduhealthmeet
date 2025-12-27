
import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, HealthRecord, HealthSummary, RecordType, HealthCategory, 
  FamilyMember, Institution, CallLog, DiseaseProtocol, AiConfig,
  WalletTransaction, Product, Appointment, ChatMessage, UserRole
} from './types';
import Dashboard from './components/Dashboard';
import HealthRecords from './components/Transactions';
import Advisor from './components/Advisor';
import EduStories from './components/EduStories';
import FamilyHistory from './components/FamilyHistory';
import CommunityChat from './components/CommunityChat';
import Wallet from './components/Wallet';
import SubscriptionManager, { PlanType } from './components/SubscriptionManager';
import Marketplace from './components/Marketplace';
import CareFund from './components/CareFund';
import Diaspora from './components/Diaspora';
import SocialHealth from './components/SocialHealth';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import VhtDashboard from './components/VhtDashboard';
import VendorDashboard from './components/VendorDashboard';
import PitchDeck from './components/PitchDeck';
import AmbulancePanel from './components/AmbulancePanel';
import DirectChat from './components/DirectChat';
import GroupCall from './components/GroupCall';
import AuthScreen from './components/AuthScreen';
import { 
  LayoutDashboard, FileText, MessageSquare, BookOpen, Users, 
  Wallet as WalletIcon, ShoppingBag, Heart, Globe, Activity, 
  Settings, LogOut, Menu, X, Bell, User as UserIcon, Link as LinkIcon, Copy, CheckCircle2, ShieldCheck, Eye
} from 'lucide-react';

const INITIAL_RECORDS: HealthRecord[] = [
  { id: 'r1', date: '2024-05-10', type: RecordType.LAB_RESULT, title: 'Malaria Screen', value: 'Negative', category: HealthCategory.GENERAL, status: 'Normal' },
  { id: 'r2', date: '2024-05-12', type: RecordType.VITAL_SIGN, title: 'Blood Pressure', value: '120/80', unit: 'mmHg', category: HealthCategory.RESPIRATORY, status: 'Normal' },
];

const INITIAL_FAMILY: FamilyMember[] = [
    { id: 'f1', relation: 'Father', age: 65, status: 'Living', conditions: [{ name: 'Hypertension', nature: 'Acquired', severity: 'Moderate', management: 'Managed' }] }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); // Start with null to force Auth
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Super Admin State
  const [isSuperAdminSession, setIsSuperAdminSession] = useState(false);
  
  // Data States
  const [records, setRecords] = useState<HealthRecord[]>(INITIAL_RECORDS);
  const [walletBalance, setWalletBalance] = useState(150000);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([
      { id: 't1', date: '2024-05-01', type: 'Deposit', amount: 200000, description: 'MoMo Deposit', status: 'Success' }
  ]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [products, setProducts] = useState<Product[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [protocols, setProtocols] = useState<DiseaseProtocol[]>([]);
  const [aiConfig, setAiConfig] = useState<AiConfig>({ pricingModel: 'Per_Question', pricePerUnit: 500, welcomeMessage: 'Hello', isEnabled: true });

  // Overlays
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const [showAmbulance, setShowAmbulance] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeChatRecipient, setActiveChatRecipient] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);

  // Derived Summary
  const summary: HealthSummary = useMemo(() => {
    const alerts = records.filter(r => r.status === 'Attention' || r.status === 'Critical').length;
    return {
      healthScore: 82,
      nextCheckup: 'Sep 15, 2024',
      alerts,
      vitalTrends: [{ date: 'Jan', sys: 120, dia: 80, glucose: 95 }, { date: 'Feb', sys: 122, dia: 81, glucose: 96 }, { date: 'Mar', sys: 125, dia: 82, glucose: 98 }, { date: 'Apr', sys: 124, dia: 80, glucose: 97 }, { date: 'May', sys: 118, dia: 78, glucose: 92 }],
      recentRecords: [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      walletBalance
    };
  }, [records, walletBalance]);

  // Actions
  const addRecord = (r: HealthRecord) => setRecords(prev => [...prev, r]);
  const deleteRecord = (id: string) => setRecords(prev => prev.filter(r => r.id !== id));
  
  const handleDeductBalance = (amount: number) => {
      // Safety check for NaN or invalid amounts
      if (isNaN(amount) || amount <= 0) return;
      setWalletBalance(prev => Math.max(0, prev - amount));
      setTransactions(prev => [{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], type: 'Call_Deduction', amount, description: 'Service Fee', status: 'Success' }, ...prev]);
  };

  const handleDeposit = (amount: number) => {
      if (isNaN(amount) || amount <= 0) return;
      setWalletBalance(prev => prev + amount);
      setTransactions(prev => [{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], type: 'Deposit', amount, description: 'Wallet Top-up', status: 'Success' }, ...prev]);
  };

  const handleTransfer = (amount: number, recipient: string) => {
      if (isNaN(amount) || amount <= 0) return;
      if(walletBalance >= amount) {
          setWalletBalance(prev => prev - amount);
          setTransactions(prev => [{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], type: 'Transfer_Out', amount, description: `Transfer to ${recipient}`, status: 'Success' }, ...prev]);
      }
  };

  const handleUpdatePlan = (plan: PlanType, cost: number) => {
      if(walletBalance >= cost) {
          setWalletBalance(prev => prev - cost);
          if (user) setUser({ ...user, subscriptionPlan: plan });
          setTransactions(prev => [{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], type: 'Subscription', amount: cost, description: `${plan} Plan Subscription`, status: 'Success' }, ...prev]);
      }
  };

  // Persist User State in LocalStorage (Simulation)
  useEffect(() => {
      const savedUser = localStorage.getItem('eduwellness_user');
      const savedSuper = localStorage.getItem('eduwellness_super_admin');
      if (savedUser) {
          try {
              setUser(JSON.parse(savedUser));
              if(savedSuper === 'true') setIsSuperAdminSession(true);
          } catch (e) {
              console.error("Failed to restore user session");
          }
      }
  }, []);

  const handleLogin = (userData: User) => {
      setUser(userData);
      localStorage.setItem('eduwellness_user', JSON.stringify(userData));
      
      // Check for Super Admin
      if (userData.role === 'super_admin') {
          setIsSuperAdminSession(true);
          localStorage.setItem('eduwellness_super_admin', 'true');
          setActiveView('overview'); // Admin View default
      } else {
          setIsSuperAdminSession(false);
          localStorage.removeItem('eduwellness_super_admin');
          // Route based on role
          if (userData.role === 'doctor') setActiveView('patients');
          else if (userData.role === 'admin') setActiveView('overview');
          else if (userData.role === 'vht') setActiveView('community');
          else setActiveView('dashboard');
      }
  };

  const handleLogout = () => {
      setUser(null);
      setIsSuperAdminSession(false);
      localStorage.removeItem('eduwellness_user');
      localStorage.removeItem('eduwellness_super_admin');
      setActiveView('dashboard');
  };

  // Role Switching for Super Admin
  const handleRoleSwitch = (newRole: UserRole) => {
      if (!user) return;
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      // Reset view to default for that role
      if (newRole === 'doctor') setActiveView('patients');
      else if (newRole === 'admin' || newRole === 'super_admin') setActiveView('overview');
      else if (newRole === 'vht') setActiveView('community');
      else setActiveView('dashboard');
  };

  // Render Logic
  const renderContent = () => {
    if (!user) return null; // Should be handled by AuthScreen logic

    if (activeChatRecipient) {
        return <DirectChat currentUser={user} recipient={activeChatRecipient} onBack={() => setActiveChatRecipient(null)} onEmergency={() => setShowAmbulance(true)} />;
    }

    if (user.role === 'doctor') {
        return <DoctorDashboard 
            user={user} 
            patientRecords={records} 
            onNavigate={setActiveView} 
            walletBalance={walletBalance} 
            callLogs={callLogs} 
            protocols={protocols} 
            onUpdateProtocols={setProtocols} 
            aiConfig={aiConfig} 
            onUpdateAiConfig={setAiConfig} 
            onStartVideoCall={(name) => setActiveCall({ title: name, participants: [name] })} 
        />;
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
        return <AdminDashboard 
            institutions={institutions} 
            callLogs={callLogs} 
            onAddInstitution={(i) => setInstitutions([...institutions, i])} 
            onUpdateInstitution={(id, updates) => setInstitutions(institutions.map(i => i.id === id ? { ...i, ...updates } : i))} 
            onOpenPitchDeck={() => setShowPitchDeck(true)}
            onImpersonate={handleLogin}
        />;
    }

    if (user.role === 'vht') {
        return <VhtDashboard user={user} onChat={setActiveChatRecipient} onEmergency={() => setShowAmbulance(true)} onNavigate={setActiveView} />;
    }

    if (user.role === 'vendor') {
        return <VendorDashboard user={user} products={products} onAddProduct={(p) => setProducts([...products, p])} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} />;
    }

    if (user.role === 'diaspora') {
        return <Diaspora walletBalance={walletBalance} onTopUp={(amt) => handleDeductBalance(amt)} onDeposit={handleDeposit} />;
    }

    // Patient Views
    switch(activeView) {
        case 'dashboard': return <Dashboard summary={summary} onJoinCall={() => setActiveCall({ title: 'Dr. Samuel K.', participants: ['Dr. Samuel'] })} />;
        case 'records': return <HealthRecords records={records} onAddRecord={addRecord} onDeleteRecord={deleteRecord} />;
        case 'advisor': return <Advisor summary={summary} onDeductBalance={handleDeductBalance} onCallComplete={(log) => setCallLogs([...callLogs, log])} user={user} protocols={protocols} aiConfig={aiConfig} familyHistory={familyMembers} onTriggerAmbulance={() => setShowAmbulance(true)} onAddRecord={addRecord} />;
        case 'stories': return <EduStories />;
        case 'family': return <FamilyHistory members={familyMembers} onUpdateMembers={setFamilyMembers} />;
        case 'community': return <CommunityChat user={user} />;
        case 'wallet': return <Wallet user={user} balance={walletBalance} transactions={transactions} onDeposit={handleDeposit} onTransfer={handleTransfer} onNavigateBack={() => setActiveView('dashboard')} />;
        case 'subscription': return <SubscriptionManager currentPlan={user.subscriptionPlan as PlanType} walletBalance={walletBalance} onUpdatePlan={handleUpdatePlan} onNavigateWallet={() => setActiveView('wallet')} />;
        case 'marketplace': return <Marketplace products={products} onPurchase={(amount, item) => handleDeductBalance(amount)} />; 
        case 'carefund': return <CareFund onDonate={(amount) => { handleDeductBalance(amount); return true; }} />;
        case 'social': return <SocialHealth user={user} onChat={setActiveChatRecipient} />;
        default: return <Dashboard summary={summary} />;
    }
  };

  const PATIENT_NAV_ITEMS = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'advisor', label: 'Dr. Wise AI', icon: MessageSquare },
      { id: 'records', label: 'My Records', icon: FileText },
      { id: 'stories', label: 'Learn', icon: BookOpen },
      { id: 'family', label: 'Family Tree', icon: Users },
      { id: 'community', label: 'Community', icon: Globe },
      { id: 'marketplace', label: 'Pharmacy', icon: ShoppingBag },
      { id: 'carefund', label: 'CareFund', icon: Heart },
      { id: 'social', label: 'Village', icon: Activity },
      { id: 'wallet', label: 'Wallet', icon: WalletIcon },
      { id: 'subscription', label: 'Plans', icon: Settings },
  ];

  const NAV_ITEMS = user?.role === 'patient' ? PATIENT_NAV_ITEMS : [];

  // --- MAIN APP RENDER ---
  if (!user) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-20 flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
               <Heart className="text-teal-600 fill-teal-600" /> EduWellness
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
                {isSidebarOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 h-full flex flex-col">
                <div className="text-2xl font-bold text-white flex items-center gap-2 mb-8 hidden lg:flex">
                    <Heart className="text-teal-500 fill-teal-500" /> EduWellness
                </div>

                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-800 rounded-xl">
                    <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-teal-500 object-cover" alt="User" />
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-white truncate">{user.name}</h4>
                        <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
                    {/* Patient Navigation */}
                    {user.role === 'patient' && NAV_ITEMS.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === item.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' : 'hover:bg-slate-800'}`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}

                    {/* Diaspora Specific Sidebar Content - Simplified as main view controls everything */}
                    {user.role === 'diaspora' && (
                        <div className="p-4 bg-slate-800 rounded-xl text-center">
                            <Globe size={32} className="mx-auto text-indigo-400 mb-2" />
                            <p className="text-sm font-bold text-white">Diaspora Portal</p>
                            <p className="text-xs text-slate-400 mb-4">Managing 2 Beneficiaries</p>
                            <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg">Add Funds</button>
                        </div>
                    )}
                </nav>

                {/* Patient Invite Feature */}
                {user.role === 'patient' && (
                    <div className="mt-4 mb-4">
                        <button 
                            onClick={() => setShowInviteModal(true)}
                            className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20"
                        >
                            <Globe size={18} />
                            <span className="font-bold text-sm">Invite Sponsor</span>
                        </button>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
                     {/* SUPER ADMIN ROLE SWITCHER */}
                     {isSuperAdminSession && (
                         <div className="p-3 bg-indigo-900/30 rounded-xl border border-indigo-500/30">
                             <p className="text-xs font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1">
                                 <ShieldCheck size={12} /> System View
                             </p>
                             <div className="relative">
                                 <select
                                     value={user.role}
                                     onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
                                     className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-lg border border-slate-700 outline-none appearance-none cursor-pointer hover:bg-slate-900 transition-colors"
                                 >
                                     <option value="super_admin">Super Admin</option>
                                     <option value="admin">System Admin</option>
                                     <option value="patient">Patient View</option>
                                     <option value="doctor">Doctor View</option>
                                     <option value="vht">VHT View</option>
                                     <option value="vendor">Vendor View</option>
                                     <option value="diaspora">Diaspora View</option>
                                 </select>
                                 <Eye size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                             </div>
                         </div>
                     )}

                     <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-sm">
                         <LogOut size={16} /> Logout
                     </button>
                </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative flex flex-col pt-16 lg:pt-0">
            {/* Desktop Header */}
            {user.role !== 'diaspora' && (
                <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 capitalize">{activeView.replace('_', ' ')}</h2>
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 flex items-center gap-2">
                            <WalletIcon size={14} className="text-slate-400" />
                            {walletBalance.toLocaleString()} UGX
                        </div>
                        <button onClick={() => setShowAmbulance(true)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-colors animate-pulse">
                            <Activity size={14} /> SOS
                        </button>
                        <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                    </div>
                </div>
            )}

            <div className={`flex-1 overflow-y-auto p-4 lg:p-8 ${user.role === 'diaspora' ? 'bg-slate-900' : 'bg-slate-50/50'}`}>
                {renderContent()}
            </div>
        </main>

        {/* Invite Diaspora Modal */}
        {showInviteModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 animate-scale-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Globe className="text-indigo-600" /> Invite Sponsor
                        </h3>
                        <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-6">
                        Invite friends or family in the diaspora to connect with your account. They can fund your health wallet directly and track your progress.
                    </p>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                        <p className="text-xs font-bold text-indigo-800 uppercase mb-2">Your Unique Invite Link</p>
                        <div className="flex items-center gap-2 bg-white px-3 py-3 rounded-lg border border-indigo-200">
                            <LinkIcon size={16} className="text-slate-400 flex-shrink-0" />
                            <input 
                                type="text" 
                                readOnly 
                                value={`https://eduwellness.app/invite/s/${user.id}`} 
                                className="flex-1 text-sm text-slate-600 outline-none bg-transparent font-mono"
                            />
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://eduwellness.app/invite/s/${user.id}`);
                                    alert("Link copied!");
                                }}
                                className="text-indigo-600 hover:text-indigo-800"
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase">Or Send via Email</p>
                        <input type="email" placeholder="sponsor@email.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors">
                            Send Invitation
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Global Overlays */}
        {showPitchDeck && <PitchDeck onClose={() => setShowPitchDeck(false)} />}
        {showAmbulance && <AmbulancePanel userLocation={user.location || 'Kampala'} onClose={() => setShowAmbulance(false)} />}
        {activeCall && <GroupCall title={activeCall.title} participants={activeCall.participants} type="patient" onEndCall={() => setActiveCall(null)} />}
    </div>
  );
};

export default App;
