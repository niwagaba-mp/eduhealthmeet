

import React, { useState } from 'react';
import { User, WalletTransaction } from '../types';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, History, Plus, Smartphone, Send, CheckCircle2, Building2, CreditCard as CardIcon, XCircle } from 'lucide-react';

interface WalletProps {
    user: User;
    balance: number;
    transactions: WalletTransaction[];
    onDeposit: (amount: number) => void;
    onTransfer: (amount: number, recipient: string) => void;
    onNavigateBack: () => void;
}

const Wallet: React.FC<WalletProps> = ({ user, balance, transactions, onDeposit, onTransfer, onNavigateBack }) => {
    const [activeTab, setActiveTab] = useState<'deposit' | 'transfer'>('deposit');
    const [depositMethod, setDepositMethod] = useState<'momo' | 'card' | 'bank'>('momo');
    
    // Form States
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [provider, setProvider] = useState<'MTN' | 'Airtel'>('MTN');
    const [bankName, setBankName] = useState('Stanbic');
    const [accountNumber, setAccountNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    
    // Transfer States
    const [recipientId, setRecipientId] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;
        setProcessing(true);
        
        setTimeout(() => {
            const val = parseInt(amount);
            onDeposit(val);
            setAmount('');
            setCardNumber('');
            setAccountNumber('');
            setProcessing(false);
        }, 1500);
    };

    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !recipientId) return;
        setProcessing(true);
        setTimeout(() => {
            const val = parseInt(amount);
            onTransfer(val, recipientId);
            setAmount('');
            setRecipientId('');
            setProcessing(false);
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-slate-300">
                                <WalletIcon size={20} />
                                <span className="text-sm font-bold uppercase tracking-wider">Total Balance</span>
                            </div>
                            <h2 className="text-4xl font-bold font-mono tracking-tight">{balance.toLocaleString()} <span className="text-lg text-slate-400">UGX</span></h2>
                            <p className="text-xs text-slate-400 mt-2">Account: {user.name} ({user.role})</p>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                            <CreditCard size={32} className="text-white opacity-80" />
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500 rounded-full opacity-10 blur-3xl"></div>
                    <div className="absolute top-10 left-1/2 w-20 h-20 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center gap-4">
                     <button 
                        onClick={() => onNavigateBack()}
                        className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                     >
                         ← Back to Dashboard
                     </button>
                     <div className="flex gap-2 text-xs text-slate-400 justify-center">
                         <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Secure</span>
                         <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Instant</span>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actions Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                        <button 
                            onClick={() => setActiveTab('deposit')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'deposit' ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <ArrowDownLeft size={18} /> Deposit Funds
                        </button>
                        <button 
                            onClick={() => setActiveTab('transfer')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'transfer' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <ArrowUpRight size={18} /> Transfer / Pay
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'deposit' ? (
                            <div className="space-y-6 animate-fade-in">
                                {/* Deposit Method Selector */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <button 
                                        onClick={() => setDepositMethod('momo')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${depositMethod === 'momo' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <Smartphone size={24} />
                                        <span className="text-xs font-bold">Mobile Money</span>
                                    </button>
                                    <button 
                                        onClick={() => setDepositMethod('card')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${depositMethod === 'card' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <CardIcon size={24} />
                                        <span className="text-xs font-bold">Card</span>
                                    </button>
                                    <button 
                                        onClick={() => setDepositMethod('bank')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${depositMethod === 'bank' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <Building2 size={24} />
                                        <span className="text-xs font-bold">Bank</span>
                                    </button>
                                </div>

                                <form onSubmit={handleDeposit} className="space-y-6">
                                    {depositMethod === 'momo' && (
                                        <div className="space-y-2 animate-fade-in">
                                            <label className="text-sm font-bold text-slate-700">Select Provider</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setProvider('MTN')}
                                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${provider === 'MTN' ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100 hover:border-slate-200'}`}
                                                >
                                                    <span className="font-bold text-slate-800">MTN MoMo</span>
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setProvider('Airtel')}
                                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${provider === 'Airtel' ? 'border-red-400 bg-red-50' : 'border-slate-100 hover:border-slate-200'}`}
                                                >
                                                    <span className="font-bold text-slate-800">Airtel Money</span>
                                                </button>
                                            </div>
                                            <div className="mt-4">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="077..." 
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {depositMethod === 'card' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Card Number</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="0000 0000 0000 0000" 
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(e.target.value)}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Expiry</label>
                                                    <input type="text" placeholder="MM/YY" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                                                    <input type="text" placeholder="123" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {depositMethod === 'bank' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Select Bank</label>
                                                <select 
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                >
                                                    <option>Stanbic Bank</option>
                                                    <option>Centenary Bank</option>
                                                    <option>Equity Bank</option>
                                                    <option>Absa</option>
                                                    <option>DFCU</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Account Number</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter account number" 
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value)}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Amount (UGX)</label>
                                        <input 
                                            type="number" 
                                            placeholder="50000" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={processing || !amount}
                                        className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : `Deposit ${amount ? parseInt(amount).toLocaleString() : ''} UGX`}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <form onSubmit={handleTransfer} className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Recipient ID or Email</label>
                                    <input 
                                        type="text" 
                                        placeholder="Doctor ID, Clinic Name, or Email" 
                                        value={recipientId}
                                        onChange={(e) => setRecipientId(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Amount (UGX)</label>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
                                    <p>Note: Transfers to verified Doctors and Clinics are instant. A standard fee of 500 UGX applies to external transfers.</p>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={processing || !amount || !recipientId}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? 'Sending...' : <><Send size={18} /> Send Funds</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* History Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                        <History size={18} className="text-slate-400" />
                        <h3 className="font-bold text-slate-700">Transaction History</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex flex-col p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            tx.status === 'Failed' ? 'bg-red-100 text-red-600' :
                                            tx.type === 'Deposit' ? 'bg-green-100 text-green-600' : 
                                            tx.type.includes('Transfer') ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'
                                        }`}>
                                            {tx.status === 'Failed' ? <XCircle size={18} /> :
                                             tx.type === 'Deposit' ? <ArrowDownLeft size={18} /> : 
                                             tx.type.includes('Transfer') ? <ArrowUpRight size={18} /> : <CreditCard size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{tx.description}</p>
                                            <p className="text-[10px] text-slate-400">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold text-sm ${tx.status === 'Failed' ? 'text-slate-400 line-through' : tx.type === 'Deposit' ? 'text-green-600' : 'text-slate-800'}`}>
                                        {tx.type === 'Deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                                    </div>
                                </div>
                                {tx.status === 'Failed' && (
                                    <div className="ml-12 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded w-fit flex items-center gap-1">
                                        <XCircle size={10} /> {tx.failureReason || 'Failed'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;