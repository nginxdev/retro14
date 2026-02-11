import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, ArrowRight, Lock, Mail, AlertTriangle, Check, ArrowLeft, Zap, Users, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type AuthView = 'login' | 'magic_link' | 'reset_password';

export const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Cooldown logic
  const [cooldown, setCooldown] = useState(0);

  // Sync state with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('register')) {
      setView('login');
      setIsSignUp(true);
    } else if (path.includes('forgot-password')) {
      setView('reset_password');
      setIsSignUp(false);
    } else if (path.includes('send-magic-link')) {
      setView('magic_link');
      setIsSignUp(false);
    } else {
      // Default to login
      setView('login');
      setIsSignUp(false);
    }
    setMessage(null);
  }, [location.pathname]);

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

  const switchToView = (targetView: AuthView, targetIsSignUp?: boolean) => {
    if (targetView === 'login') {
        if (targetIsSignUp) {
            navigate('/auth/register');
        } else {
            navigate('/auth/login');
        }
    } else if (targetView === 'reset_password') {
        navigate('/auth/forgot-password');
    } else if (targetView === 'magic_link') {
        navigate('/auth/send-magic-link');
    }
  };

  // Render Logic
  const isAuthView = view === 'login';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-n10 justify-center">
      
      {/* Left Panel: Catchy Content */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-n800 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern Hint */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-b400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-p400 rounded-full opacity-10 blur-3xl"></div>

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <picture>
                  <source srcSet="/logo-auth.svg" type="image/svg+xml" />
                  <img src="/logo-auth-40.png" alt="Retro14" className="w-8 h-8" />
                </picture>
                <span className="font-bold text-xl tracking-tight">Retro14</span>
            </div>
        </div>

        <div className="relative z-10 max-w-md">
            <h1 className="text-4xl font-bold mb-6 tracking-tight leading-tight">
                Transform Your <br/>
                <span className="text-b300">Sprint Retrospectives</span>
            </h1>
            <p className="text-n200 text-lg mb-8 leading-relaxed">
                Connect, collaborate, and improve with your team in real-time. 
                Say goodbye to chaotic feedback and hello to actionable insights.
            </p>

            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-n700 rounded-[3px] text-b300">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-n50">Real-time Collaboration</h3>
                        <p className="text-sm text-n300">See updates instantly as your team votes and discusses.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-n700 rounded-[3px] text-g300">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-n50">Team-Centric</h3>
                        <p className="text-sm text-n300">Designed for agile teams to foster open communication.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-n700 rounded-[3px] text-p300">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-n50">Actionable Feedback</h3>
                        <p className="text-sm text-n300">Turn discussions into trackable action items immediately.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="relative z-10 text-xs text-n400">
            &copy; {new Date().getFullYear()} Retro14 Inc.
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
          <div className="w-full max-w-md bg-white p-8 rounded-[3px] shadow-sm border border-n40">
            {/* Mobile Header (only visible on small screens) */}
            <div className="lg:hidden text-center mb-8">
                 <picture>
                   <source srcSet="/logo-auth.svg" type="image/svg+xml" />
                   <img src="/logo-auth-40.png" alt="Retro14" className="w-10 h-10 mx-auto mb-2" />
                 </picture>
                 <h2 className="text-xl font-bold text-n800">Retro14</h2>
            </div>

            <h2 className="text-xl font-semibold text-n800 mb-2">
                {isAuthView 
                ? (isSignUp ? 'Create your account' : 'Welcome back') 
                : (view === 'magic_link' ? 'Magic Link Login' : 'Reset Password')
                }
            </h2>
            <p className="text-n500 text-sm mb-8">
                {isAuthView 
                    ? (isSignUp ? 'Start your journey with us.' : 'Please enter your details.')
                    : (view === 'reset_password' ? 'We’ll email you instructions to reset your password.' : 'We’ll email you a magic link for a password-free sign in.')
                }
            </p>

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
                        <label className="block text-xs font-semibold text-n500 uppercase tracking-wide">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={16} className="text-n300" />
                            </div>
                            <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 bg-n10 border border-n40 rounded-[3px] text-n800 placeholder-n300 focus:outline-none focus:ring-2 focus:ring-b50 focus:border-b200 transition-all text-sm"
                            placeholder="name@company.com"
                            required
                            />
                        </div>
                        </div>

                        <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-semibold text-n500 uppercase tracking-wide">Password</label>
                             <button
                                type="button"
                                onClick={() => switchToView('reset_password')}
                                className="text-xs text-b400 hover:text-b500 font-medium"
                                >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={16} className="text-n300" />
                            </div>
                            <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 bg-n10 border border-n40 rounded-[3px] text-n800 placeholder-n300 focus:outline-none focus:ring-2 focus:ring-b50 focus:border-b200 transition-all text-sm"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            />
                        </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-2 px-4 rounded-[3px] text-white font-medium bg-b400 hover:bg-b500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-b200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6 h-9 shadow-sm"
                        >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2 text-sm">
                            {isSignUp ? 'Create account' : 'Sign in'}
                            <ArrowRight size={14} />
                            </span>
                        )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-n40"></div>
                        <span className="flex-shrink-0 mx-4 text-n300 text-xs font-medium">OR</span>
                        <div className="flex-grow border-t border-n40"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => switchToView('magic_link')}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-[3px] text-n800 font-medium bg-white border border-n100 hover:bg-n20 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-n100 transition-colors h-9"
                    >
                        <Mail size={16} className="text-n500" />
                        <span className="text-sm">Sign in with Magic Link</span>
                    </button>
                </>
            ) : (
                /* Email Only Form (Reset / Magic Link) */
                <>
                    <form onSubmit={handleSendEmailAction} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-n500 uppercase tracking-wide">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={16} className="text-n300" />
                                </div>
                                <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2 bg-n10 border border-n40 rounded-[3px] text-n800 placeholder-n300 focus:outline-none focus:ring-2 focus:ring-b50 focus:border-b200 transition-all text-sm"
                                placeholder="name@company.com"
                                required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || cooldown > 0}
                            className="w-full flex items-center justify-center py-2 px-4 rounded-[3px] text-white font-medium bg-b400 hover:bg-b500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-b200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6 h-9 shadow-sm"
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
                                switchToView('login');
                            }}
                            className="w-full flex items-center justify-center gap-2 text-sm text-n500 hover:text-n800 mt-4 font-medium transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Back to Log in
                        </button>
                    </form>
                </>
            )}

            {isAuthView && (
               <div className="mt-8 text-center text-sm text-n500">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            onClick={() => {
                                switchToView('login', !isSignUp);
                            }}
                            className="ml-1 text-b400 hover:text-b500 font-semibold focus:outline-none"
                        >
                            {isSignUp ? 'Log in' : 'Sign up'}
                        </button>
                    </p>
                </div> 
            )}

          </div>
      </div>
    </div>
  );
};
