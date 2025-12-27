
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { Heart, Upload, Camera, FileText, CheckCircle2, ShieldCheck, ChevronRight, User as UserIcon, Loader2, Shield } from 'lucide-react';

interface AuthScreenProps {
    onLogin: (user: User) => void;
}

const ROLES: { id: UserRole; label: string; description: string; requiresLicense: boolean }[] = [
    { id: 'patient', label: 'Patient', description: 'Access health records, AI diagnostics & community.', requiresLicense: false },
    { id: 'doctor', label: 'Doctor', description: 'Manage patients, consultations & prescriptions.', requiresLicense: true },
    { id: 'diaspora', label: 'Diaspora Sponsor', description: 'Fund healthcare for family in Uganda.', requiresLicense: false },
    { id: 'vht', label: 'Village Health Team (VHT)', description: 'Community health monitoring & triage.', requiresLicense: true },
    { id: 'vendor', label: 'Pharmacy / Vendor', description: 'Sell verified medical supplies.', requiresLicense: true },
    { id: 'admin', label: 'Administrator', description: 'Platform management & oversight.', requiresLicense: false },
];

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    // Registration Step
    const [step, setStep] = useState(1);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'patient' as UserRole,
        location: '',
        age: '',
        gender: 'Male',
        licenseNumber: ''
    });

    // File Upload States
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [nationalId, setNationalId] = useState<string | null>(null);
    const [licenseDoc, setLicenseDoc] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'id' | 'license') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                if (type === 'photo') setProfilePhoto(res);
                if (type === 'id') setNationalId(res);
                if (type === 'license') setLicenseDoc(res);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockUser: User = {
                id: 'u1',
                name: 'Alex Mukasa',
                email: 'alex@example.com',
                role: 'patient',
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                location: 'Kampala, Uganda',
                district: 'Kampala',
                age: 34,
                gender: 'Male',
                subscriptionPlan: 'Pro',
                wellnessPoints: 1250,
                verificationStatus: 'Verified'
            };
            onLogin(mockUser);
            setIsLoading(false);
        }, 1500);
    };

    const handleSuperAdminLogin = () => {
        // Direct login for Super Admin - No confirmation dialog to prevent blocking
        const superUser: User = {
            id: 'super-1',
            name: 'System Owner',
            email: 'admin@eduwellness.app',
            role: 'super_admin',
            avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=000&color=fff',
            location: 'System HQ',
            verificationStatus: 'Verified',
            subscriptionPlan: 'Family'
        };
        onLogin(superUser);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const newUser: User = {
                id: Date.now().toString(),
                name: formData.name,
                email: formData.email,
                role: formData.role,
                avatar: profilePhoto || `https://ui-avatars.com/api/?name=${formData.name}`,
                location: formData.location,
                phone: formData.phone,
                age: parseInt(formData.age),
                gender: formData.gender as any,
                verificationStatus: 'Pending',
                subscriptionPlan: 'Basic',
                wellnessPoints: 0,
                nationalIdUrl: nationalId || undefined,
                licenseNumber: formData.licenseNumber,
                documents: licenseDoc ? [{ name: 'License/Cert', url: licenseDoc }] : [],
                certificateUrl: licenseDoc || undefined
            };
            onLogin(newUser);
            setIsLoading(false);
        }, 2000);
    };

    const selectedRoleData = ROLES.find(r => r.id === formData.role);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-3 bg-teal-600 rounded-2xl shadow-lg shadow-teal-200">
                        <Heart className="text-white w-8 h-8 fill-current" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">EduWellness</h1>
                </div>
                <p className="text-slate-500 font-medium">Your Integrated Health Ecosystem</p>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 size={40} className="text-teal-600 animate-spin mb-4" />
                        <p className="font-bold text-slate-600 animate-pulse">{isLogin ? 'Signing In...' : 'Creating Account...'}</p>
                    </div>
                )}

                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-4 font-bold text-sm transition-colors ${isLogin ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-4 font-bold text-sm transition-colors ${!isLogin ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Register
                    </button>
                </div>

                <div className="p-8">
                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email or Phone</label>
                                <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="user@email.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                <input required type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="••••••••" />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                                Access Dashboard
                            </button>
                            <div className="text-center space-y-4">
                                <p className="text-xs text-slate-400 cursor-pointer hover:text-teal-600">Forgot Password?</p>
                                <div className="border-t border-slate-100 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={handleSuperAdminLogin} 
                                        className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                                    >
                                        <Shield size={14} /> Login as Super Admin
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6 animate-fade-in">
                            {/* Step Indicators */}
                            <div className="flex items-center justify-between mb-6 px-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                                <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-teal-600' : 'bg-slate-100'}`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                                <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-teal-600' : 'bg-slate-100'}`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
                            </div>

                            {step === 1 && (
                                <div className="space-y-4 animate-slide-in-right">
                                    <h3 className="font-bold text-lg text-slate-800">Basic Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="Full Name" />
                                        <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="Age" />
                                    </div>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="Email Address" />
                                    <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="Phone Number" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500">
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                        <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="District/City" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-slide-in-right">
                                    <h3 className="font-bold text-lg text-slate-800">Select Account Type</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {ROLES.map(role => (
                                            <div 
                                                key={role.id}
                                                onClick={() => setFormData({...formData, role: role.id})}
                                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.role === role.id ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-bold text-sm ${formData.role === role.id ? 'text-teal-700' : 'text-slate-700'}`}>{role.label}</span>
                                                    {formData.role === role.id && <CheckCircle2 size={16} className="text-teal-600" />}
                                                </div>
                                                <p className="text-xs text-slate-500">{role.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-slide-in-right">
                                    <h3 className="font-bold text-lg text-slate-800">Verification & Credentials</h3>
                                    
                                    {/* Profile Photo */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                                                {profilePhoto ? <img src={profilePhoto} className="w-full h-full object-cover" /> : <UserIcon className="text-slate-400" size={32} />}
                                            </div>
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                                <Camera size={20} />
                                                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'photo')} />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700">Profile Photo</p>
                                            <p className="text-xs text-slate-500">Clear face photo required</p>
                                        </div>
                                    </div>

                                    {/* National ID */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">National ID / Passport</label>
                                        <label className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${nationalId ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400'}`}>
                                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFileSelect(e, 'id')} />
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                {nationalId ? <CheckCircle2 className="text-teal-500" size={20} /> : <Upload className="text-slate-400" size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">{nationalId ? 'ID Uploaded' : 'Upload Document'}</p>
                                                <p className="text-xs text-slate-500">{nationalId ? 'Ready for verification' : 'PDF or Image (Max 5MB)'}</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Role Specific Credentials */}
                                    {selectedRoleData?.requiresLicense && (
                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                                                <ShieldCheck size={16} />
                                                <span className="text-xs font-bold">Professional Verification Required</span>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License / Registration Number</label>
                                                <input type="text" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500" placeholder="LIC-XXXX-XXXX" />
                                            </div>
                                            <label className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${licenseDoc ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}>
                                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFileSelect(e, 'license')} />
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    {licenseDoc ? <CheckCircle2 className="text-indigo-500" size={20} /> : <FileText className="text-slate-400" size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-700">{licenseDoc ? 'Certificate Uploaded' : 'Upload Practicing Cert'}</p>
                                                    <p className="text-xs text-slate-500">Official document required</p>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                {step > 1 && (
                                    <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">
                                        Back
                                    </button>
                                )}
                                <button type="submit" className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                                    {step === 3 ? 'Complete Registration' : 'Continue'} <ChevronRight size={16} />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-slate-400 max-w-md">
                <p>&copy; 2024 EduWellness. By creating an account, you agree to our <a href="#" className="underline hover:text-teal-600">Terms of Service</a> and <a href="#" className="underline hover:text-teal-600">Privacy Policy</a>.</p>
            </div>
        </div>
    );
};

export default AuthScreen;
