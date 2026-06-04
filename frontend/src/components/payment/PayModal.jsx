import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, CreditCard, Landmark, ChevronRight, AlertCircle, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPayPalClientId, createPayPalOrder, capturePayPalOrder } from "@/api/payments";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export default function PayModal({ isOpen, onClose, payment, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = React.useState("paypal"); // "paypal" or "cash"
  const [sdkLoaded, setSdkLoaded] = React.useState(false);
  const [sdkError, setSdkError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const conversionRate = 1 / 300;
  const amountInUSD = (payment?.amount * conversionRate).toFixed(2);

  // Dynamic script loader for PayPal SDK
  React.useEffect(() => {
    if (!isOpen || !payment) return;
    
    let active = true;
    const initPayPal = async () => {
      try {
        setLoading(true);
        const clientId = await getPayPalClientId();
        
        if (!active) return;

        if (window.paypal) {
          setSdkLoaded(true);
          setLoading(false);
          return;
        }

        const scriptId = "paypal-sdk-script";
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
          script.async = true;
          script.onload = () => {
            if (active) {
              setSdkLoaded(true);
              setLoading(false);
            }
          };
          script.onerror = (err) => {
            console.error("Failed to load PayPal SDK script", err);
            if (active) {
              setSdkError("Failed to load PayPal SDK. Please try again.");
              setLoading(false);
            }
          };
          document.body.appendChild(script);
        } else {
          script.addEventListener("load", () => {
            if (active) {
              setSdkLoaded(true);
              setLoading(false);
            }
          });
        }
      } catch (err) {
        console.error("PayPal config fetch error:", err);
        if (active) {
          setError("Failed to load payment gateway configuration.");
          setLoading(false);
        }
      }
    };

    initPayPal();

    return () => {
      active = false;
    };
  }, [isOpen, payment]);

  // Handle rendering of PayPal Smart Buttons
  React.useEffect(() => {
    if (!sdkLoaded || paymentMethod !== "paypal" || isSuccess || !isOpen) return;

    let buttonInstance = null;
    const container = document.getElementById("paypal-button-container");

    if (container) {
      container.innerHTML = ""; // Clean container

      try {
        buttonInstance = window.paypal.Buttons({
          createOrder: async () => {
            setError(null);
            setLoading(true);
            try {
              const { orderId } = await createPayPalOrder(payment._id);
              setLoading(false);
              return orderId;
            } catch (err) {
              setLoading(false);
              setError(err.message || "Failed to start PayPal order creation.");
              throw err;
            }
          },
          onApprove: async (data, actions) => {
            setLoading(true);
            setError(null);
            try {
              const res = await capturePayPalOrder(payment._id, data.orderID);
              setLoading(false);
              if (res.payment?.status === "completed") {
                setIsSuccess(true);
                setTimeout(() => {
                  onSuccess();
                }, 3000);
              } else {
                setError("Payment was captured but status is not completed.");
              }
            } catch (err) {
              setLoading(false);
              setError(err.message || "Failed to confirm payment capture.");
            }
          },
          onError: (err) => {
            console.error("PayPal Smart Button Error:", err);
            setError("PayPal transaction failed. Please ensure your sandbox accounts are aligned.");
          },
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
            height: 48,
          },
        });

        buttonInstance.render("#paypal-button-container");
      } catch (err) {
        console.error("Error rendering buttons:", err);
      }
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [sdkLoaded, paymentMethod, isSuccess, isOpen, payment]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Glass backdrop */}
        <motion.div 
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={isSuccess ? null : onClose}
        />
        
        <motion.div 
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 z-10 overflow-hidden border border-slate-100"
        >
          {/* Subtle decoration overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          {/* Close button */}
          {!isSuccess && (
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Success State */}
          {isSuccess ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-100/80 flex items-center justify-center mb-6 relative">
                <motion.div 
                  className="absolute inset-0 rounded-full bg-emerald-200"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <CheckCircle2 className="w-12 h-12 text-emerald-600 relative z-10" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Payment Secured</h3>
              <p className="text-slate-500 font-bold mb-8 max-w-sm">
                Your transaction has been approved. Your booking is officially locked and approved.
              </p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left text-sm font-bold text-slate-700 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase tracking-widest text-[10px]">Reference Code</span>
                  <span>{payment._id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase tracking-widest text-[10px]">Method</span>
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> PayPal Digital</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase tracking-widest text-[10px]">Gross Amount</span>
                  <span className="text-emerald-600 font-black">Rs. {payment.amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full mt-8 overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8 }}
                />
              </div>
            </motion.div>
          ) : (
            <div>
              {/* Header */}
              <div className="mb-6 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Secure Settlement</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Lease Ledger Placement</p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Invoice Total</span>
                    <span className="text-slate-950 text-base font-black">Rs. {payment?.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold mt-1 text-slate-400 text-xs">
                    <span>PayPal USD Value</span>
                    <span>${amountInUSD} USD <span className="text-[9px] font-normal">(@ 300 LKR)</span></span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-6">
                <button 
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${paymentMethod === "paypal" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                >
                  <CreditCard className="w-4 h-4" /> PayPal Gateway
                </button>
                <button 
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${paymentMethod === "cash" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                >
                  <Landmark className="w-4 h-4" /> Cash / Bank
                </button>
              </div>

              {/* Content Panels */}
              <div className="min-h-[160px]">
                {loading && !sdkLoaded && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 font-bold gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-xs uppercase tracking-widest font-black">Establishing payment bridge...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold flex gap-3 items-start mb-4 border border-rose-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {sdkError && (
                  <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold flex gap-3 items-start mb-4 border border-rose-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{sdkError}</span>
                  </div>
                )}

                {paymentMethod === "paypal" ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-bold leading-relaxed mb-4">
                      Pay securely with your PayPal account or via debit/credit card. Funds are captured immediately and your lease booking is approved automatically.
                    </p>
                    <div id="paypal-button-container" className="w-full relative z-10" />
                  </div>
                ) : (
                  <div className="space-y-4 p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/50">
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Physical Settlement Protocols</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      To settle this invoice in cash or bank transfer, please coordinate directly with the landlord. Once they verify your physical receipt, they will manually approve your stay.
                    </p>
                    <div className="pt-2">
                      <Button variant="outline" className="w-full h-11 rounded-xl border-indigo-100 text-indigo-700 bg-white font-bold hover:bg-indigo-50 text-xs">
                        Message Landlord for details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
