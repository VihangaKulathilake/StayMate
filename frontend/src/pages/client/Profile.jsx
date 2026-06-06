import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, LogOut, Eye, EyeOff, Shield, ShieldCheck,
    Building2, Users, LayoutDashboard, AlertCircle, Save,
    KeyRound, Pencil, X, Loader2, CheckCircle2, UserCircle,
    ChevronRight, Sparkles, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Layout components
import UserNavbar from '@/components/common/UserNavbar';
import AdminNavbar from '@/components/common/AdminNavbar';
import Sidebar from '@/components/common/Sidebar';
import PlatformAdminNavbar from '@/components/common/PlatformAdminNavbar';
import PlatformAdminSidebar from '@/components/common/PlatformAdminSidebar';
import UserSidebar from '@/components/common/UserSidebar';

// Auth & API
import { getCurrentUser, clearAuthSession, saveAuthSession } from '@/lib/auth';
import { getMe, updateMe, changePassword } from '@/api/users';

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
    tenant: {
        gradient: 'from-violet-600 to-purple-700',
        accentBg: 'bg-violet-600',
        accentHover: 'hover:bg-violet-700',
        accentText: 'text-violet-600',
        accentLight: 'bg-violet-50',
        accentBorder: 'border-violet-200',
        accentRing: 'focus:ring-violet-500/20',
        badgeBg: 'bg-violet-100 text-violet-700',
        glow: 'shadow-violet-500/25',
        label: 'Tenant',
        icon: Users,
        dashboardLink: '/marketplace',
        dashboardLabel: 'Browse Listings',
    },
    landlord: {
        gradient: 'from-indigo-600 to-blue-700',
        accentBg: 'bg-indigo-600',
        accentHover: 'hover:bg-indigo-700',
        accentText: 'text-indigo-600',
        accentLight: 'bg-indigo-50',
        accentBorder: 'border-indigo-200',
        accentRing: 'focus:ring-indigo-500/20',
        badgeBg: 'bg-indigo-100 text-indigo-700',
        glow: 'shadow-indigo-500/25',
        label: 'Landlord',
        icon: Building2,
        dashboardLink: '/dashboard',
        dashboardLabel: 'Go to Dashboard',
    },
    admin: {
        gradient: 'from-emerald-600 to-teal-700',
        accentBg: 'bg-emerald-600',
        accentHover: 'hover:bg-emerald-700',
        accentText: 'text-emerald-600',
        accentLight: 'bg-emerald-50',
        accentBorder: 'border-emerald-200',
        accentRing: 'focus:ring-emerald-500/20',
        badgeBg: 'bg-emerald-100 text-emerald-700',
        glow: 'shadow-emerald-500/25',
        label: 'System Administrator',
        icon: Shield,
        dashboardLink: '/admin/dashboard',
        dashboardLabel: 'Open Console',
    },
};

// ─── Layouts ──────────────────────────────────────────────────────────────────
function TenantLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20 font-sans flex flex-col">
            <UserNavbar />
            <div className="flex flex-1 overflow-hidden">
                <UserSidebar />
                <main className="flex-1 container mx-auto px-4 py-10 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
function LandlordLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 font-sans">
            <AdminNavbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-12">{children}</main>
            </div>
        </div>
    );
}
function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 font-sans">
            <PlatformAdminNavbar />
            <div className="flex">
                <PlatformAdminSidebar />
                <main className="flex-1 p-6 lg:p-12">{children}</main>
            </div>
        </div>
    );
}

// ─── Inline Alert ─────────────────────────────────────────────────────────────
function AlertBanner({ type, message, onClose }) {
    if (!message) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold ${
                type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
        >
            {type === 'success'
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
    if (!password) return null;
    const strength = password.length < 6 ? 1 : password.length < 10 ? 2 : password.length < 14 ? 3 : 4;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500'];
    const textColors = ['', 'text-rose-600', 'text-amber-600', 'text-indigo-600', 'text-emerald-600'];
    return (
        <div className="space-y-2">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                    <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i <= strength ? 1 : 0.2 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className={`h-1.5 flex-1 rounded-full origin-left transition-colors duration-300 ${
                            i <= strength ? colors[strength] : 'bg-slate-200'
                        }`}
                    />
                ))}
            </div>
            <p className={`text-xs font-black uppercase tracking-widest ${textColors[strength]}`}>
                {labels[strength]}
            </p>
        </div>
    );
}

// ─── Floating label Input ────────────────────────────────────────────────────
function FloatingInput({ label, icon: Icon, type = 'text', value, onChange, disabled, placeholder, rightElement, autoComplete }) {
    const [focused, setFocused] = useState(false);
    const isActive = focused || !!value;
    return (
        <div className="relative group">
            {Icon && (
                <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    focused ? 'text-indigo-500' : 'text-slate-300'
                } ${disabled ? 'text-slate-200' : ''}`} />
            )}
            <Input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder || label}
                autoComplete={autoComplete}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`h-14 rounded-2xl font-bold transition-all duration-200 border
                    ${Icon ? 'pl-11' : 'pl-5'} ${rightElement ? 'pr-14' : 'pr-5'}
                    ${disabled
                        ? 'bg-slate-50 border-transparent text-slate-500 cursor-default select-none opacity-80'
                        : focused
                            ? 'bg-white border-indigo-300 shadow-md shadow-indigo-100 ring-4 ring-indigo-500/10'
                            : 'bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-sm'
                    }
                `}
            />
            {rightElement && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>
    );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'profile', label: 'Personal Info', icon: UserCircle },
    { id: 'password', label: 'Change Password', icon: KeyRound },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function Profile() {
    const navigate = useNavigate();
    const authUser = getCurrentUser();
    const role = authUser?.role || 'tenant';
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.tenant;
    const DashIcon = config.icon;

    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // Profile edit
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileAlert, setProfileAlert] = useState(null);

    // Password
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [savingPw, setSavingPw] = useState(false);
    const [pwAlert, setPwAlert] = useState(null);
    const [pwSuccess, setPwSuccess] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await getMe();
                setUser(data);
                setName(data.name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setAddress(data.address || '');
            } catch {
                setUser(authUser);
                setName(authUser?.name || '');
                setEmail(authUser?.email || '');
                setPhone(authUser?.phone || '');
                setAddress(authUser?.address || '');
            } finally {
                setLoadingUser(false);
            }
        })();
    }, []);

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            setProfileAlert({ type: 'error', message: 'Name cannot be empty.' });
            return;
        }
        setSavingProfile(true);
        setProfileAlert(null);
        try {
            const result = await updateMe({ 
                name: name.trim(), 
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim()
            });
            saveAuthSession({ user: result.user });
            setUser(prev => ({ ...prev, ...result.user }));
            setEditMode(false);
            setProfileAlert({ type: 'success', message: 'Profile updated successfully!' });
        } catch (err) {
            setProfileAlert({ type: 'error', message: err.message || 'Failed to update profile.' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleVerifyIdentity = async () => {
        if (!phone.trim() || !address.trim()) {
            setProfileAlert({ 
                type: 'error', 
                message: 'Please complete your phone number and address before verifying identity.' 
            });
            return;
        }
        setSavingProfile(true);
        setProfileAlert(null);
        try {
            const result = await updateMe({ isVerified: true });
            saveAuthSession({ user: result.user });
            setUser(prev => ({ ...prev, ...result.user }));
            setProfileAlert({ type: 'success', message: 'Identity verified successfully!' });
        } catch (err) {
            setProfileAlert({ type: 'error', message: err.message || 'Verification failed.' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwAlert(null);
        if (newPw.length < 6) { setPwAlert({ type: 'error', message: 'New password must be at least 6 characters.' }); return; }
        if (newPw !== confirmPw) { setPwAlert({ type: 'error', message: 'Passwords do not match.' }); return; }
        setSavingPw(true);
        try {
            await changePassword({ currentPassword: currentPw, newPassword: newPw });
            setPwSuccess(true);
            setTimeout(() => setPwSuccess(false), 3000);
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) {
            setPwAlert({ type: 'error', message: err.message || 'Failed to change password.' });
        } finally {
            setSavingPw(false);
        }
    };

    const handleLogout = () => { clearAuthSession(); navigate('/login', { replace: true }); };
    const handleCancelEdit = () => { 
        setName(user?.name || ''); 
        setEmail(user?.email || ''); 
        setPhone(user?.phone || '');
        setAddress(user?.address || '');
        setEditMode(false); 
        setProfileAlert(null); 
    };

    const initials = (user?.name || authUser?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—';

    const content = (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`relative rounded-[2.5rem] bg-gradient-to-br ${config.gradient} p-10 overflow-hidden shadow-2xl ${config.glow}`}
            >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

                {/* Dot grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px'}} />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-8">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="relative"
                        >
                            <Avatar className="w-28 h-28 border-4 border-white/30 shadow-2xl ring-4 ring-white/20">
                                <AvatarFallback className="bg-white/20 text-white text-3xl font-black backdrop-blur-sm">
                                    {loadingUser ? <Loader2 className="w-8 h-8 animate-spin opacity-60" /> : initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Name + role */}
                    <div className="text-white text-center sm:text-left flex-1">
                        {loadingUser ? (
                            <div className="space-y-2">
                                <div className="h-8 w-48 bg-white/20 rounded-xl animate-pulse" />
                                <div className="h-4 w-32 bg-white/10 rounded-lg animate-pulse" />
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                                <h1 className="text-4xl font-black tracking-tight leading-none">{user?.name}</h1>
                                <p className="text-white/70 font-bold mt-1 text-sm">{user?.email}</p>
                                <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start flex-wrap">
                                    <Badge className="bg-white/20 text-white border-none font-black px-4 py-1.5 rounded-xl backdrop-blur-sm text-xs">
                                        <Shield className="w-3 h-3 mr-1.5" /> {config.label}
                                    </Badge>
                                    <span className="text-white/50 text-xs font-bold uppercase tracking-widest">
                                        Member since {memberSince}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Dashboard CTA */}
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link to={config.dashboardLink} className="no-underline shrink-0">
                            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-black px-6 py-3 rounded-2xl transition-all duration-200 border border-white/20 group">
                                <DashIcon className="w-4 h-4" />
                                {config.dashboardLabel}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Tab Navigation ───────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-2 p-1.5 bg-white rounded-[1.75rem] shadow-sm border border-slate-100"
            >
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[1.25rem] font-black text-sm transition-all duration-300 ${
                                isActive
                                    ? 'text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className={`absolute inset-0 rounded-[1.25rem] bg-gradient-to-r ${config.gradient}`}
                                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                />
                            )}
                            <Icon className="w-4 h-4 relative z-10 shrink-0" />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </motion.div>

            {/* ── Tab Panels ──────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                            {/* Card header */}
                            <div className="p-8 pb-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${config.accentLight} flex items-center justify-center`}>
                                        <UserCircle className={`w-6 h-6 ${config.accentText}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Info</h2>
                                        <p className="text-xs text-slate-400 font-medium">Update your name and email address.</p>
                                    </div>
                                </div>

                                {!editMode ? (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setEditMode(true)}
                                        className={`flex items-center gap-2 h-10 px-5 rounded-xl ${config.accentLight} ${config.accentText} font-black text-sm transition-all hover:shadow-md`}
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </motion.button>
                                ) : (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                )}
                            </div>

                            <div className="p-8 space-y-6">
                                <AnimatePresence>
                                    {profileAlert && (
                                        <AlertBanner
                                            type={profileAlert.type}
                                            message={profileAlert.message}
                                            onClose={() => setProfileAlert(null)}
                                        />
                                    )}
                                </AnimatePresence>

                                {loadingUser ? (
                                    <div className="space-y-5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                            <FloatingInput
                                                label="Full Name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                disabled={!editMode}
                                                placeholder="Your full name"
                                                autoComplete="name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                            <FloatingInput
                                                label="Email"
                                                icon={Mail}
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                disabled={!editMode}
                                                placeholder="email@example.com"
                                                autoComplete="email"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                            <FloatingInput
                                                label="Phone"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                disabled={!editMode}
                                                placeholder="e.g. +94 77 123 4567"
                                                autoComplete="tel"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                                            <FloatingInput
                                                label="Address"
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                disabled={!editMode}
                                                placeholder="Your address"
                                                autoComplete="street-address"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                                            <div className="h-14 bg-slate-50 rounded-2xl px-5 flex items-center border border-slate-100">
                                                <Badge className={`${config.badgeBg} font-black px-3 py-1 rounded-lg text-xs border-none`}>
                                                    <Shield className="w-3 h-3 mr-1.5" />
                                                    {config.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</label>
                                            <div className="h-14 bg-slate-50 rounded-2xl px-5 flex items-center border border-slate-100">
                                                <span className="font-bold text-slate-600 text-sm">{memberSince}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {editMode && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 12, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -8, height: 0 }}
                                            className="flex gap-3 pt-2"
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleSaveProfile}
                                                disabled={savingProfile}
                                                className={`flex items-center gap-2 h-12 px-8 rounded-2xl text-white font-black shadow-xl ${config.glow} ${config.accentBg} ${config.accentHover} transition-all disabled:opacity-60`}
                                            >
                                                {savingProfile
                                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                                    : <><Save className="w-4 h-4" /> Save Changes</>
                                                }
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Card>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4"
                        >
                            {[
                                { icon: KeyRound, label: 'Change Password', action: () => setActiveTab('password'), color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
                                user?.isVerified
                                    ? { icon: ShieldCheck, label: 'Account Verified', action: null, color: 'text-emerald-600 bg-emerald-50', disabled: true }
                                    : { icon: Shield, label: 'Verify Identity', action: handleVerifyIdentity, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100', disabled: false },
                                { icon: LogOut, label: 'Sign Out', action: handleLogout, color: 'text-rose-500 bg-rose-50 hover:bg-rose-100' },
                            ].map(({ icon: Icon, label, action, color, disabled }) => (
                                <motion.button
                                    key={label}
                                    whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
                                    whileTap={!disabled ? { scale: 0.98 } : {}}
                                    onClick={action}
                                    disabled={disabled}
                                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl font-bold text-sm transition-all ${color} ${disabled ? 'cursor-default' : 'cursor-pointer'} shadow-sm hover:shadow-md`}
                                >
                                    <Icon className="w-6 h-6" />
                                    {label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {activeTab === 'password' && (
                    <motion.div
                        key="password"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                            <div className="p-8 pb-6 border-b border-slate-50 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${config.accentLight} flex items-center justify-center`}>
                                    <KeyRound className={`w-6 h-6 ${config.accentText}`} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Change Password</h2>
                                    <p className="text-xs text-slate-400 font-medium">Use a strong, unique password for your account.</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                                <AnimatePresence>
                                    {pwAlert && (
                                        <AlertBanner
                                            type={pwAlert.type}
                                            message={pwAlert.message}
                                            onClose={() => setPwAlert(null)}
                                        />
                                    )}
                                    {pwSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex items-center gap-3 p-5 bg-emerald-50 rounded-2xl border border-emerald-200"
                                        >
                                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                                                <Sparkles className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-black text-emerald-800">Password updated!</p>
                                                <p className="text-xs text-emerald-600 font-medium">Your account is now secured with the new password.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                                    <FloatingInput
                                        label="Current Password"
                                        icon={Lock}
                                        type={showCurrentPw ? 'text' : 'password'}
                                        value={currentPw}
                                        onChange={e => setCurrentPw(e.target.value)}
                                        placeholder="Enter your current password"
                                        autoComplete="current-password"
                                        rightElement={
                                            <button type="button" onClick={() => setShowCurrentPw(v => !v)}
                                                className="text-slate-300 hover:text-slate-600 transition-colors p-1">
                                                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        }
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                                        <FloatingInput
                                            label="New Password"
                                            icon={Lock}
                                            type={showNewPw ? 'text' : 'password'}
                                            value={newPw}
                                            onChange={e => setNewPw(e.target.value)}
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                            rightElement={
                                                <button type="button" onClick={() => setShowNewPw(v => !v)}
                                                    className="text-slate-300 hover:text-slate-600 transition-colors p-1">
                                                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            }
                                        />
                                        {newPw && <PasswordStrength password={newPw} />}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                                        <FloatingInput
                                            label="Confirm Password"
                                            icon={Lock}
                                            type={showNewPw ? 'text' : 'password'}
                                            value={confirmPw}
                                            onChange={e => setConfirmPw(e.target.value)}
                                            placeholder="Repeat new password"
                                            autoComplete="new-password"
                                        />
                                        {confirmPw && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`text-xs font-black uppercase tracking-widest ${
                                                    confirmPw === newPw ? 'text-emerald-600' : 'text-rose-500'
                                                }`}
                                            >
                                                {confirmPw === newPw ? '✓ Passwords match' : '✗ Passwords do not match'}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>

                                {/* Security tips */}
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tips for a strong password</p>
                                    {['Use at least 12 characters', 'Mix uppercase, lowercase, numbers, and symbols', 'Avoid personal information or common words'].map(tip => (
                                        <div key={tip} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            {tip}
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={savingPw}
                                    className={`flex items-center gap-2 h-12 px-8 rounded-2xl text-white font-black shadow-xl ${config.glow} ${config.accentBg} ${config.accentHover} transition-all disabled:opacity-60`}
                                >
                                    {savingPw
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                                        : <><ShieldCheck className="w-4 h-4" /> Update Password</>
                                    }
                                </motion.button>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    if (role === 'landlord') return <LandlordLayout>{content}</LandlordLayout>;
    if (role === 'admin') return <AdminLayout>{content}</AdminLayout>;
    return <TenantLayout>{content}</TenantLayout>;
}
