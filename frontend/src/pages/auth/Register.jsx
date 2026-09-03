import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Chrome,
  Facebook,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  UserCircle2,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerUser, googleLogin } from "@/api/auth";
import { REGISTER_MESSAGES, getRegisterErrorMessage } from "@/messages/authMessages";
import AuthStatusMessage from "@/components/common/AuthStatusMessage";
import { getDefaultRouteByRole } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "landlord",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = `${formData.firstName} ${formData.lastName}`.trim();
    if (!name || !formData.email || !formData.password || !formData.role) {
      setError(REGISTER_MESSAGES.missingFields);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await registerUser({
        name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (data?.token && data?.user) {
        dispatch(setCredentials({ token: data.token, user: data.user }));
      }

      setSuccess(REGISTER_MESSAGES.success);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "landlord",
      });

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-primary/20 overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse-custom"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse-custom delay-1000"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center space-y-12 max-w-lg"
        >
          <div className="space-y-8">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center p-6 rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-3xl mx-auto"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                <User className="w-12 h-12 text-white stroke-[2.5px]" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-6xl font-black text-white tracking-tighter leading-none"
              >
                Join Us.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-slate-400 text-xl font-medium leading-relaxed"
              >
                Be part of the next generation of <span className="text-white">smart living</span>.
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col gap-4 max-w-xs mx-auto text-left"
          >
            {["Personalized Experience", "Seamless Communication", "Instant Invoicing"].map(
              (text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-300 tracking-tight">{text}</span>
                </div>
              )
            )}
          </motion.div>
        </motion.div>

        <div className="absolute top-1/4 left-10 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full animate-float delay-1000"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-y-auto pt-24 lg:pt-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-8"
        >
          <motion.div variants={itemVariants} className="space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-all no-underline mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Portal Access
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium">Register your credentials to get access.</p>
          </motion.div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500/20 ring-offset-2 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500/20 ring-offset-2 transition-all font-medium"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
              >
                Email Connection
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500/20 ring-offset-2 transition-all font-medium"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
              >
                Passphrase
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500/20 ring-offset-2 transition-all font-medium"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Designated Role
              </Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value,
                  }))
                }
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { id: "landlord", label: "Landlord", icon: Building2 },
                  { id: "tenant", label: "Tenant", icon: UserCircle2 },
                ].map((role) => (
                  <div key={role.id}>
                    <RadioGroupItem value={role.id} id={role.id} className="peer sr-only" />
                    <Label
                      htmlFor={role.id}
                      className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50/50 peer-data-[state=checked]:text-emerald-600 cursor-pointer transition-all gap-2"
                    >
                      <role.icon className="h-6 w-6" />
                      <span className="font-bold text-sm tracking-tight">{role.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            {error && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AuthStatusMessage type="error" message={error} />
              </motion.div>
            )}
            {success && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AuthStatusMessage type="success" message={success} />
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-lg font-black bg-slate-900 border-none shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:bg-indigo-600 transition-all group overflow-hidden relative disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? REGISTER_MESSAGES.creating : REGISTER_MESSAGES.create}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                <span className="bg-white px-6 text-slate-300">Identity Providers</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full flex justify-center min-h-[44px]">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    setError("");
                    setIsSubmitting(true);
                    try {
                      const data = await googleLogin(credentialResponse.credential);
                      dispatch(setCredentials({ token: data.token, user: data.user }));
                      const userRole = data?.user?.role;
                      const redirectPath = getDefaultRouteByRole(userRole);
                      navigate(redirectPath, { replace: true });
                    } catch (err) {
                      setError(err.message || "Google Sign-Up failed");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  onError={() => {
                    setError("Google Sign-Up failed. Please try again.");
                  }}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="384"
                  logo_alignment="center"
                />
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-center pt-4 text-slate-500 font-medium">
              Existing member?{" "}
              <Link
                to="/login"
                className="font-black text-emerald-600 hover:text-emerald-700 transition-colors no-underline ml-1"
              >
                Enter System
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
