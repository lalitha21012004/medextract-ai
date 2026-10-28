import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, Phone, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/Api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); 

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpDemo, setOtpDemo] = useState(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown Timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(null);
  };

  // 6-Digit OTP Box Management with Auto-Focus Navigation
  const handleOtpInput = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next box
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // One-Click Auto-Fill Handler
  const handleAutoFill = (code) => {
    if (!code) return;
    const digits = code.toString().split('');
    if (digits.length === 6) {
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Submit Step 1 (Send OTP)
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    let formattedPhone = formData.phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`; // Default country code if missing
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/send-otp/', {
        phone_number: formattedPhone,
        email: formData.email,
        full_name: formData.fullName,
      });

      if (response.data?.otp_demo) {
        setOtpDemo(response.data.otp_demo);
      }

      setFormData((prev) => ({ ...prev, phone: formattedPhone }));
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      console.error('Failed to send OTP:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to dispatch verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Step 2 (Verify OTP)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.post('/auth/verify-otp/', {
        phone_number: formData.phone,
        otp: enteredOtp,
      });

      const accessToken = response.data.access;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        if (response.data.user_id) {
          localStorage.setItem('user_id', response.data.user_id);
        }
        navigate('/');
      } else {
        setErrorMessage('Authentication token missing from server response.');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      const serverErr = err.response?.data?.error || err.response?.data?.detail;
      setErrorMessage(serverErr || `Invalid verification code. ${4 - nextAttempts} attempts remaining.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Branding Header */}
        <div className="bg-slate-900 p-6 text-center border-b border-slate-800">
          <div className="inline-flex p-3 bg-blue-600/10 text-blue-400 rounded-xl mb-3">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MedExtract AI</h1>
          <p className="text-xs text-slate-400 mt-1">HIPAA-Compliant Diagnostic Extraction Platform</p>
        </div>

        {/* Auth Mode Switcher */}
        {step === 1 && (
          <div className="flex border-b border-slate-100 bg-slate-50">
            <button
              onClick={() => { setIsLogin(true); setErrorMessage(null); }}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                isLogin ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMessage(null); }}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                !isLogin ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@hospital.org"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210 or +919876543210"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? 'Sending Code...' : (
                  <>
                    {isLogin ? 'Continue with Phone OTP' : 'Register Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION & HELPER VIEWER */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Verify Security Code</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sent to <span className="font-semibold text-slate-800">{formData.phone}</span>
                </p>

                {/* INDUSTRY-LEVEL OTP HELPER VIEWER */}
                {otpDemo && (
                  <div className="mt-4 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-left space-y-2">
                    <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Dev Mode OTP Helper
                      </span>
                      <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-mono">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100">
                      <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                        {otpDemo}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAutoFill(otpDemo)}
                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md font-medium hover:bg-blue-700 transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Fill Code
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 6-Digit OTP Box Grid */}
              <div className="flex justify-center gap-2 my-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpInput(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || attempts >= 4}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 transition shadow-sm"
              >
                {loading ? 'Verifying...' : 'Verify & Access Dashboard'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  ← Edit Phone Number
                </button>

                <button
                  type="button"
                  onClick={handleInitialSubmit}
                  disabled={!canResend}
                  className={`flex items-center gap-1 font-semibold ${
                    canResend ? 'text-blue-600 hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}