
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Send, Phone, Video, ArrowLeft, Paperclip, Check, CheckCheck, MoreVertical } from 'lucide-react';

interface DirectChatProps {
    currentUser: User;
    recipient: { id: string; name: string; avatar: string; role: string };
    onBack: () => void;
    onEmergency: () => void;
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
    status: 'sent' | 'delivered' | 'read';
}

const DirectChat: React.FC<DirectChatProps> = ({ currentUser, recipient, onBack, onEmergency }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', senderId: recipient.id, text: `Hello ${currentUser.name}, how are you feeling today?`, timestamp: Date.now() - 3600000, status: 'read' },
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            text: input,
            timestamp: Date.now(),
            status: 'sent'
        };

        setMessages([...messages, newMsg]);
        setInput('');

        // Simulate reply
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m));
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                senderId: recipient.id,
                text: "I have received your message. Let me check the records.",
                timestamp: Date.now(),
                status: 'read'
            }]);
        }, 2000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div className="relative">
                        <img src={recipient.avatar} alt={recipient.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{recipient.name}</h3>
                        <p className="text-xs text-slate-500 capitalize">{recipient.role} • Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => alert("Starting Audio Call...")} className="p-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <Phone size={18} />
                    </button>
                    <button onClick={() => alert("Starting Video Call...")} className="p-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <Video size={18} />
                    </button>
                    <button onClick={onEmergency} className="p-2.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors animate-pulse" title="Report Emergency">
                        <span className="font-bold text-xs">SOS</span>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                                isMe 
                                    ? 'bg-teal-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                            }`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMe && (
                                        msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
                <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                    <Paperclip size={20} />
                </button>
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
                <button 
                    type="submit" 
                    disabled={!input.trim()}
                    className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-teal-200/50"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default DirectChat;
