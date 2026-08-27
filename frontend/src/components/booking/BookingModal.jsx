import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, CreditCard, ChevronRight, AlertCircle, Home, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createBooking } from '@/api/bookings';
import { useNavigate } from 'react-router-dom';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export default function BookingModal({ isOpen, onClose, boarding, room }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [checkInDate, setCheckInDate] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);

  if (!isOpen) return null;

  const isRoomBased = boarding?.type === 'room_based';
  const basePrice = isRoomBased ? (room?.price || 0) : (boarding?.price || 0);
  const initialDueAmount = basePrice;
  const totalLeaseValue = basePrice * durationMonths;

  const handleNext = () => {
    if (!checkInDate) {
      setError("Please select a valid check-in date.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const submitBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        boardingId: boarding._id,
        checkInDate,
        durationMonths: Number(durationMonths)
      };
      
      if (isRoomBased && room?._id) {
        payload.roomId = room._id;
      }

      const res = await createBooking(payload);
      setSuccessData(res.booking);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to initialize booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 3 && successData) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Reservation Secured</h3>
          <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm">
            Your stay reservation has been created. A monthly installment schedule has been added to your payment ledger.
          </p>
          <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3 text-sm font-bold text-slate-700 text-left mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">Reference ID</span>
              <span>{successData._id.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">Check-In</span>
              <span>{new Date(successData.checkInDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">1st Month Due</span>
              <span className="text-indigo-600 font-black">Rs. {basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">Installment Schedule</span>
              <span className="text-slate-900">{durationMonths} Month(s) Billed Monthly</span>
            </div>
          </div>
          <Button 
            onClick={() => {
              onClose();
              navigate('/payments');
            }}
            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-colors shadow-xl"
          >
            Open Payment Ledger <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="bg-indigo-50/50 rounded-[2rem] p-6 border border-indigo-100/50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest">Tenancy Terms & Billing</h4>
              <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-[10px]">
                Month-by-Month
              </Badge>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500">Lease Term</span>
                <span className="text-slate-900">{durationMonths} Month(s)</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500">Monthly Rent</span>
                <span className="text-slate-900">Rs. {basePrice.toLocaleString()} / mo</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500">Check-In Date</span>
                <span className="text-slate-900">{new Date(checkInDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500">Total Contract Value</span>
                <span className="text-slate-400 line-through">Rs. {totalLeaseValue.toLocaleString()}</span>
              </div>
              <hr className="border-indigo-100 border-dashed my-3" />
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">Due Now to Reserve</span>
                  <span className="text-xs font-bold text-slate-400">1st Month Rent</span>
                </div>
                <span className="text-3xl font-black text-indigo-700 tracking-tight">
                  Rs. {initialDueAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">💡 Month-by-Month Payment Strategy</p>
            <p>You only pay the 1st month rent to secure this booking. Remaining installments ({durationMonths > 1 ? `${durationMonths - 1} months` : '0'}) will be billed month-by-month on your payments ledger.</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold flex gap-3 items-center">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button 
               variant="outline" 
               className="flex-1 h-14 rounded-2xl font-bold border-slate-200 text-slate-600"
               onClick={() => setStep(1)}
               disabled={loading}
            >
              Modify Dates
            </Button>
            <Button 
               className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl disabled:opacity-50"
               onClick={submitBooking}
               disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm & Reserve'} 
              {!loading && <CreditCard className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      );
    }

    // Step 1
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Date</label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={checkInDate}
                onChange={e => setCheckInDate(e.target.value)}
                className="h-14 pl-12 rounded-2xl font-bold text-slate-700 bg-slate-50 border-slate-100 focus-visible:ring-indigo-500" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lease Term (Months)</label>
            <div className="relative">
              <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                type="number" 
                min="1"
                max="36"
                value={durationMonths}
                onChange={e => setDurationMonths(e.target.value)}
                className="h-14 pl-12 rounded-2xl font-black text-lg text-slate-700 bg-slate-50 border-slate-100 focus-visible:ring-indigo-500" 
              />
            </div>
          </div>
        </div>

        {/* Live Estimate Card */}
        <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block">Monthly Rate</span>
            <span className="text-xl font-black text-slate-900">Rs. {basePrice.toLocaleString()} <span className="text-xs font-bold text-slate-400">/ mo</span></span>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">1st Month Due</span>
            <span className="text-xl font-black text-emerald-600">Rs. {basePrice.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="text-rose-500 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button 
           className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl"
           onClick={handleNext}
        >
          Review Booking Terms <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={step === 3 ? null : onClose}
        />
        
        <motion.div 
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-8 md:p-10 z-10 overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          {step !== 3 && (
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {step !== 3 && (
            <div className="mb-8 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Initiate Booking</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Automated Ledger Placement</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-1">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-black tracking-widest text-[9px] uppercase">
                  {boarding?.boardingName}
                </Badge>
                {isRoomBased && room && (
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-black tracking-widest text-[9px] uppercase">
                    RM {room.roomNumber}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="relative z-10">
            {renderStep()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
