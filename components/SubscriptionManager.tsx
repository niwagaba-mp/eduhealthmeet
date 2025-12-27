
import React, { useState } from 'react';
import { CheckCircle2, Shield, Zap, Users, Star, X } from 'lucide-react';

export type PlanType = 'Basic' | 'Pro' | 'Family';

interface SubscriptionManagerProps {
  currentPlan: PlanType;
  walletBalance: number;
  onUpdatePlan: (plan: PlanType, cost: number) => void;
  onNavigateWallet: () => void;
}

const PLANS = [
  {
    id: 'Basic',
    name: 'Basic Access',
    price: 0,
    period: 'Forever',
    description: 'Essential health tracking and community access.',
    features: [
      'Digital Health Records',
      'Community Forum Access',
      'Basic Symptom Checker',
      '3 Month History Retention'
    ],
    color: 'slate',
    icon: <Shield className="w-6 h-6" />
  },
  {
    id: 'Pro',
    name: 'EduWellness Pro',
    price: 25000,
    period: '/ month',
    description: 'Advanced AI diagnostics and personalized care.',
    features: [
      'Unlimited AI Doctor Consults',
      'Genetic Risk Profiling',
      'Priority Laboratory Queuing',
      'Full History Retention',
      'Medical Report Analysis (OCR)'
    ],
    color: 'teal',
    recommended: true,
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'Family',
    name: 'Family Shield',
    price: 60000,
    period: '/ month',
    description: 'Complete protection for up to 5 family members.',
    features: [
      'All Pro Features',
      'Up to 5 Family Profiles',
      'Pediatric Health Alerts',
      'Dedicated Case Manager',
      'Home Sample Collection Discounts'
    ],
    color: 'indigo',
    icon: <Users className="w-6 h-6" />
  }
];

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ currentPlan, walletBalance, onUpdatePlan, onNavigateWallet }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    if (plan.id === currentPlan) return;

    if (plan.price > walletBalance && plan.price > 0) {
      alert("Insufficient wallet balance. Please top up first.");
      onNavigateWallet();
      return;
    }

    if (confirm(`Are you sure you want to switch to the ${plan.name}? ${plan.price > 0 ? `This will cost ${plan.price.toLocaleString()} UGX.` : ''}`)) {
      setLoading(plan.id);
      setTimeout(() => {
        onUpdatePlan(plan.id as PlanType, plan.price);
        setLoading(null);
        alert(`Successfully subscribed to ${plan.name}!`);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Choose Your Health Plan</h2>
        <p className="text-slate-500 text-lg">
          Unlock proactive diagnostics, AI consultations, and family protection with our flexible subscription tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isProcessing = loading === plan.id;

          return (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-2xl transition-all duration-300 flex flex-col ${
                plan.recommended 
                  ? 'border-2 border-teal-500 shadow-xl scale-105 z-10' 
                  : 'border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="p-8 border-b border-slate-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                  plan.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                <p className="text-slate-500 text-sm mt-1 min-h-[40px]">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price.toLocaleString()}</span>
                  <span className="text-sm font-bold text-slate-400">UGX {plan.period}</span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle2 size={18} className={`flex-shrink-0 mt-0.5 ${
                        plan.color === 'teal' ? 'text-teal-500' :
                        plan.color === 'indigo' ? 'text-indigo-500' : 'text-slate-400'
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent || isProcessing}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-500 cursor-default'
                      : plan.color === 'teal'
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200'
                        : plan.color === 'indigo'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                          : 'bg-slate-800 text-white hover:bg-slate-900'
                  }`}
                >
                  {isProcessing ? 'Processing...' : isCurrent ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto mt-12 bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
                <Star className="text-yellow-500 fill-current" />
            </div>
            <div>
                <h4 className="font-bold text-indigo-900">Need a Corporate Plan?</h4>
                <p className="text-sm text-indigo-700">Get tailored wellness packages for your employees.</p>
            </div>
         </div>
         <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50">
             Contact Sales
         </button>
      </div>
    </div>
  );
};

export default SubscriptionManager;
