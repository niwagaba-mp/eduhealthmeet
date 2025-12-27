
import React, { useState } from 'react';
import { Beneficiary } from '../types';
import { Users, Plus, HeartPulse, Wallet, ShieldCheck, Activity, Send, X, Phone, MapPin, CreditCard, Globe, ArrowDownLeft, Building2, Smartphone } from 'lucide-react';

interface DiasporaProps {
    walletBalance: number;
    onTopUp: (amount: number, beneficiaryId: string) => void;
    onDeposit: (amount: number) => void;
}

const MOCK_BENEFICIARIES: Beneficiary[] = [
    {
        id: 'b1', name: 'Mama Joyce', relation: 'Parent', location: 'Jinja, Uganda', phone: '+256 772 123456',
        avatar: 'https://randomuser.me/api/portraits/women/66.jpg', healthPlan: 'Pro', healthWalletBalance: 150000,
        lastCheckup: '2024-05-01', status: 'Healthy'
    },
    {
        id: 'b2', name: 'Uncle Ben', relation: 'Sibling', location: 'Kampala, Uganda', phone: '+256 701 987654',
        avatar: 'https://randomuser.me/api/portraits/men/42.jpg', healthPlan: 'Basic', healthWalletBalance: 25000,
        lastCheckup: '2024-04-15', status: 'Attention', pendingPrescriptions: 2
    }
];

const Diaspora: React.FC<DiasporaProps> = ({ walletBalance, onTopUp, onDeposit }) => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(MOCK_BENEFICIARIES);
    const [isAdding, setIsAdding] = useState(false);
    
    // Modal States
    const [showTopUpModal, setShowTopUpModal] = useState<string | null>(null);
    const [showDepositModal, setShowDepositModal] = useState(false);
    
    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'bank'>('card');

    // Input States
    const [topUpAmount, setTopUpAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    
    // Deposit Details State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [momoProvider, setMomoProvider] = useState('WorldRemit');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [bankName, setBankName] = useState('Stanbic');
    const [accountNumber, setAccountNumber] = useState('');
    const [swiftCode, setSwiftCode] = useState('');

    // New Beneficiary State
    const [newName, setNewName] = useState('');
    const [newRelation, setNewRelation] = useState('Parent');
    const [newPhone, setNewPhone] = useState('');

    const handleAddBeneficiary = (e: React.FormEvent) => {
        e.preventDefault();
        const newBen: Beneficiary = {
            id: Date.now().toString(),
            name: newName,
            relation: newRelation as any,
            location: 'Uganda',
            phone: newPhone,
            avatar: `https://ui-avatars.com/api/?name=${newName}&background=random`,
            healthPlan: 'Basic',
            healthWalletBalance: 0,
            lastCheckup: 'Never',
            status: 'Healthy'
        };
        setBeneficiaries([...beneficiaries, newBen]);
        setIsAdding(false);
        setNewName('');
        setNewPhone('');
    };

    const handleDeposit = () => {
        if (!depositAmount) return;
        
        // Mock Validation
        if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
            alert("Please enter valid card details.");
            return;
        }
        if (paymentMethod === 'bank' && (!accountNumber || !swiftCode)) {
            alert("Please enter valid bank details.");
            return;
        }
        if (paymentMethod === 'momo' && !phoneNumber) {
            alert("Please enter a valid phone number.");
            return;
        }

        const amount = parseInt(depositAmount);
        onDeposit(amount);
        setShowDepositModal(false);
        setDepositAmount('');
        // Reset fields
        setCardNumber(''); setCardExpiry(''); setCardCvv('');
        setAccountNumber(''); setSwiftCode('');
        setPhoneNumber('');
        
        alert(`Deposit of ${amount.toLocaleString()} UGX via ${paymentMethod.toUpperCase()} Successful!`);
    };

    const handleTopUp = () => {
        if (!topUpAmount || !showTopUpModal) return;
        const amount = parseInt(topUpAmount);
        
        if(amount > walletBalance) {
            alert("Insufficient funds in your main wallet. Please deposit first.");
            return;
        }

        onTopUp(amount, showTopUpModal);
        
        // Update local state for immediate feedback
        setBeneficiaries(prev => prev.map(b => 
            b.id === showTopUpModal ? { ...b, healthWalletBalance: b.healthWalletBalance + amount } : b
        ));
        
        setShowTopUpModal(null);
        setTopUpAmount('');
        alert("Health Wallet Top-up Successful! Funds are locked for medical use only.");
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 relative">
            
            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Deposit Funds</h3>
                            <button onClick={() => setShowDepositModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <button 
                                onClick={() => setPaymentMethod('momo')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'momo' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                                <Smartphone size={20} />
                                <span className="text-[10px] font-bold">Mobile Money</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('card')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                                <CreditCard size={20} />
                                <span className="text-[10px] font-bold">Card</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('bank')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'bank' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                                <Building2 size={20} />
                                <span className="text-[10px] font-bold">Bank</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Mobile Money Form */}
                            {paymentMethod === 'momo' && (
                                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provider</label>
                                        <select 
                                            value={momoProvider} 
                                            onChange={(e) => setMomoProvider(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        >
                                            <option>WorldRemit</option>
                                            <option>Remitly</option>
                                            <option>MTN MoMo (Direct)</option>
                                            <option>Airtel Money (Direct)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                                        <input 
                                            type="text" 
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="+256..."
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Card Form */}
                            {paymentMethod === 'card' && (
                                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Number</label>
                                        <input 
                                            type="text" 
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-mono"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry</label>
                                            <input 
                                                type="text" 
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(e.target.value)}
                                                placeholder="MM/YY" 
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVV</label>
                                            <input 
                                                type="text" 
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value)}
                                                placeholder="123" 
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bank Form */}
                            {paymentMethod === 'bank' && (
                                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Name</label>
                                        <select 
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        >
                                            <option>Stanbic Bank</option>
                                            <option>Centenary Bank</option>
                                            <option>Equity Bank</option>
                                            <option>Absa</option>
                                            <option>Standard Chartered</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number</label>
                                        <input 
                                            type="text" 
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder="Enter account number"
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SWIFT Code</label>
                                        <input 
                                            type="text" 
                                            value={swiftCode}
                                            onChange={(e) => setSwiftCode(e.target.value)}
                                            placeholder="STANUGKKA"
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (UGX Equivalent)</label>
                                <input 
                                    type="number" 
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    placeholder="e.g. 500000"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <button 
                                onClick={handleDeposit}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                            >
                                Confirm Deposit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Up Modal */}
            {showTopUpModal && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Transfer to Health Wallet</h3>
                            <button onClick={() => setShowTopUpModal(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Sending funds to <span className="font-bold text-slate-700">{beneficiaries.find(b => b.id === showTopUpModal)?.name}</span>. 
                            These funds are <strong className="text-indigo-600">locked</strong> for medical services only.
                        </p>
                        <input 
                            type="number" 
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            placeholder="Amount (UGX)"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                         <div className="text-xs text-slate-500 mb-4 flex justify-between">
                            <span>Available Balance:</span>
                            <span className="font-bold">{walletBalance.toLocaleString()} UGX</span>
                        </div>
                        <button 
                            onClick={handleTopUp}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700"
                        >
                            Confirm Transfer
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-md">
                                    <HeartPulse size={24} className="text-indigo-300" />
                                </div>
                                <h2 className="text-3xl font-bold">Diaspora Connect</h2>
                            </div>
                            <p className="text-slate-300 max-w-md text-sm">
                                Care for your loved ones back home. Manage their health plans and ensure funds are used strictly for healthcare.
                            </p>
                        </div>
                        
                        {/* Global Wallet Card */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[280px]">
                            <div className="flex items-center gap-2 text-indigo-200 mb-1">
                                <Wallet size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Your Global Balance</span>
                            </div>
                            <div className="text-3xl font-bold font-mono mb-3">{walletBalance.toLocaleString()} <span className="text-sm text-slate-400">UGX</span></div>
                            <button 
                                onClick={() => setShowDepositModal(true)}
                                className="w-full py-2 bg-white text-indigo-900 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowDownLeft size={14} /> Deposit Funds
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">My Beneficiaries</h3>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold shadow-sm hover:bg-teal-700 flex items-center gap-2"
                >
                    <Plus size={18} /> Add Relative
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-slide-in-down">
                    <h4 className="font-bold text-slate-800 mb-4">New Beneficiary Details</h4>
                    <form onSubmit={handleAddBeneficiary} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                             <select 
                                value={newRelation} 
                                onChange={e => setNewRelation(e.target.value)}
                                className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option>Parent</option>
                                <option>Child</option>
                                <option>Sibling</option>
                                <option>Spouse</option>
                                <option>Friend</option>
                            </select>
                            <input 
                                type="text" 
                                placeholder="Phone Number" 
                                value={newPhone}
                                onChange={e => setNewPhone(e.target.value)}
                                className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold">Save</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {beneficiaries.map(ben => (
                    <div key={ben.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                        <div className="p-6 border-b border-slate-50 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ben.avatar} alt={ben.name} className="w-16 h-16 rounded-full border-4 border-slate-50" />
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800">{ben.name}</h4>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <Users size={12} /> {ben.relation} • {ben.location}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ben.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {ben.status}
                                        </span>
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
                                            {ben.healthPlan} Plan
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-xl text-center min-w-[100px]">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Health Wallet</p>
                                <p className="text-lg font-bold text-indigo-700">{ben.healthWalletBalance.toLocaleString()}</p>
                                <p className="text-[10px] text-indigo-400">UGX</p>
                            </div>
                        </div>
                        
                        <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50/50">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Activity size={16} className="text-slate-400" />
                                    <span>Last Checkup: <strong>{ben.lastCheckup}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone size={16} className="text-slate-400" />
                                    <span>{ben.phone}</span>
                                </div>
                                {ben.pendingPrescriptions && (
                                    <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                                        <ShieldCheck size={16} />
                                        <span>{ben.pendingPrescriptions} Pending Prescriptions</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 justify-center">
                                <button 
                                    onClick={() => setShowTopUpModal(ben.id)}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <Wallet size={16} /> Add Funds
                                </button>
                                <button className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">
                                    View Records
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Diaspora;
