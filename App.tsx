
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { RetroPage } from './pages/RetroPage';
import { Terms } from './pages/Terms';
import { SprintSelection } from './components/SprintSelection';
import { Auth } from './components/Auth';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { dataService } from './services/dataService';
import { Session } from '@supabase/supabase-js';
import { User } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

// Helper to generate a consistent color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

// Wrapper for the Board Route to handle data fetching
const BoardRoute = ({ user, onSignOut }: { user: User, onSignOut: () => void }) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState<{ id: string, name: string, code: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      if (!/^[a-z0-9-]{4,20}$/i.test(code)) {
        navigate('/', { replace: true });
        return;
      }
      
      const normalizedCode = code.toLowerCase();
      setLoading(true);
      
      dataService.joinSprint(normalizedCode).then((s) => {
        if (s) {
          setSprint({ id: s.id, name: s.name, code: s.code });
          // Ensure participant record
          supabase!
             .from("sprint_participants")
             .upsert([{ sprint_id: s.id, user_id: user.id }], { onConflict: 'sprint_id,user_id' })
             .then(({ error }) => {
                 if (error) console.error("Error ensuring participant:", error);
             });
        } else {
             console.warn('Board not found');
             navigate('/', { replace: true });
        }
        setLoading(false);
      });
    }
  }, [code, user.id, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-n10">
        <Loader2 className="animate-spin text-b400" size={32} />
      </div>
    );
  }

  if (!sprint) return null;

  return (
    <RetroPage 
      user={user} 
      sprintId={sprint.id} 
      sprintName={sprint.name}
      sprintCode={sprint.code}
      onSwitchSprint={() => navigate('/')}
      onSignOut={onSignOut}
    />
  );
};

// Component to handle redirect to login while preserving the return location
const RequireAuth = () => {
  const location = useLocation();
  return <Navigate to="/auth/login" state={{ from: location }} replace />;
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-n10 p-4 text-center">
        <AlertCircle size={48} className="text-r500 mb-4" />
        <h1 className="text-2xl font-bold text-n800 mb-2">Configuration Required</h1>
        <p className="text-n600 max-w-md">
          Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file to connect to Supabase.
        </p>
      </div>
    );
  }

  useEffect(() => {
    // 1. Check active session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Fetch User Profile from DB & Subscribe to Changes
  useEffect(() => {
    if (session?.user?.id) {
        // Initial Fetch
        dataService.getUser(session.user.id).then(async (u) => {
            if (u) {
                setDbUser(u);
            } else {
                // Auto-create profile if missing
                const defaultName = session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User';
                const defaultColor = stringToColor(session.user.id);
                const newUser: User = {
                    id: session.user.id,
                    name: defaultName,
                    color: defaultColor,
                    role: 'Team Member',
                    isHandRaised: false
                };
                await dataService.upsertUser(newUser);
                setDbUser(newUser);
            }
        });

        // Realtime Subscription
        const channel = supabase!.channel(`user:${session.user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'retro_users',
                    filter: `id=eq.${session.user.id}`
                },
                (payload) => {
                    if (payload.new) {
                         const u = payload.new as any;
                         setDbUser({
                             id: u.id,
                             name: u.name,
                             color: u.color,
                             role: u.role,
                             isHandRaised: u.is_hand_raised || false,
                             handRaisedAt: u.hand_raised_at ? new Date(u.hand_raised_at).getTime() : undefined,
                         });
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }
  }, [session]);

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    setDbUser(null);
    navigate('/auth/login');
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-n10">
        <Loader2 className="animate-spin text-b400" size={32} />
      </div>
    );
  }

  // Define User object
  const defaultName = session?.user.user_metadata.full_name || session?.user.email?.split('@')[0] || 'User';
  const defaultColor = session?.user.id ? stringToColor(session.user.id) : '#000000';

  const appUser: User = session ? {
    id: session.user.id,
    name: dbUser?.name || defaultName,
    role: dbUser?.role || 'Team Member',
    color: dbUser?.color || defaultColor,
    isHandRaised: dbUser?.isHandRaised || false,
    handRaisedAt: dbUser?.handRaisedAt
  } : { id: 'temp', name: 'temp', role: 'Team Member', color: '#000', isHandRaised: false };

  const redirectPath = location.state?.from?.pathname || "/";

  return (
    <Routes>
      <Route path="/terms" element={<Terms />} />
      <Route path="/auth/*" element={!session ? <Auth /> : <Navigate to={redirectPath} replace />} />
      <Route path="/" element={
        session ? (
            <SprintSelection 
                user={appUser} 
                onSprintSelected={(id, name, code) => navigate(`/${code}`)} 
                onCancel={undefined}
            />
        ) : <Navigate to="/auth/login" state={{ from: location }} replace />
      } />
      <Route path="/:code" element={
        session ? (
            <BoardRoute user={appUser} onSignOut={handleSignOut} />
        ) : <RequireAuth />
      } />
    </Routes>
  );
};

export default App;
