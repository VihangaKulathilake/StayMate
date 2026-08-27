import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import {
  Home,
  Mail,
  Lock,
  Chrome,
  Facebook,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { loginUser, googleLogin } from "@/api/auth";
import { LOGIN_MESSAGES, getLoginErrorMessage } from "@/messages/authMessages";
import AuthStatusMessage from "@/components/common/AuthStatusMessage";
import { getDefaultRouteByRole, saveAuthSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

    try {
      setIsSubmitting(true);
      const data = await loginUser(formData);

      dispatch(setCredentials({ token: data.token, user: data.user }));
      const userRole = data?.user?.role;
      const redirectPath = getDefaultRouteByRole(userRole);

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-custom"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px] animate-pulse-custom delay-1000"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center space-y-12 max-w-lg"
        >
          <div className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center p-5 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-3xl"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                <Home className="w-12 h-12 text-white stroke-[2.5px]" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl font-black text-white tracking-tighter leading-none"
              >
                StayMate.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-xl font-medium leading-relaxed"
              >
                The modern standard for{" "}
                <span className="text-white border-b-2 border-primary/50">
                  boarding management
                </span>
                .
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: "Real-time Tracker", icon: CheckCircle2 },
              { label: "Cloud Security", icon: CheckCircle2 },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm"
              >
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  {feature.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 backdrop-blur-md rounded-full border border-white/10 animate-float"></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 bg-primary/20 backdrop-blur-md rounded-2xl rotate-12 animate-float delay-1000"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-10"
        >
          <motion.div variants={itemVariants} className="space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-all no-underline mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return Home
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 font-medium">
              Please enter your details to continue.
            </p>
          </motion.div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20 ring-offset-2 transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label
                    htmlFor="password"
                    className="text-xs font-black uppercase tracking-widest text-slate-400"
                  >
                    Password
                  </Label>
                  <Link
                    to="#forgot"
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors no-underline"
                  >
                    Forgot Key?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20 ring-offset-2 transition-all font-medium"
                  />
                </div>
              </div>
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

            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  className="rounded-lg w-5 h-5 border-slate-300 data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-bold text-slate-500 cursor-pointer select-none"
                >
                  Keep me secure
                </label>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? LOGIN_MESSAGES.authenticating : LOGIN_MESSAGES.authenticate}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                <span className="bg-white px-6 text-slate-300">Third Party Entry</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
              <div className="flex justify-center w-full">
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
                      setError(err.message || "Google Authentication failed");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  onError={() => {
                    setError("Google Sign-In failed. Please try again.");
                  }}
                  width="384px" /* Fits the container width */
                />
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-center pt-6 text-slate-500 font-medium">
              New to the system?{" "}
              <Link
                to="/signup"
                className="font-black text-primary hover:text-primary/80 transition-colors no-underline ml-1"
              >
                Establish Account
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
