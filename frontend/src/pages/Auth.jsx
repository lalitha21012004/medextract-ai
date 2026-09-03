import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, Phone, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Credentials Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  // OTP State Management
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Countdown timer for OTP Resend
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

  // Phone Validation (E.164 / International Standard)
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    let newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input box
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // Submit Handler for Step 1
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isLogin && !formData.fullName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrorMessage('Please enter a valid phone number with country code (e.g., +91 9876543210).');
      return;
    }

    setLoading(true);

    // Simulate sending SMS OTP via Backend (Twilio / Firebase)
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimer(60);
      setCanResend(false);
    }, 1200);
  };

  // Verify OTP Handler with Retry Logic
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (attempts >= 3) {
      setErrorMessage('Too many failed attempts. Please request a new OTP.');
      return;
    }

    setLoading(true);

    // Simulated Verification against Backend (Mock valid OTP: 123456)
    setTimeout(() => {
      setLoading(false);
      if (enteredOtp === '123456') {
        // Success -> Redirect to Dashboard
        navigate('/');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setErrorMessage('Maximum attempts reached. Resend OTP to try again.');
        } else {
          setErrorMessage(`Invalid OTP code. ${3 - newAttempts} attempts remaining.`);
        }
      }
    }, 1000);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setAttempts(0);
    setTimer(60);
    setCanResend(false);
    setErrorMessage('');
    // Trigger API call to resend SMS
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Top Header & Branding */}
        <div className="bg-slate-900 p-6 text-center border-b border-slate-800">
          <div className="inline-flex p-3 bg-blue-600/10 text-blue-400 rounded-xl mb-3">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MedExtract AI</h1>
          <p className="text-xs text-slate-400 mt-1">HIPAA-Compliant Diagnostic Extraction Platform</p>
        </div>

        {/* Unified Tab Selector (Login vs Register) */}
        {step === 1 && (
          <div className="flex border-b border-slate-100 bg-slate-50">
            <button
              onClick={() => { setIsLogin(true); setErrorMessage(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                isLogin ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMessage(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                !isLogin ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: LOGIN / REGISTER FORM */}
          {step === 1 ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
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
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Mobile Phone Number (OTP Verification)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
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
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? 'Sending Security Code...' : (
                  <>
                    {isLogin ? 'Continue with Phone OTP' : 'Register Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: 6-DIGIT OTP VERIFICATION MODAL */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Verify Your Phone</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the 6-digit verification code sent to <br />
                  <span className="font-semibold text-slate-800">{formData.phone}</span>
                </p>
                <p className="text-[11px] text-blue-600 font-mono mt-1">(Demo Code: 123456)</p>
              </div>

              {/* 6-Digit OTP Box Grid */}
              <div className="flex justify-center gap-2 my-4">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || attempts >= 3}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 transition"
              >
                {loading ? 'Verifying Code...' : 'Verify & Access Dashboard'}
              </button>

              {/* Resend OTP & Timer Controls */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Change phone number
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`flex items-center gap-1 font-semibold ${
                    canResend ? 'text-blue-600 hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}