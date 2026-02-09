import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, ArrowRight, Lock, Mail, AlertTriangle, Check, ArrowLeft } from 'lucide-react';

type AuthView = 'login' | 'magic_link' | 'reset_password';

export const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Cooldown logic
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase!.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Registration successful! Check your email to confirm.' });
      } else {
        const { error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred during authentication.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please provide an email address.' });
      return;
    }

    if (cooldown > 0) {
      setMessage({ type: 'error', text: `Please wait ${cooldown}s before retrying.` });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (view === 'magic_link') {
        const { error } = await supabase!.auth.signInWithOtp({ email });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your inbox: a one-time link has been sent.' });
      } else if (view === 'reset_password') {
        const { error } = await supabase!.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Reset instructions have been emailed to you.' });
      }
      setCooldown(60);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send email.' });
    } finally {
      setLoading(false);
    }
  };

  const switchToView = (targetView: AuthView) => {
    setView(targetView);
    setMessage(null);
    // If we have an email already, trigger the action immediately
    if (email) {
      // We need to wait for the state update or just call it directly?
      // Since 'view' state update is async, we can't rely on 'view' inside handleSendEmailAction if we call it immediately.
      // So we'll need to pass the target view or just manually trigger logic.
      // But simpler: just auto-trigger via effect? No, that's messy.
      // Let's just manually trigger the internal logic.
      triggerAutoSend(targetView);
    }
  };

  const triggerAutoSend = async (targetView: AuthView) => {
      if (cooldown > 0) return;
      
      setLoading(true);
      setMessage(null);
      try {
        if (targetView === 'magic_link') {
            const { error } = await supabase!.auth.signInWithOtp({ email });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Check your inbox: a one-time link has been sent.' });
        } else if (targetView === 'reset_password') {
            const { error } = await supabase!.auth.resetPasswordForEmail(email);
            if (error) throw error;
            setMessage({ type: 'success', text: 'Reset instructions have been emailed to you.' });
        }
        setCooldown(60);
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Failed to send email.' });
      } finally {
        setLoading(false);
      }
  };

  // Render Logic
  const isAuthView = view === 'login';

  return (
    <div className="min-h-screen bg-n10 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-b400 rounded-[3px] flex items-center justify-center mx-auto mb-4 shadow-sm text-white text-xl font-bold">
          R
        </div>
        <h1 className="text-2xl font-semibold text-n800 tracking-tight">Retro14</h1>
        <p className="text-n300 text-sm mt-1">Start collaborating with your team</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-[3px] shadow-sm border border-n40 overflow-hidden">
        {/* Form Container */}
        <div className="p-8">
          <h2 className="text-base font-semibold text-n800 mb-6 text-center uppercase tracking-wide">
            {isAuthView 
              ? (isSignUp ? 'Sign up for free' : 'Log in to continue') 
              : (view === 'magic_link' ? 'Magic Link Login' : 'Reset Password')
            }
          </h2>

          {message && (
            <div className={`mb-6 p-3 rounded-[3px] flex items-start gap-2 text-sm ${
              message.type === 'error' ? 'bg-r50 text-r500 border border-r50' : 'bg-g50 text-g400 border border-g50'
            }`}>
              {message.type === 'error' ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> : <Check size={16} className="shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

          {isAuthView ? (
             /* Standard Login / Signup Form */
             <>
                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1">
                    <label className="block text-xs font-semibold text-n300 uppercase tracking-wide">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-n100" />
                        </div>
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 bg-n10 border border-n40 rounded-[3px] text-n800 placeholder-n100 focus:outline-none focus:ring-2 focus:ring-b50 focus:border-b200 transition-all text-sm"
                        placeholder="Enter your email"
                        required
                        />
                    </div>
                    </div>

                    <div className="space-y-1">
                    <label className="block text-xs font-semibold text-n300 uppercase tracking-wide">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={16} className="text-n100" />
                        </div>
                        <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 bg-n10 border border-n40 rounded-[3px] text-n800 placeholder-n100 focus:outline-none focus:ring-2 focus:ring-b50 focus:border-b200 transition-all text-sm"
                        placeholder="Enter your password"
                        required
                        minLength={6}
                        />
                    </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-2 px-4 rounded-[3px] text-white font-medium bg-b400 hover:bg-b500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-b200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6 h-9"
                    >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2 text-sm">
                        {isSignUp ? 'Sign up' : 'Log in'}
                        <ArrowRight size={14} />
                        </span>
                    )}
                    </button>
                </form>

                <div className="mt-4 flex flex-col gap-2 text-[11px] text-[#5E6C84]">
                    <button
                    type="button"
                    onClick={() => switchToView('reset_password')}
                    className="w-full text-left text-[#0052CC] hover:text-[#0747A6] font-semibold"
                    >
                    Reset password
                    </button>
                    <button
                    type="button"
                    onClick={() => switchToView('magic_link')}
                    className="w-full text-left text-[#0052CC] hover:text-[#0747A6] font-semibold"
                    >
                    Send one-time login email
                    </button>
                </div>
             </>
          ) : (
              /* Email Only Form (Reset / Magic Link) */
              <>
                <p className="text-sm text-n500 mb-4">
                  {view === 'reset_password' 
                    ? 'Enter your email address and we’ll send you a link to reset your password.'
                    : 'We’ll email you a magic link for a password-free sign in.'
                  }
                </p>
                
                <form onSubmit={handleSendEmailAction} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-n300 uppercase tracking-wide">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={16} className="text-n100" />
                            </div>
                            <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 bg-n10 border border-n40 rounded-[3px] text-n800 placeholder-n100 focus:outline-none focus:ring-2 focus:ring-b50 focus:border-b200 transition-all text-sm"
                            placeholder="Enter your email"
                            required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || cooldown > 0}
                        className="w-full flex items-center justify-center py-2 px-4 rounded-[3px] text-white font-medium bg-b400 hover:bg-b500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-b200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6 h-9"
                    >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2 text-sm">
                            {cooldown > 0 ? `Resend in ${cooldown}s` : `Send ${view === 'reset_password' ? 'Reset Link' : 'Magic Link'}`}
                            {cooldown === 0 && <ArrowRight size={14} />}
                        </span>
                    )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setView('login');
                            setMessage(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 text-sm text-n500 hover:text-n800 mt-4 font-medium transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Log in
                    </button>
                </form>
              </>
          )}

        </div>
        
        {isAuthView && (
            <div className="py-4 bg-n20 border-t border-n40 text-center">
                <p className="text-sm text-n300">
                {isSignUp ? 'Already have an account?' : "New to Retro14?"}
                <button
                    onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage(null);
                    }}
                    className="ml-1 text-b400 hover:text-b500 hover:underline transition-colors focus:outline-none font-medium"
                >
                    {isSignUp ? 'Log in' : 'Sign up'}
                </button>
                </p>
            </div>
        )}
      </div>
      
      <div className="mt-8 text-n100 text-xs">
        <p>&copy; {new Date().getFullYear()} Retro14. All rights reserved.</p>
      </div>
    </div>
  );
};
