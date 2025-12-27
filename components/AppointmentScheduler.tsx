
import React, { useState } from 'react';
import { Appointment, User } from '../types';
import { Calendar, Clock, MapPin, Video, MoreVertical, CheckCircle, XCircle, Plus, Edit2, Save, Bell, BellRing, MessageSquare, ToggleLeft, ToggleRight, Check } from 'lucide-react';

interface AppointmentSchedulerProps {
  user: User;
  onSchedule?: () => void;
  appointments?: Appointment[];
  onStartCall?: (participantName: string) => void;
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', institutionId: 'inst1', patientName: 'Jane Doe', doctorName: 'Dr. Samuel K.', date: new Date().toISOString().split('T')[0], time: '09:00', type: 'Video Consultation', status: 'Scheduled' },
  { id: '2', institutionId: 'inst1', patientName: 'Michael O.', doctorName: 'Dr. Samuel K.', date: new Date().toISOString().split('T')[0], time: '10:30', type: 'Clinic Visit', status: 'Scheduled', notes: 'Follow up on hypertension. BP was 140/90 last week.' },
  { id: '3', institutionId: 'inst1', patientName: 'Sarah L.', doctorName: 'Dr. Samuel K.', date: new Date().toISOString().split('T')[0], time: '14:00', type: 'Home Sample Collection', status: 'Completed' },
];

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ user, onSchedule, appointments: propAppointments, onStartCall }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(propAppointments || MOCK_APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Feature State
  const [autoReminders, setAutoReminders] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [sentReminders, setSentReminders] = useState<string[]>([]);

  // Generate next 5 days
  const dates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: d.getDate(),
          full: d.toISOString().split('T')[0]
      };
  });

  const filteredApps = appointments.filter(a => a.date === selectedDate);

  // Handlers
  const handleEditNote = (app: Appointment) => {
      setEditingNoteId(app.id);
      setTempNote(app.notes || '');
  };

  const handleSaveNote = (id: string) => {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, notes: tempNote } : a));
      setEditingNoteId(null);
  };

  const handleSendReminder = (id: string, name: string) => {
      if (sentReminders.includes(id)) return;
      
      // Simulate API call
      alert(`Reminder sent to ${name} via SMS and Email.`);
      setSentReminders(prev => [...prev, id]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">My Schedule</h3>
                    <p className="text-xs text-slate-500">Manage appointments & availability</p>
                </div>
                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                    <Plus size={20} />
                </button>
            </div>

            {/* Auto Reminder Toggle */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BellRing size={16} className={autoReminders ? "text-emerald-500" : "text-slate-400"} />
                    <span className="text-xs font-bold text-slate-700">Auto-Reminders (24h before)</span>
                </div>
                <button onClick={() => setAutoReminders(!autoReminders)} className="text-indigo-600 transition-colors">
                    {autoReminders ? <ToggleRight size={28} className="fill-indigo-100" /> : <ToggleLeft size={28} className="text-slate-400" />}
                </button>
            </div>
        </div>

        {/* Date Strip */}
        <div className="flex justify-between gap-2 mb-6 bg-slate-50 p-2 rounded-xl">
            {dates.map((d) => (
                <button 
                    key={d.full}
                    onClick={() => setSelectedDate(d.full)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg transition-all ${
                        selectedDate === d.full 
                        ? 'bg-white shadow-sm text-indigo-600 font-bold border border-slate-200' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <span className="text-[10px] uppercase">{d.day}</span>
                    <span className="text-lg">{d.date}</span>
                </button>
            ))}
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {filteredApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <Calendar size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">No appointments for this day.</p>
                </div>
            ) : (
                filteredApps.map(app => (
                    <div key={app.id} className="flex gap-3 group">
                        <div className="w-14 pt-2 text-right flex-shrink-0">
                            <span className="block text-sm font-bold text-slate-700">{app.time}</span>
                            <span className="text-[10px] text-slate-400">30m</span>
                        </div>
                        <div className="flex-1 bg-white border border-slate-100 rounded-xl p-3 hover:shadow-md hover:border-indigo-100 transition-all relative overflow-hidden flex flex-col">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                app.status === 'Completed' ? 'bg-green-500' : 'bg-indigo-500'
                            }`}></div>
                            
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
                                    app.type === 'Video Consultation' ? 'bg-blue-50 text-blue-600' : 
                                    app.type === 'Clinic Visit' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                    {app.type === 'Video Consultation' ? 'Video' : app.type === 'Clinic Visit' ? 'Clinic' : 'Home'}
                                </span>
                                
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleSendReminder(app.id, app.patientName)}
                                        className={`p-1.5 rounded-md transition-colors ${sentReminders.includes(app.id) ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                        title="Send Reminder"
                                    >
                                        {sentReminders.includes(app.id) ? <Check size={14} /> : <Bell size={14} />}
                                    </button>
                                    <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={14} /></button>
                                </div>
                            </div>

                            <h4 className="font-bold text-slate-800 text-sm">{app.patientName}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 mb-3">
                                {app.type === 'Video Consultation' ? <Video size={12} /> : <MapPin size={12} />}
                                <span>{app.type === 'Video Consultation' ? 'Online Meeting' : 'Room 304, Mulago'}</span>
                            </div>

                            {/* Notes Section */}
                            <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-2 mb-3">
                                {editingNoteId === app.id ? (
                                    <div className="space-y-2">
                                        <textarea 
                                            value={tempNote}
                                            onChange={(e) => setTempNote(e.target.value)}
                                            className="w-full text-xs p-2 bg-white border border-yellow-200 rounded focus:outline-none focus:border-yellow-400 resize-none h-16"
                                            placeholder="Add clinical notes..."
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingNoteId(null)} className="text-[10px] text-slate-500 font-bold px-2 py-1">Cancel</button>
                                            <button onClick={() => handleSaveNote(app.id)} className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 hover:bg-yellow-200">
                                                <Save size={10} /> Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group/notes relative">
                                        <div className="flex items-center gap-1 mb-1">
                                            <MessageSquare size={10} className="text-yellow-600" />
                                            <span className="text-[10px] font-bold text-yellow-700 uppercase">Doctor's Notes</span>
                                        </div>
                                        <p className="text-xs text-slate-600 italic min-h-[1.5rem]">
                                            {app.notes || <span className="text-slate-400">No notes added.</span>}
                                        </p>
                                        <button 
                                            onClick={() => handleEditNote(app)}
                                            className="absolute top-0 right-0 p-1 text-yellow-600 opacity-0 group-hover/notes:opacity-100 transition-opacity hover:bg-yellow-100 rounded"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {app.status === 'Scheduled' && (
                                <div className="mt-auto flex gap-2">
                                    <button 
                                        onClick={() => {
                                            if (app.type === 'Video Consultation' && onStartCall) {
                                                onStartCall(app.patientName);
                                            } else {
                                                alert("Starting session...");
                                            }
                                        }}
                                        className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm"
                                    >
                                        Start Session
                                    </button>
                                    <button className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200">
                                        Reschedule
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default AppointmentScheduler;
