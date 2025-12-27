
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Heart, Globe, ShieldCheck, Zap, Users, TrendingUp, DollarSign, Activity, Smartphone, Printer, CheckCircle2, Bitcoin, Building2, CreditCard, Wallet, ArrowRight, Shield, Percent } from 'lucide-react';

interface SlideProps {
    isActive: boolean;
    children: React.ReactNode;
}

const Slide: React.FC<SlideProps> = ({ isActive, children }) => (
    <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <div className="h-full w-full flex flex-col justify-center items-center p-12 text-center">
            {children}
        </div>
    </div>
);

const INVESTMENT_PACKAGES = [
    { id: 'angel', name: 'Angel Tier', amount: 5000, roi: '12%', description: 'Perfect for individual supporters looking to seed community health.', equity: '0.5%', term: '12 Months' },
    { id: 'seed', name: 'Seed Tier', amount: 25000, roi: '15%', description: 'Institutional entry for early-stage health-tech growth.', equity: '2.0%', recommended: true, term: '24 Months' },
    { id: 'growth', name: 'Growth Tier', amount: 100000, roi: '18%', description: 'High-impact strategic partnership for regional scaling.', equity: '7.5%', term: '36 Months' }
];

const PitchDeck: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [printMode, setPrintMode] = useState(false);
    
    // Investment Flow State
    const [investmentFlow, setInvestmentFlow] = useState<'none' | 'package' | 'payment' | 'success'>('none');
    const [selectedPackage, setSelectedPackage] = useState<typeof INVESTMENT_PACKAGES[0] | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'bank' | 'card' | 'crypto' | null>(null);

    const handleInvestClick = () => {
        setInvestmentFlow('package');
    };

    const handlePackageSelect = (pkg: typeof INVESTMENT_PACKAGES[0]) => {
        setSelectedPackage(pkg);
        setInvestmentFlow('payment');
    };

    const handlePaymentConfirm = () => {
        setInvestmentFlow('success');
        // This is where you would call Firebase to save the investment record
        // db.collection('investments').add({ ...selectedPackage, paymentMethod, date: new Date() });
        setTimeout(() => {
            setInvestmentFlow('none');
            onClose();
        }, 4000);
    };

    const slides = [
        // Slide 1: Title
        {
            content: (
                <>
                    <div className="mb-8 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
                        <Heart size={80} className="text-emerald-400 mx-auto mb-4" />
                        <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">EduWellness</h1>
                        <p className="text-2xl text-emerald-200 font-light">Health. Finance. Community.</p>
                    </div>
                    <p className="text-slate-400 max-w-xl text-lg mx-auto">
                        Bridging the gap between reactive healthcare and proactive wellness using <span className="text-white font-bold">Generative AI</span> and <span className="text-white font-bold">Closed-Loop Fintech</span>.
                    </p>
                </>
            ),
            bg: "from-slate-900 via-slate-900 to-emerald-950"
        },
        // Slide 2: The Problem
        {
            content: (
                <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left mx-auto">
                    <div>
                        <h2 className="text-4xl font-bold text-white mb-6">The Multi-Billion Dollar Gap</h2>
                        <div className="space-y-6">
                            <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2"><DollarSign /> The Remittance Leak</h3>
                                <p className="text-slate-300 mt-2">Diaspora send billions home for medical care, but <strong>40% is diverted</strong> to non-medical uses due to lack of transparency.</p>
                            </div>
                            <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20">
                                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2"><Activity /> The Access Crisis</h3>
                                <p className="text-slate-300 mt-2">Ratio of Doctors to Patients in Uganda is <strong>1:25,000</strong>. Rural communities rely on guesswork and self-medication.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center relative">
                        <Globe size={300} className="text-slate-800 opacity-50 absolute" />
                        <ShieldCheck size={200} className="text-white relative z-10" />
                    </div>
                </div>
            ),
            bg: "from-slate-900 to-slate-800"
        },
        // Slide 3: The Solution
        {
            content: (
                <div className="w-full max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">An Integrated Ecosystem</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <Smartphone className="text-teal-400 mb-4 mx-auto" size={40} />
                            <h3 className="text-xl font-bold text-white text-center">Patient App</h3>
                            <p className="text-sm text-slate-400 mt-2 text-center">AI Diagnostics, Health Wallet, Family History.</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <Users className="text-indigo-400 mb-4 mx-auto" size={40} />
                            <h3 className="text-xl font-bold text-white text-center">Doctor Dashboard</h3>
                            <p className="text-sm text-slate-400 mt-2 text-center">Patient Management, e-Rx, Triage Boards.</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <Globe className="text-purple-400 mb-4 mx-auto" size={40} />
                            <h3 className="text-xl font-bold text-white text-center">Diaspora Connect</h3>
                            <p className="text-sm text-slate-400 mt-2 text-center">Direct-to-Wallet remittances locked for health.</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <ShieldCheck className="text-emerald-400 mb-4 mx-auto" size={40} />
                            <h3 className="text-xl font-bold text-white text-center">VHT Network</h3>
                            <p className="text-sm text-slate-400 mt-2 text-center">Last-mile community health agents equipped with AI.</p>
                        </div>
                    </div>
                </div>
            ),
            bg: "from-indigo-950 via-slate-900 to-purple-950"
        },
        // Slide 4: Business Model
        {
            content: (
                <div className="max-w-4xl w-full mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-10 text-center">Revenue Model</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border-l-4 border-emerald-500">
                            <Zap size={32} className="text-emerald-400 flex-shrink-0" />
                            <div className="text-left flex-1">
                                <h3 className="text-xl font-bold text-white">SaaS Subscription</h3>
                                <p className="text-slate-400">Recurring revenue from "Pro" and "Family Shield" plans.</p>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">30%</div>
                        </div>
                        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border-l-4 border-indigo-500">
                            <Smartphone size={32} className="text-indigo-400 flex-shrink-0" />
                            <div className="text-left flex-1">
                                <h3 className="text-xl font-bold text-white">Tele-Consultation Fees</h3>
                                <p className="text-slate-400">Commission on video consultations connecting patients to doctors.</p>
                            </div>
                            <div className="text-2xl font-bold text-indigo-400">40%</div>
                        </div>
                        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border-l-4 border-blue-500">
                            <DollarSign size={32} className="text-blue-400 flex-shrink-0" />
                            <div className="text-left flex-1">
                                <h3 className="text-xl font-bold text-white">Marketplace & Remittance</h3>
                                <p className="text-slate-400">Commission on pharmacy sales and diaspora deposits.</p>
                            </div>
                            <div className="text-2xl font-bold text-blue-400">30%</div>
                        </div>
                    </div>
                </div>
            ),
            bg: "from-emerald-950 to-slate-900"
        },
        // Slide 5: Ask & Invest
        {
            content: (
                <div className="text-center max-w-4xl mx-auto">
                    <h2 className="text-5xl font-bold text-white mb-6">Investment Opportunity</h2>
                    <p className="text-xl text-slate-300 mb-10">We are seeking <span className="text-emerald-400 font-bold">$250,000</span> for the Gulu Pilot Phase.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {INVESTMENT_PACKAGES.map((pkg) => (
                            <div key={pkg.id} className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col ${pkg.recommended ? 'bg-white border-emerald-500 scale-105 shadow-xl' : 'bg-white/5 border-white/10 text-white'}`}>
                                {pkg.recommended && <div className="text-[10px] font-black uppercase text-emerald-600 mb-2">Most Strategic</div>}
                                <h4 className={`font-bold text-lg ${pkg.recommended ? 'text-slate-800' : 'text-white'}`}>{pkg.name}</h4>
                                <div className={`text-2xl font-black mt-1 ${pkg.recommended ? 'text-slate-900' : 'text-emerald-400'}`}>${pkg.amount.toLocaleString()}</div>
                                <div className={`flex items-center gap-2 mt-4 p-2 rounded-lg ${pkg.recommended ? 'bg-emerald-50 text-emerald-700' : 'bg-white/10 text-emerald-300'}`}>
                                    <Percent size={16} />
                                    <span className="text-sm font-bold">{pkg.roi} Annual ROI</span>
                                </div>
                                <p className={`text-xs mt-4 flex-1 ${pkg.recommended ? 'text-slate-500' : 'text-slate-400'}`}>{pkg.description}</p>
                                <button 
                                    onClick={() => handlePackageSelect(pkg)}
                                    className={`mt-6 w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${pkg.recommended ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-slate-900 hover:bg-emerald-400'}`}
                                >
                                    Select Tier <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Secured by Closed-Loop Escrow</p>
                </div>
            ),
            bg: "from-slate-900 to-indigo-950"
        }
    ];

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    const handlePrint = () => {
        setPrintMode(true);
        setTimeout(() => { window.print(); }, 500);
    };

    if (printMode) {
        return (
            <div className="min-h-screen bg-slate-900 text-white p-0 print:p-0 overflow-auto">
                <div className="fixed top-4 right-4 print:hidden flex gap-4 z-50">
                    <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow font-bold flex items-center gap-2 hover:bg-blue-700">
                        <Printer size={18} /> Print Again
                    </button>
                    <button onClick={() => setPrintMode(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300">
                        Close
                    </button>
                </div>
                <div className="space-y-0">
                    {slides.map((slide, index) => (
                        <div key={index} className="page-break-always w-full h-[100vh] flex flex-col justify-center items-center relative overflow-hidden print:h-[100vh]">
                             <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} print:bg-slate-900 -z-10`} style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}></div>
                             <div className="z-10 p-12 text-center w-full max-w-6xl mx-auto h-full flex flex-col items-center justify-center">
                                {slide.content}
                             </div>
                        </div>
                    ))}
                </div>
                <style>{`
                    @media print {
                        @page { margin: 0; size: landscape; }
                        body { -webkit-print-color-adjust: exact; background-color: #0f172a; }
                        .print\\:hidden { display: none !important; }
                        .page-break-always { break-after: page; page-break-after: always; height: 100vh !important; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col bg-gradient-to-br ${slides[currentSlide].bg} transition-colors duration-700`}>
            
            {/* Investment Overlay */}
            {investmentFlow !== 'none' && (
                <div className="absolute inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {investmentFlow === 'package' && 'Choose Your Entry Tier'}
                                    {investmentFlow === 'payment' && 'Select Secure Deposit Method'}
                                    {investmentFlow === 'success' && 'Welcome Aboard!'}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Confidential Investor Portal</p>
                            </div>
                            <button onClick={() => setInvestmentFlow('none')} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8">
                            {investmentFlow === 'package' && (
                                <div className="space-y-4">
                                    {INVESTMENT_PACKAGES.map((pkg) => (
                                        <button 
                                            key={pkg.id}
                                            onClick={() => handlePackageSelect(pkg)}
                                            className={`w-full p-6 rounded-2xl border-2 text-left transition-all group flex items-center justify-between ${
                                                pkg.recommended ? 'border-emerald-500 bg-emerald-50/50 shadow-md' : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-lg font-bold text-slate-800">{pkg.name}</h4>
                                                    {pkg.recommended && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">RECOMMENDED</span>}
                                                </div>
                                                <p className="text-sm text-slate-500 mb-3">{pkg.description}</p>
                                                <div className="flex gap-4">
                                                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Annual Return</span>
                                                        <span className="text-lg font-bold text-emerald-600">{pkg.roi}</span>
                                                    </div>
                                                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Vesting</span>
                                                        <span className="text-lg font-bold text-indigo-600">{pkg.term}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black text-slate-900">${pkg.amount.toLocaleString()}</div>
                                                <div className="mt-4 flex items-center justify-end text-emerald-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Select <ArrowRight size={16} className="ml-1" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {investmentFlow === 'payment' && selectedPackage && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center">
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Commitment</p>
                                            <h4 className="text-2xl font-bold text-emerald-400">${selectedPackage.amount.toLocaleString()}</h4>
                                            <p className="text-sm opacity-80">{selectedPackage.name} • {selectedPackage.roi} ROI</p>
                                        </div>
                                        <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                                            <TrendingUp className="text-emerald-400" size={32} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-4 text-center tracking-widest">Select Payment Channel</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { id: 'momo', icon: Smartphone, label: 'Mobile Money' },
                                                { id: 'bank', icon: Building2, label: 'Bank Transfer' },
                                                { id: 'card', icon: CreditCard, label: 'Debit/Credit' },
                                                { id: 'crypto', icon: Bitcoin, label: 'Crypto' }
                                            ].map((method) => (
                                                <button 
                                                    key={method.id}
                                                    onClick={() => setPaymentMethod(method.id as any)}
                                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === method.id ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:bg-slate-50'}`}
                                                >
                                                    <method.icon size={32} className={paymentMethod === method.id ? 'text-emerald-600' : 'text-slate-400'} />
                                                    <span className="text-xs font-bold">{method.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        disabled={!paymentMethod}
                                        onClick={handlePaymentConfirm}
                                        className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                                    >
                                        <Shield size={24} /> Confirm & Deposit
                                    </button>
                                </div>
                            )}

                            {investmentFlow === 'success' && (
                                <div className="text-center py-12 animate-fade-in">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={48} className="animate-bounce" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-800 mb-2">Intent Confirmed!</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">Your investment package has been locked. Check your email for the digital Term Sheet and KYC documentation.</p>
                                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400 font-mono uppercase">
                                        Reference ID: EDU-{Math.random().toString(36).substring(7).toUpperCase()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                <div className="text-white/50 text-sm font-bold tracking-widest uppercase">Investor Deck • Confidential</div>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-bold">
                        <Printer size={18} /> Printable Version
                    </button>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Slide Content */}
            <div className="flex-1 relative overflow-hidden">
                {slides.map((slide, index) => (
                    <Slide key={index} isActive={index === currentSlide}>
                        {slide.content}
                    </Slide>
                ))}
            </div>

            {/* Footer Navigation */}
            <div className="h-24 flex items-center justify-between px-12 z-50 bg-black/10 backdrop-blur-sm">
                <div className="flex gap-2">
                    {slides.map((_, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${idx === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                        />
                    ))}
                </div>
                
                <div className="flex gap-4">
                    <button onClick={prevSlide} disabled={currentSlide === 0} className="p-4 rounded-full border border-white/20 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="p-4 rounded-full bg-white text-slate-900 hover:bg-emerald-400 hover:scale-105 disabled:opacity-30 transition-all shadow-lg">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PitchDeck;
