import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, Plus, Send, X, Clock, CheckCircle2, Ticket as TicketIcon, Search, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from '../../components/common/UserNavbar';
import UserSidebar from '../../components/common/UserSidebar';
import AdminNavbar from '../../components/common/AdminNavbar';
import Sidebar from '../../components/common/Sidebar';
import PlatformAdminNavbar from '../../components/common/PlatformAdminNavbar';
import PlatformAdminSidebar from '../../components/common/PlatformAdminSidebar';
import { getCurrentUser } from '../../lib/auth';
import { getTickets, createTicket, addTicketReply } from '../../api/tickets';
import { getBoardings } from '../../api/boardings';
import { getBookings } from '../../api/bookings';

export default function ContactHub() {
    const [tickets, setTickets] = useState([]);
    const [boardings, setBoardings] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [replying, setReplying] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Form state
    const [type, setType] = useState('message_to_landlord');
    const [boardingId, setBoardingId] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    
    // Reply state
    const [replyMessage, setReplyMessage] = useState('');

    const authUser = getCurrentUser();
    const userRole = authUser?.role || 'tenant';
    const userId = authUser?._id || authUser?.id;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            
            // 1. Fetch user's tickets
            const ticketsData = await getTickets();
            setTickets(ticketsData || []);

            // 2. If user is a tenant, fetch boardings to populate the dropdown
            if (userRole === 'tenant') {
                const [boardingsData, bookingsData] = await Promise.all([
                    getBoardings().catch(() => []),
                    getBookings().catch(() => [])
                ]);
                
                setBoardings(boardingsData || []);
                setMyBookings(bookingsData || []);

                // Auto-select the first current boarding if available
                if (bookingsData && bookingsData.length > 0) {
                    const firstCurrentBoarding = bookingsData.find(b => b.boarding && b.boarding._id);
                    if (firstCurrentBoarding) {
                        setBoardingId(firstCurrentBoarding.boarding._id);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setErrorMsg('Failed to load tickets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setErrorMsg('');
            const payload = {
                type,
                subject,
                description,
                priority,
                ...(type === 'message_to_landlord' && boardingId ? { boarding: boardingId } : {})
            };
            
            const newTicket = await createTicket(payload);
            setIsCreating(false);
            
            // Reset form
            setSubject('');
            setDescription('');
            setBoardingId('');
            
            // Update tickets list and select new ticket
            if (newTicket) {
                setTickets(prev => [newTicket, ...prev]);
                setSelectedTicket(newTicket);
            } else {
                fetchData();
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
            setErrorMsg(error.message || "Failed to create ticket.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket) return;
        
        try {
            setReplying(true);
            const updated = await addTicketReply(selectedTicket._id, replyMessage);
            setReplyMessage('');
            
            // Refresh tickets and update selected ticket
            const ticketsData = await getTickets();
            setTickets(ticketsData || []);
            const updatedTicket = (ticketsData || []).find(t => t._id === selectedTicket._id);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
            } else if (updated) {
                setSelectedTicket(updated);
            }
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setReplying(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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

    // Derived data for dropdown safely
    const myBoardingIds = new Set(
        (myBookings || [])
            .map(b => b.boarding?._id || (typeof b.boarding === 'string' ? b.boarding : null))
            .filter(Boolean)
    );
    const myCurrentBoardings = (boardings || []).filter(b => myBoardingIds.has(b._id));
    const otherBoardings = (boardings || []).filter(b => !myBoardingIds.has(b._id));

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
                <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto min-w-0">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
                >
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Help & Communications
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Support Hub</h1>
                        <p className="text-slate-500 font-medium text-sm sm:text-base">Manage your inquiries, landlord communications, and issue tickets.</p>
                    </div>
                    {(userRole === 'tenant' || userRole === 'landlord') && (
                        <Button 
                            onClick={() => { 
                                setIsCreating(true); 
                                setSelectedTicket(null);
                                setType(userRole === 'landlord' ? 'complaint_to_admin' : 'message_to_landlord');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 gap-2 font-bold px-6 h-12 rounded-2xl transition-all active:scale-95 shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                            New Request
                        </Button>
                    )}
                </motion.div>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    
                    {/* Tickets List Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <TicketIcon className="w-4 h-4 text-indigo-600" />
                                Your Tickets
                            </h2>
                            <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-xs">
                                {tickets.length} Total
                            </Badge>
                        </div>

                        {loading ? (
                            <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-3 shadow-sm">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="text-slate-400 font-bold text-xs">Retrieving your tickets...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center shadow-sm">
                                <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3 text-indigo-500">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <p className="text-slate-800 font-bold text-sm">No tickets found</p>
                                <p className="text-slate-400 text-xs mt-1 font-medium">You haven't opened any support requests yet.</p>
                            </div>
                        ) : (
                            <motion.div 
                                initial="hidden" 
                                animate="visible" 
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
                                }}
                                className="space-y-3 max-h-[650px] overflow-y-auto pr-1"
                            >
                                {tickets.map((ticket) => (
                                    <motion.div 
                                        variants={{
                                            hidden: { opacity: 0, x: -15 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        key={ticket._id}
                                        onClick={() => { setSelectedTicket(ticket); setIsCreating(false); }}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                                            selectedTicket?._id === ticket._id 
                                                ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/10' 
                                                : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(ticket.status)}`}>
                                                {ticket.status?.replace('_', ' ')}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm truncate">{ticket.subject}</h3>
                                        <div className="flex items-center gap-1.5 mt-2 text-slate-400 text-xs font-medium">
                                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            {ticket.type === 'complaint_to_admin' && (
                                                <Badge className="bg-rose-50 text-rose-600 border-none font-bold text-[9px] px-1.5 py-0 ml-auto">
                                                    Admin Report
                                                </Badge>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Main Content Area Column */}
                    <div className="lg:col-span-2">
                        
                        {/* Create Ticket Form */}
                        <AnimatePresence mode="wait">
                        {isCreating && (
                            <motion.div
                                key="create-form"
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-white">
                                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <CardHeader className="bg-white pb-4 border-b border-slate-100 p-6 sm:p-8">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-slate-900">Submit a Request</CardTitle>
                                            <CardDescription className="text-xs font-medium text-slate-500 mt-1">We're here to help coordinate with your landlord or admin.</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full hover:bg-slate-100 text-slate-400">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 bg-white space-y-6">
                                    <form onSubmit={handleCreateTicket} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Request Type</label>
                                                <select 
                                                    value={type} 
                                                    onChange={(e) => setType(e.target.value)}
                                                    className="w-full rounded-2xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-3.5 bg-slate-50 font-bold text-xs text-slate-700"
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
                                            
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Priority Level</label>
                                                <select 
                                                    value={priority} 
                                                    onChange={(e) => setPriority(e.target.value)}
                                                    className="w-full rounded-2xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-3.5 bg-slate-50 font-bold text-xs text-slate-700"
                                                >
                                                    <option value="low">Low - General Question</option>
                                                    <option value="medium">Medium - Standard Request</option>
                                                    <option value="high">High - Urgent Issue</option>
                                                    <option value="critical">Critical - Emergency</option>
                                                </select>
                                            </div>
                                        </div>

                                        {type === 'message_to_landlord' && (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Related Boarding Property</label>
                                                <select 
                                                    value={boardingId} 
                                                    onChange={(e) => setBoardingId(e.target.value)}
                                                    className="w-full rounded-2xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-3.5 bg-slate-50 font-bold text-xs text-slate-700"
                                                    required
                                                >
                                                    {myCurrentBoardings.length === 0 && (
                                                        <option value="" disabled>Select a boarding property...</option>
                                                    )}
                                                    {myCurrentBoardings.length > 0 && (
                                                        <optgroup label="My Active Stays">
                                                            {myCurrentBoardings.map(b => (
                                                                <option key={b._id} value={b._id}>{b.boardingName} ({b.city || b.address})</option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                    <optgroup label="All Boardings">
                                                        {otherBoardings.map(b => (
                                                            <option key={b._id} value={b._id}>{b.boardingName} ({b.city || b.address})</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-400">Subject</label>
                                            <Input 
                                                type="text" 
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="h-12 rounded-2xl font-bold text-xs sm:text-sm bg-slate-50"
                                                placeholder="Brief summary of your inquiry..."
                                                required 
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-400">Detailed Message</label>
                                            <Textarea 
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={5}
                                                className="rounded-2xl font-medium text-xs sm:text-sm bg-slate-50 resize-none p-3.5"
                                                placeholder="Provide detailed context so we can assist you promptly..."
                                                required
                                            />
                                        </div>
                                        
                                        <div className="pt-2 flex justify-end gap-3">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsCreating(false)}
                                                className="rounded-2xl h-11 font-bold text-xs"
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={submitting}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-8 font-black text-xs shadow-lg shadow-indigo-200"
                                            >
                                                {submitting ? 'Submitting...' : 'Send Request'}
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
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl sm:rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] bg-white">
                                <CardHeader className="bg-white pb-4 border-b border-slate-100 flex-shrink-0 p-6 sm:p-8">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(selectedTicket.status)}`}>
                                                {selectedTicket.status?.replace('_', ' ')}
                                            </span>
                                            {selectedTicket.type === 'complaint_to_admin' && (
                                                <Badge className="bg-rose-50 text-rose-600 border-none font-bold text-[9px]">
                                                    Admin Report
                                                </Badge>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority} Priority
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{selectedTicket.subject}</CardTitle>
                                    <CardDescription className="text-slate-400 mt-1 flex flex-wrap items-center gap-2 text-xs font-medium">
                                        <span>From: <strong className="text-slate-700">{selectedTicket.sender?.name || 'User'}</strong></span>
                                        <span>•</span>
                                        <span>{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                                        {selectedTicket.boarding && (
                                            <>
                                                <span>•</span>
                                                <span className="text-indigo-600 font-bold">{selectedTicket.boarding.boardingName}</span>
                                            </>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
                                    {/* Original Message */}
                                    {(() => {
                                        const isOriginalSenderMe = selectedTicket.sender?._id === userId;
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex flex-col ${isOriginalSenderMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className={`p-4 rounded-2xl shadow-sm max-w-[85%] ${
                                                    isOriginalSenderMe 
                                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                                }`}>
                                                    {!isOriginalSenderMe && <p className="text-xs font-bold text-indigo-600 mb-1">{selectedTicket.sender?.name}</p>}
                                                    <p className={`whitespace-pre-wrap text-xs sm:text-sm leading-relaxed ${isOriginalSenderMe ? 'text-indigo-50' : 'text-slate-700'}`}>{selectedTicket.description}</p>
                                                </div>
                                                <span className="text-[10px] font-medium text-slate-400 mt-1 mx-1">{new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </motion.div>
                                        );
                                    })()}

                                    {/* Replies */}
                                    {selectedTicket.replies?.map((reply, idx) => {
                                        const isMe = reply.sender?._id === userId || reply.sender === userId;
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                key={idx} 
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className={`p-4 rounded-2xl shadow-sm max-w-[85%] ${
                                                    isMe 
                                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                                }`}>
                                                    {!isMe && <p className="text-xs font-bold text-indigo-600 mb-1">{reply.sender?.name || "Support Team"}</p>}
                                                    <p className={`whitespace-pre-wrap text-xs sm:text-sm leading-relaxed ${isMe ? 'text-indigo-50' : 'text-slate-700'}`}>{reply.message}</p>
                                                </div>
                                                <span className="text-[10px] font-medium text-slate-400 mt-1 mx-1">
                                                    {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </CardContent>
                                
                                <CardFooter className="bg-white border-t border-slate-100 p-4 flex-shrink-0">
                                    <form onSubmit={handleReply} className="flex gap-2 w-full items-center">
                                        <Input 
                                            type="text"
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            className="rounded-2xl h-11 bg-slate-50 border-slate-200 text-xs sm:text-sm font-medium"
                                            placeholder={selectedTicket.status === 'closed' ? "This ticket is closed." : "Type your reply..."}
                                            disabled={selectedTicket.status === 'closed' || replying}
                                        />
                                        <Button 
                                            type="submit" 
                                            disabled={!replyMessage.trim() || selectedTicket.status === 'closed' || replying}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-5 font-black text-xs shadow-md shrink-0"
                                        >
                                            <Send className="w-4 h-4 mr-1.5" />
                                            {replying ? "Sending..." : "Reply"}
                                        </Button>
                                    </form>
                                </CardFooter>
                                {selectedTicket.status === 'closed' && (
                                    <div className="bg-slate-50 text-center py-2 text-[11px] font-bold text-slate-400 border-t border-slate-100">
                                        This ticket has been marked as closed.
                                    </div>
                                )}
                            </Card>
                            </motion.div>
                        )}

                        {/* Welcome State */}
                        {!isCreating && !selectedTicket && (
                            <motion.div
                                key="welcome-state"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white border-0 shadow-xl shadow-slate-200/40 rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 text-center h-[500px] flex flex-col items-center justify-center"
                            >
                                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 text-indigo-600 shadow-sm">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">Support & Inquiry Center</h2>
                                <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm leading-relaxed font-medium">
                                    Select an existing conversation from the list to view updates, or click <strong className="text-indigo-600 font-black">New Request</strong> to start a new inquiry with your landlord or administrator.
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
