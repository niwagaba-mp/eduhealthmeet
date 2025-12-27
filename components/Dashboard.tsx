
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { HealthSummary, RecordType } from '../types';
import { Activity, HeartPulse, Calendar, AlertTriangle, Droplet, ShieldCheck, Video, Clock } from 'lucide-react';

interface DashboardProps {
  summary: HealthSummary;
  onJoinCall?: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; subtext: string; icon: React.ReactElement; color: string }> = ({ title, value, subtext, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.02]">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
    <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` })}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ summary, onJoinCall }) => {
  
  const riskData = [
      { name: 'Liver', value: 92, color: '#10b981' }, // Green
      { name: 'Kidney', value: 88, color: '#10b981' },
      { name: 'Metabolic', value: 65, color: '#f59e0b' }, // Amber - Diabetes risk?
      { name: 'Respiratory', value: 95, color: '#10b981' },
      { name: 'Cancer Risk', value: 98, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Upcoming Consultation Card (Simulated) */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
             <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                 <Video size={32} className="text-white" />
             </div>
             <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider">Starting Soon</span>
                    <span className="flex items-center gap-1 text-xs opacity-80"><Clock size={12}/> 10:00 AM</span>
                 </div>
                 <h3 className="text-xl font-bold">Consultation with Dr. Samuel K.</h3>
                 <p className="text-indigo-100 text-sm">Monthly Review & Prescription Renewal</p>
             </div>
         </div>
         <button 
            onClick={onJoinCall}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20 flex items-center gap-2"
         >
             <Video size={18} /> Join Video Room
         </button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="EduWellness Score" 
          value={summary.healthScore} 
          subtext="Consolidated Bio-marker Score"
          icon={<ShieldCheck />} 
          color="bg-teal-500 text-teal-500"
        />
        <StatCard 
          title="Next Diagnostic" 
          value={summary.nextCheckup} 
          subtext="Bi-annual Cynosure Panel"
          icon={<Calendar />} 
          color="bg-blue-500 text-blue-500"
        />
        <StatCard 
          title="Active Alerts" 
          value={summary.alerts} 
          subtext="Requires Doctor Attention"
          icon={<AlertTriangle />} 
          color="bg-amber-500 text-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vital Signs Trends */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-lg font-semibold text-slate-800">Metabolic Health</h3>
                <p className="text-xs text-slate-400">Fasting Blood Sugar & BP Trends</p>
             </div>
             <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Last 6 Months</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.vitalTrends}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="glucose" stroke="#0d9488" fillOpacity={1} fill="url(#colorGlucose)" name="Glucose (mg/dL)" />
                <Area type="monotone" dataKey="sys" stroke="#ef4444" fill="none" name="BP Systolic" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Assessment Overview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
             <h3 className="text-lg font-semibold text-slate-800">Organ Function & Risk</h3>
             <p className="text-xs text-slate-400">Score out of 100 (Higher is Better)</p>
          </div>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={90} tickLine={false} axisLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0] as any} background={{ fill: '#f1f5f9', radius: [0, 4, 4, 0] as any }}>
                    {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-slate-400">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Optimal</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Attention</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
          </div>
        </div>
      </div>

      {/* Recent Records List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Latest Clinical Reports</h3>
            <button className="text-sm text-teal-600 font-medium hover:underline">Full History</button>
          </div>
          <div className="space-y-3">
            {summary.recentRecords.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      rec.type === RecordType.LAB_RESULT ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {rec.type === RecordType.LAB_RESULT ? <Droplet size={18} /> : <HeartPulse size={18} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{rec.title}</p>
                      <p className="text-xs text-slate-500">{rec.date} • {rec.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                      <span className="font-semibold text-slate-800 block">{rec.value} <span className="text-xs text-slate-500">{rec.unit}</span></span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          rec.status === 'Normal' ? 'bg-green-100 text-green-700' : 
                          rec.status === 'Attention' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>{rec.status}</span>
                  </div>
                </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
