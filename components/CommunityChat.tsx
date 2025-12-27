
import React, { useState } from 'react';
import { CommunityPost, User, ChatGroup } from '../types';
import { MessageSquare, ThumbsUp, User as UserIcon, Send, Users, Plus, Phone, Video, Hash } from 'lucide-react';
import GroupCall from './GroupCall';

interface CommunityChatProps {
  user: User;
}

const MOCK_POSTS: CommunityPost[] = [
    { id: '1', author: 'Sarah K.', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', content: 'Has anyone tried the new diet plan for managing Type 2 Diabetes recommended by Dr. Wise?', likes: 12, comments: 4, timeAgo: '2h ago', topic: 'Diabetes Support' },
    { id: '2', author: 'Mike O.', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', content: 'Just finished my bi-annual checkup at Cynosure. The process was super smooth!', likes: 24, comments: 2, timeAgo: '5h ago', topic: 'General Wellness' },
];

const MOCK_GROUPS: ChatGroup[] = [
    { id: 'g1', name: 'Diabetes Warriors', type: 'support', members: 128, isPrivate: false, lastActive: 'Now', activeCall: true },
    { id: 'g2', name: 'Kampala New Moms', type: 'support', members: 340, isPrivate: false, lastActive: '5m ago', activeCall: false },
    { id: 'g3', name: 'Sickle Cell Family', type: 'support', members: 85, isPrivate: true, lastActive: '1h ago', activeCall: false },
];

const CommunityChat: React.FC<CommunityChatProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'groups'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS);
  const [groups, setGroups] = useState<ChatGroup[]>(MOCK_GROUPS);
  const [newContent, setNewContent] = useState('');
  
  // Group Logic
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [activeCallGroup, setActiveCallGroup] = useState<ChatGroup | null>(null);

  const handlePost = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newContent.trim()) return;
      
      const post: CommunityPost = {
          id: Date.now().toString(),
          author: user.name,
          avatar: user.avatar,
          content: newContent,
          likes: 0,
          comments: 0,
          timeAgo: 'Just now',
          topic: 'General'
      };
      setPosts([post, ...posts]);
      setNewContent('');
  };

  const createGroup = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGroupName.trim()) return;
      const newGroup: ChatGroup = {
          id: Date.now().toString(),
          name: newGroupName,
          type: 'support',
          members: 1,
          isPrivate: false,
          lastActive: 'Just now'
      };
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setShowCreateGroup(false);
      alert("Group Created!");
  };

  if (activeCallGroup) {
      return <GroupCall 
        title={activeCallGroup.name} 
        participants={['Sarah K.', 'John D.', 'Mike O.']} 
        type="patient" 
        onEndCall={() => setActiveCallGroup(null)} 
      />;
  }

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg flex-shrink-0">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Users /> EduWellness Community
                    </h2>
                    <p className="text-blue-100">Connect, share, and support each other.</p>
                </div>
                <div className="flex bg-white/10 p-1 rounded-lg backdrop-blur-sm">
                    <button onClick={() => {setActiveTab('feed'); setSelectedGroup(null);}} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'}`}>Public Feed</button>
                    <button onClick={() => setActiveTab('groups')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'groups' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'}`}>My Groups</button>
                </div>
            </div>
        </div>

        {activeTab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-2 space-y-6 overflow-y-auto scrollbar-hide pb-20">
                    {/* Input */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                        <img src={user.avatar} alt="Me" className="w-10 h-10 rounded-full" />
                        <form onSubmit={handlePost} className="flex-1 relative">
                            <input 
                                type="text" 
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                placeholder="Share your health journey..." 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Send size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Feed */}
                    {posts.map(post => (
                        <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full border border-slate-100" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{post.author}</h4>
                                        <p className="text-xs text-slate-400">{post.timeAgo}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                    {post.topic}
                                </span>
                            </div>
                            <p className="text-slate-700 mb-4 leading-relaxed">{post.content}</p>
                            <div className="flex items-center gap-6 text-slate-500 text-sm">
                                <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                    <ThumbsUp size={16} /> {post.likes} Likes
                                </button>
                                <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                    <MessageSquare size={16} /> {post.comments} Comments
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6 hidden lg:block overflow-y-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Trending Topics</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Diabetes Care', 'Mental Health', 'Nutrition', 'Cynosure Experience', 'Pregnancy'].map(t => (
                                <span key={t} className="px-3 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full text-xs font-medium cursor-pointer transition-colors border border-slate-200">
                                    #{t.replace(' ', '')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'groups' && !selectedGroup && (
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Your Support Groups</h3>
                    <button onClick={() => setShowCreateGroup(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center gap-2">
                        <Plus size={16} /> Create Group
                    </button>
                </div>

                {showCreateGroup && (
                    <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 animate-slide-in-down">
                        <form onSubmit={createGroup} className="flex gap-2">
                            <input 
                                type="text" 
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)}
                                placeholder="Group Name (e.g. Kampala Walkers)"
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                            <button type="submit" className="px-4 bg-slate-800 text-white rounded-lg text-sm font-bold">Create</button>
                            <button type="button" onClick={() => setShowCreateGroup(false)} className="px-4 text-slate-500 text-sm">Cancel</button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                    {groups.map(group => (
                        <div key={group.id} onClick={() => setSelectedGroup(group)} className="bg-white p-5 rounded-xl border border-slate-100 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${group.id === 'g1' ? 'bg-blue-500' : group.id === 'g2' ? 'bg-purple-500' : 'bg-teal-500'}`}>
                                    <Hash size={24} />
                                </div>
                                {group.activeCall && (
                                    <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                        <Phone size={10} className="fill-current" /> Live Call
                                    </span>
                                )}
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-1">{group.name}</h4>
                            <p className="text-xs text-slate-500 mb-4">{group.members} Members • Active {group.lastActive}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                    ))}
                                </div>
                                <span className="text-xs text-slate-400">+ {group.members - 3}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Single Group View */}
        {activeTab === 'groups' && selectedGroup && (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedGroup(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">← Back</button>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <div>
                            <h3 className="font-bold text-slate-800">{selectedGroup.name}</h3>
                            <p className="text-xs text-slate-500">{selectedGroup.members} Members</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveCallGroup(selectedGroup)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Video size={16} /> Start Group Call
                    </button>
                </div>

                {/* Chat Area (Mock) */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30 space-y-4">
                    <div className="text-center text-xs text-slate-400 my-4">Today</div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0"></div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[80%]">
                            <p className="text-sm font-bold text-blue-600 mb-1">Alice M.</p>
                            <p className="text-sm text-slate-700">Hey everyone! I found a great local market for fresh greens in Ntinda.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                        <img src={user.avatar} className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] text-white">
                            <p className="text-sm">That's awesome Alice! Could you share the location pin?</p>
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Message the group..." className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"><Send size={18} /></button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CommunityChat;
