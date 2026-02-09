import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, ArrowRight, Lock, Mail, AlertTriangle, Check } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Only used for signUp/signIn with password
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [magicSending, setMagicSending] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

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

  const handleSendMagicLink = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Provide an email to receive the magic link.' });
      return;
    }
    setMagicSending(true);
    setMessage(null);
    try {
      const { error } = await supabase!.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Check your inbox: a one-time link has been sent.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send the magic link.' });
    } finally {
      setMagicSending(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Provide an email to receive a reset link.' });
      return;
    }
    setResettingPassword(true);
    setMessage(null);
    try {
      const { error } = await supabase!.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Reset instructions have been emailed to you.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send the reset email.' });
    } finally {
      setResettingPassword(false);
    }
  };

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
            {isSignUp ? 'Sign up for free' : 'Log in to continue'}
          </h2>

          {message && (
            <div className={`mb-6 p-3 rounded-[3px] flex items-start gap-2 text-sm ${
              message.type === 'error' ? 'bg-r50 text-r500 border border-r50' : 'bg-g50 text-g400 border border-g50'
            }`}>
              {message.type === 'error' ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> : <Check size={16} className="shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

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
              onClick={handlePasswordReset}
              disabled={resettingPassword || !email}
              className="w-full text-left text-[#0052CC] hover:text-[#0747A6] font-semibold"
            >
              {resettingPassword ? 'Sending reset link…' : 'Reset password'}
            </button>
            <button
              type="button"
              onClick={handleSendMagicLink}
              disabled={magicSending || !email}
              className="w-full text-left text-[#0052CC] hover:text-[#0747A6] font-semibold"
            >
              {magicSending ? 'Sending magic link…' : 'Send one-time login email'}
            </button>
          </div>
        </div>
        
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
      </div>
      
      <div className="mt-8 text-n100 text-xs">
        <p>&copy; {new Date().getFullYear()} Retro14. All rights reserved.</p>
      </div>
    </div>
  );
};
