import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, AlertCircle, Plus, Send, X, Clock, CheckCircle2, Ticket as TicketIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from '../../components/common/UserNavbar';
import UserSidebar from '../../components/common/UserSidebar';
import AdminNavbar from '../../components/common/AdminNavbar';
import Sidebar from '../../components/common/Sidebar';
import PlatformAdminNavbar from '../../components/common/PlatformAdminNavbar';
import PlatformAdminSidebar from '../../components/common/PlatformAdminSidebar';
import { getCurrentUser } from '../../lib/auth';

export default function ContactHub() {
    const [tickets, setTickets] = useState([]);
    const [boardings, setBoardings] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Form state
    const [type, setType] = useState('message_to_landlord');
    const [boardingId, setBoardingId] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    
    // Reply state
    const [replyMessage, setReplyMessage] = useState('');

    const token = localStorage.getItem('token');
    const authUser = getCurrentUser();
    const userRole = authUser?.role || 'tenant';
    
    // Safely extract userId from JWT
    let userId = null;
    try {
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload?.user?.id || payload?.id; 
        }
    } catch (e) {
        console.error("Failed to parse token", e);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            
            // 1. Fetch user's tickets
            const ticketsRes = await axios.get('http://localhost:5000/api/tickets', { headers });
            setTickets(ticketsRes.data);

            // 2. If user is a tenant, fetch boardings to populate the dropdown
            if (userRole === 'tenant') {
                const [boardingsRes, bookingsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/boardings', { headers }),
                    axios.get('http://localhost:5000/api/bookings', { headers })
                ]);
                
                setBoardings(boardingsRes.data);
                setMyBookings(bookingsRes.data);

                // Auto-select the first current boarding if available
                if (bookingsRes.data && bookingsRes.data.length > 0) {
                    const firstCurrentBoarding = bookingsRes.data.find(b => b.boarding && b.boarding._id);
                    if (firstCurrentBoarding) {
                        setBoardingId(firstCurrentBoarding.boarding._id);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const payload = {
                type,
                subject,
                description,
                priority,
                ...(type === 'message_to_landlord' && boardingId ? { boarding: boardingId } : {})
            };
            
            await axios.post('http://localhost:5000/api/tickets', payload, { headers });
            setIsCreating(false);
            
            // Reset form
            setSubject('');
            setDescription('');
            setBoardingId('');
            
            // Refresh data
            fetchData();
        } catch (error) {
            console.error("Error creating ticket:", error);
            alert("Failed to create ticket.");
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket) return;
        
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`http://localhost:5000/api/tickets/${selectedTicket._id}/reply`, { message: replyMessage }, { headers });
            setReplyMessage('');
            
            // Refresh tickets and update selected ticket
            const ticketsRes = await axios.get('http://localhost:5000/api/tickets', { headers });
            setTickets(ticketsRes.data);
            const updatedTicket = ticketsRes.data.find(t => t._id === selectedTicket._id);
            if (updatedTicket) setSelectedTicket(updatedTicket);
            
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'text-slate-500';
            case 'medium': return 'text-blue-500';
            case 'high': return 'text-amber-500';
            case 'critical': return 'text-red-500';
            default: return 'text-slate-500';
        }
    };

    // Derived data for dropdown
    const myBoardingIds = new Set(myBookings.map(b => b.boarding._id));
    const myCurrentBoardings = boardings.filter(b => myBoardingIds.has(b._id));
    const otherBoardings = boardings.filter(b => !myBoardingIds.has(b._id));

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    const renderNavbar = () => {
        if (userRole === 'admin') return <PlatformAdminNavbar />;
        if (userRole === 'landlord') return <AdminNavbar />;
        return <UserNavbar />;
    };

    const renderSidebar = () => {
        if (userRole === 'admin') return <PlatformAdminSidebar />;
        if (userRole === 'landlord') return <Sidebar />;
        return <UserSidebar />;
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            {renderNavbar()}
            <div className="flex flex-1 overflow-hidden">
                {renderSidebar()}
                <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Support Hub</h1>
                        <p className="text-slate-500 mt-2 text-lg">Manage your inquiries, communications, and reports.</p>
                    </div>
                    {(userRole === 'tenant' || userRole === 'landlord') && (
                        <Button 
                            onClick={() => { 
                                setIsCreating(true); 
                                setSelectedTicket(null);
                                setType(userRole === 'landlord' ? 'complaint_to_admin' : 'message_to_landlord');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 gap-2 font-semibold px-6 rounded-full"
                        >
                            <Plus className="w-5 h-5" />
                            New Request
                        </Button>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Tickets List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <TicketIcon className="w-5 h-5 text-indigo-500" />
                            Your Tickets
                        </h2>
                        {tickets.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <MessageSquare className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-600 font-medium">No tickets found</p>
                                <p className="text-slate-400 text-sm mt-1">You haven't opened any requests yet.</p>
                            </div>
                        ) : (
                            <motion.div 
                                initial="hidden" 
                                animate="visible" 
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                }}
                                className="space-y-3"
                            >
                                {tickets.map((ticket, idx) => (
                                    <motion.div 
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        key={ticket._id}
                                        onClick={() => { setSelectedTicket(ticket); setIsCreating(false); }}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${selectedTicket?._id === ticket._id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)} capitalize`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`text-xs font-semibold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 truncate">{ticket.subject}</h3>
                                        <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                            {ticket.type === 'complaint_to_admin' && <AlertCircle className="w-3.5 h-3.5 text-red-400 ml-2" />}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        
                        {/* Create Ticket Form */}
                        <AnimatePresence mode="wait">
                        {isCreating && (
                            <motion.div
                                key="create-form"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-0 shadow-2xl shadow-indigo-200/50 rounded-[2rem] overflow-hidden bg-white">
                                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <CardHeader className="bg-white pb-4 border-b border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-2xl font-black">Submit a Request</CardTitle>
                                            <CardDescription className="text-base mt-1">We're here to help with your stay.</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full hover:bg-slate-100">
                                            <X className="w-5 h-5 text-slate-400" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 bg-white space-y-6">
                                    <form onSubmit={handleCreateTicket} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Request Type</label>
                                                <select 
                                                    value={type} 
                                                    onChange={(e) => setType(e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-slate-50"
                                                    required
                                                >
                                                    {userRole === 'tenant' && (
                                                        <>
                                                            <option value="message_to_landlord">Message Landlord (Inquiry/Maintenance)</option>
                                                            <option value="complaint_to_admin">Complaint to Admin</option>
                                                        </>
                                                    )}
                                                    {userRole === 'landlord' && (
                                                        <option value="complaint_to_admin">Message Platform Admin</option>
                                                    )}
                                                </select>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Priority Level</label>
                                                <select 
                                                    value={priority} 
                                                    onChange={(e) => setPriority(e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-slate-50"
                                                >
                                                    <option value="low">Low - General Question</option>
                                                    <option value="medium">Medium - Standard Request</option>
                                                    <option value="high">High - Urgent Issue</option>
                                                    <option value="critical">Critical - Emergency</option>
                                                </select>
                                            </div>
                                        </div>

                                        {type === 'message_to_landlord' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Related Boarding</label>
                                                <select 
                                                    value={boardingId} 
                                                    onChange={(e) => setBoardingId(e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-slate-50"
                                                    required
                                                >
                                                    {myCurrentBoardings.length === 0 && (
                                                        <option value="" disabled>Select a boarding property...</option>
                                                    )}
                                                    {myCurrentBoardings.length > 0 && (
                                                        <optgroup label="My Current Boardings">
                                                            {myCurrentBoardings.map(b => (
                                                                <option key={b._id} value={b._id}>{b.boardingName} ({b.city})</option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                    <optgroup label="Other Boardings">
                                                        {otherBoardings.map(b => (
                                                            <option key={b._id} value={b._id}>{b.boardingName} ({b.city})</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Subject</label>
                                            <input 
                                                type="text" 
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-slate-50"
                                                placeholder="Briefly describe your request..."
                                                required 
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Details</label>
                                            <textarea 
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows="5"
                                                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-3 bg-slate-50 resize-none"
                                                placeholder="Provide as much detail as possible..."
                                                required
                                            ></textarea>
                                        </div>
                                        
                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-md">
                                                Submit Request
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                            </motion.div>
                        )}

                        {/* Ticket Detail View */}
                        {!isCreating && selectedTicket && (
                            <motion.div
                                key="detail-view"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-0 shadow-2xl shadow-indigo-200/50 rounded-[2rem] overflow-hidden flex flex-col h-[700px] bg-white">
                                <CardHeader className="bg-white pb-4 border-b border-slate-100 flex-shrink-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedTicket.status)} capitalize mr-2`}>
                                                {selectedTicket.status.replace('_', ' ')}
                                            </span>
                                            {selectedTicket.type === 'complaint_to_admin' && (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-200 mr-2">
                                                    Complaint
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-xs font-semibold uppercase tracking-wider ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority} Priority
                                        </span>
                                    </div>
                                    <CardTitle className="text-2xl font-black mt-2">{selectedTicket.subject}</CardTitle>
                                    <CardDescription className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
                                        <span>From: {selectedTicket.sender?.name || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                        {selectedTicket.boarding && (
                                            <>
                                                <span>•</span>
                                                <span className="text-indigo-600 font-semibold">{selectedTicket.boarding.boardingName}</span>
                                            </>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
                                    {/* Original Message */}
                                    {(() => {
                                        const isOriginalSenderMe = selectedTicket.sender?._id === userId;
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex flex-col ${isOriginalSenderMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className={`p-4 rounded-2xl shadow-sm max-w-[85%] ${isOriginalSenderMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                                                    {!isOriginalSenderMe && <p className="text-xs font-bold text-indigo-600 mb-1">{selectedTicket.sender?.name}</p>}
                                                    <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isOriginalSenderMe ? 'text-indigo-50' : 'text-slate-700'}`}>{selectedTicket.description}</p>
                                                </div>
                                                <span className="text-[10px] font-medium text-slate-400 mt-1 mx-1">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</span>
                                            </motion.div>
                                        );
                                    })()}

                                    {/* Replies */}
                                    {selectedTicket.replies?.map((reply, idx) => {
                                        const isMe = reply.sender?._id === userId;
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={idx} 
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className={`p-4 rounded-2xl shadow-sm max-w-[85%] ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                                                    {!isMe && <p className="text-xs font-bold text-indigo-600 mb-1">{reply.sender?.name}</p>}
                                                    <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isMe ? 'text-indigo-50' : 'text-slate-700'}`}>{reply.message}</p>
                                                </div>
                                                <span className="text-[10px] font-medium text-slate-400 mt-1 mx-1">
                                                    {new Date(reply.createdAt).toLocaleTimeString()}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </CardContent>
                                
                                <CardFooter className="bg-white border-t border-slate-100 p-4 flex-shrink-0">
                                    <form onSubmit={handleReply} className="flex gap-3 w-full items-center">
                                        <div className="relative flex-1">
                                            <input 
                                                type="text"
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                className="w-full rounded-full border-slate-200 bg-slate-50 shadow-inner py-3 pl-5 pr-12 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white transition-colors"
                                                placeholder="Type your reply..."
                                                disabled={selectedTicket.status === 'closed'}
                                            />
                                        </div>
                                        <Button 
                                            type="submit" 
                                            disabled={!replyMessage.trim() || selectedTicket.status === 'closed'}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-12 h-12 p-0 flex items-center justify-center flex-shrink-0 shadow-md"
                                        >
                                            <Send className="w-5 h-5 ml-1" />
                                        </Button>
                                    </form>
                                </CardFooter>
                                {selectedTicket.status === 'closed' && (
                                    <div className="bg-slate-100 text-center py-2 text-xs font-medium text-slate-500 border-t border-slate-200">
                                        This ticket is closed and cannot be replied to.
                                    </div>
                                )}
                            </Card>
                            </motion.div>
                        )}

                        {/* Welcome State */}
                        {!isCreating && !selectedTicket && (
                            <motion.div
                                key="welcome-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border-0 shadow-2xl shadow-indigo-100/40 rounded-[3rem] p-12 text-center h-[500px] flex flex-col items-center justify-center"
                            >
                                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <MessageSquare className="w-10 h-10 text-indigo-500 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Welcome to Support Hub</h2>
                                <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed font-medium">
                                    Select a ticket from the sidebar to view details, or use the <span className="font-bold text-indigo-600">New Request</span> button above to get in touch with your landlord or a platform administrator.
                                </p>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
                </main>
            </div>
        </div>
    );
}
