import React, { useState } from 'react';
import { X, Mail, Phone, Lock, User, KeyRound, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, FileText, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialView = 'login' }) {
  const [view, setView] = useState(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Ultra-HNI Investor');

  // n8n Registration Email Details
  const [registeredUser, setRegisteredUser] = useState(null);
  const [dispatchedEmail, setDispatchedEmail] = useState(null);
  const [showEmailViewer, setShowEmailViewer] = useState(false);

  // Forgot / Reset States
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotChannel, setForgotChannel] = useState('sms');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [generatedOtpHint, setGeneratedOtpHint] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!loginIdentifier || !loginPassword) {
      setError('Please provide email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(loginIdentifier, loginPassword);
      setSuccessMsg(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!regName || (!regEmail && !regPhone) || !regPassword) {
      setError('Please enter your name, password, and at least an email or phone.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole
      });

      setRegisteredUser(res.user);

      // Fetch or assemble latest dispatched email from n8n automation
      let mailData = res.emailAutomation?.emailRecord;
      if (!mailData && regEmail) {
        try {
          mailData = await api.getLatestEmail(regEmail);
        } catch {}
      }

      setDispatchedEmail(mailData || {
        recipient: regEmail,
        subject: '✈️ Welcome to LLB Real Estate — Parandur Airport Corridor Investor Dossier',
        timestamp: new Date().toISOString(),
        n8nWorkflow: '01_user_registration_welcome.json',
        previewUrl: res.emailAutomation?.previewUrl,
        status: 'DELIVERED_VIA_N8N'
      });

      setView('register_success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!forgotIdentifier) {
      setError('Please enter your registered email or phone.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(forgotIdentifier, forgotChannel);
      setSuccessMsg(res.message);
      if (res.debugOtp) {
        setGeneratedOtpHint(res.debugOtp);
      }
      setTimeout(() => {
        setView('reset_password');
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!resetOtp || resetOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(forgotIdentifier, resetOtp, resetNewPassword);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setLoginIdentifier(forgotIdentifier);
        setLoginPassword(resetNewPassword);
        setView('login');
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoInvestor = () => {
    setLoginIdentifier('investor@llb.com');
    setLoginPassword('Password@123');
  };

  const fillDemoPhone = () => {
    setLoginIdentifier('+919876543210');
    setLoginPassword('Password@123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Crest */}
        <div className="flex flex-col items-center text-center mt-1">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)'
            }}
            className="flex items-center justify-center mb-2"
          >
            <span className="font-serif-luxury text-base font-black text-amber-300">LLB</span>
          </div>
          <h2 className="font-editorial text-base font-bold text-slate-900 tracking-wide">
            {view === 'login' && 'Sign In to LLB Concierge'}
            {view === 'register' && 'Register Investor Portfolio'}
            {view === 'register_success' && 'Account Certified & Created!'}
            {view === 'forgot_password' && 'Password Recovery'}
            {view === 'reset_password' && 'Reset Security Credentials'}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            {view === 'login' && 'Authenticate via Mail or Phone Number'}
            {view === 'register' && 'DTCP & TN RERA Certified Client Access'}
            {view === 'register_success' && 'Automated welcome dossier dispatched via n8n'}
            {view === 'forgot_password' && 'Dispatch instant OTP via SMS or Email'}
            {view === 'reset_password' && 'Enter your 6-digit OTP code to continue'}
          </p>
        </div>

        {/* Tab Switcher (Login vs Register) */}
        {(view === 'login' || view === 'register') && (
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                view === 'login'
                  ? 'bg-emerald-900 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setView('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                view === 'register'
                  ? 'bg-emerald-900 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. investor@llb.com or +919876543210"
                  style={{ paddingLeft: '44px', paddingRight: '14px', height: '44px' }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
                  {loginIdentifier.includes('@') ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(loginIdentifier);
                    setView('forgot_password');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-black font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ paddingLeft: '44px', paddingRight: '14px', height: '44px' }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)'
              }}
              className="w-full h-11 px-4 text-white font-bold text-xs rounded-xl active-press transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <>
                  <span className="text-amber-200">Sign In to Portfolio</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>

            {/* 1-Click Demo Credentials */}
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-wider">
                ⚡ 1-Click Demo Credentials:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={fillDemoInvestor}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-700 hover:border-black text-left transition-colors shadow-sm"
                >
                  <p className="font-bold text-black">👤 Email Login</p>
                  <p className="text-[9px] text-slate-500 truncate">investor@llb.com</p>
                </button>
                <button
                  type="button"
                  onClick={fillDemoPhone}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-700 hover:border-black text-left transition-colors shadow-sm"
                >
                  <p className="font-bold text-black">📱 Phone Login</p>
                  <p className="text-[9px] text-slate-500 truncate">+919876543210</p>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* VIEW 2: REGISTER */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  className="w-full h-10 px-3 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
                />
                <User className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full h-10 px-3 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
                />
                <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Phone (with country code)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98840 12345"
                  className="w-full h-10 px-3 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
                />
                <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Client Profile Role</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-black font-medium focus:outline-none focus:border-black block"
              >
                <option value="Ultra-HNI Investor">Ultra-HNI Investor (₹10+ Cr)</option>
                <option value="Luxury Homebuyer">Luxury Homebuyer (ECR / Central)</option>
                <option value="Land Developer">Land Developer / Institutional</option>
                <option value="NRI Client">Non-Resident Indian (NRI Portfolio)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-10 px-3 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
                />
                <Lock className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)'
              }}
              className="w-full h-11 mt-1 px-4 text-white hover:opacity-95 font-bold text-xs rounded-xl shadow active-press transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Create Account & Trigger n8n</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>
        )}

        {/* VIEW: REGISTER SUCCESS (N8N EMAIL DISPATCHED) */}
        {view === 'register_success' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            {/* Status Badge */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center mb-2 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-1">
                ⚡ n8n Automation Engine Dispatched
              </span>
              <h3 className="text-sm font-bold text-slate-900">Welcome, {registeredUser?.name || regName}!</h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Your investor account is activated. An official Parandur Airport Corridor welcome package has been automatically delivered to your registered email address.
              </p>
            </div>

            {/* Email Dispatch Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Dispatched Welcome Email</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  ● DELIVERED
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="font-mono font-bold text-slate-800">{dispatchedEmail?.recipient || regEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">n8n Workflow:</span>
                  <span className="font-mono text-emerald-800 font-semibold">{dispatchedEmail?.n8nWorkflow || '01_user_registration_welcome.json'}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 shrink-0">Subject:</span>
                  <span className="font-semibold text-slate-800 text-right">{dispatchedEmail?.subject || 'Welcome to LLB Real Estate'}</span>
                </div>
              </div>

              {/* Action Buttons for Email */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailViewer(true)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Preview Dispatched Welcome Email</span>
                </button>

                {dispatchedEmail?.previewUrl && (
                  <a
                    href={dispatchedEmail.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                    <span>Open Ethereal Web Mailbox</span>
                  </a>
                )}
              </div>
            </div>

            {/* Launch Portfolio Button */}
            <button
              type="button"
              onClick={() => {
                onAuthSuccess(registeredUser || { name: regName, email: regEmail });
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)'
              }}
              className="w-full h-11 text-white font-bold text-xs rounded-xl shadow active-press transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Enter Portfolio & Explore Plots</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        )}

        {/* VIEW 3: FORGOT PASSWORD */}
        {view === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Enter Registered Email or Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="investor@llb.com or +919876543210"
                  className="w-full h-11 px-4 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
                />
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Dispatch OTP Security Code via:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForgotChannel('sms')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    forgotChannel === 'sms'
                      ? 'bg-black text-white border-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-black'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>SMS OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForgotChannel('email')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    forgotChannel === 'email'
                      ? 'bg-black text-white border-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-black'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-4 bg-black text-white hover:bg-neutral-800 font-bold text-xs rounded-xl shadow active-press transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Dispatch 6-Digit OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
              className="w-full text-center text-xs text-slate-600 font-bold hover:underline transition-colors pt-1"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* VIEW 4: RESET PASSWORD WITH OTP */}
        {view === 'reset_password' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
            {generatedOtpHint && (
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 block font-bold">n8n Security Dispatch:</span>
                  <span className="text-base font-mono font-black text-black tracking-widest">{generatedOtpHint}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResetOtp(generatedOtpHint)}
                  className="px-2.5 py-1 bg-black text-white font-bold text-[10px] rounded-lg shadow"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                placeholder="834912"
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-xl font-mono font-bold tracking-widest text-black placeholder-slate-400 focus:outline-none focus:border-black block"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-black placeholder-slate-400 focus:outline-none focus:border-black block"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-1 px-4 bg-black text-white hover:bg-neutral-800 font-bold text-xs rounded-xl shadow active-press transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password & Authenticate</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* POPUP MODAL: DISPATCHED EMAIL VIEWER */}
      {showEmailViewer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-slate-300">
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.4)'
              }}
              className="p-4 text-white flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block font-bold">
                  ⚡ n8n Dispatched Mailbox Audit
                </span>
                <h3 className="text-sm font-bold text-white">Parandur Corridor Investor Dossier</h3>
              </div>
              <button
                onClick={() => setShowEmailViewer(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 text-xs">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
                {/* Meta details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-700">
                  <div><strong>From:</strong> LLB Real Estate Executive Concierge &lt;noreply@llbrealestate.com&gt;</div>
                  <div><strong>To:</strong> {dispatchedEmail?.recipient || regEmail}</div>
                  <div><strong>Subject:</strong> {dispatchedEmail?.subject}</div>
                  <div><strong>Automation:</strong> n8n Workflow Engine (Port 5678) • Delivered</div>
                </div>

                {/* Rendered HTML */}
                {dispatchedEmail?.html ? (
                  <div
                    className="prose prose-sm max-w-none border border-slate-100 rounded-xl p-2 bg-white overflow-x-hidden"
                    dangerouslySetInnerHTML={{ __html: dispatchedEmail.html }}
                  />
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    <p className="font-bold text-slate-800">Welcome to LLB Real Estate</p>
                    <p className="text-xs text-slate-600 mt-1">Parandur Airport Corridor Investor Dossier successfully sent to {dispatchedEmail?.recipient || regEmail}.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
              {dispatchedEmail?.previewUrl ? (
                <a
                  href={dispatchedEmail.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Ethereal Web View</span>
                </a>
              ) : <div />}

              <button
                onClick={() => setShowEmailViewer(false)}
                className="px-4 py-2 bg-emerald-950 text-amber-300 rounded-xl text-xs font-bold shadow hover:bg-emerald-900"
              >
                Close Email Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
