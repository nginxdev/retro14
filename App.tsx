
import React, { useEffect, useState } from 'react';
import { RetroPage } from './pages/RetroPage';
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

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isSwitchingSprint, setIsSwitchingSprint] = useState(false);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [urlLoading, setUrlLoading] = useState(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const possibleCode = pathParts[0];
    return !!(possibleCode && /^[A-Z0-9-]{4,20}$/i.test(possibleCode));
  });

  const [currentSprint, setCurrentSprint] = useState<{ id: string, name: string, code: string } | null>(() => {
    try {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const possibleCode = pathParts[0];

      // If we have a URL code, don't use localStorage on initial load
      if (possibleCode && /^[A-Z0-9-]{4,20}$/i.test(possibleCode)) {
        return null;
      }

      const saved = localStorage.getItem('retro14-sprint');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse sprint from local storage', e);
      return null;
    }
  });

  // Sync currentSprint to localStorage and URL
  useEffect(() => {
    if (currentSprint) {
      localStorage.setItem('retro14-sprint', JSON.stringify(currentSprint));
      if (window.location.pathname !== `/${currentSprint.code}`) {
        window.history.pushState(null, '', `/${currentSprint.code}`);
      }
    } else if (!urlLoading) {
      localStorage.removeItem('retro14-sprint');
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [currentSprint, urlLoading]);
 
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

  // 2.5 URL Routing: Check for sprint code in URL
  const checkUrlForSprint = async () => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const possibleCode = pathParts[0];

    if (possibleCode && /^[a-z0-9-]{4,20}$/i.test(possibleCode)) {
      const normalizedCode = possibleCode.toLowerCase();
      const currentCode = currentSprint?.code?.toLowerCase();

      if (!currentSprint || normalizedCode !== currentCode) {
        setUrlLoading(true);
        console.log('Fetching board from URL:', normalizedCode);
        try {
          const sprint = await dataService.joinSprint(normalizedCode);
          if (sprint) {
            setCurrentSprint({ id: sprint.id, name: sprint.name, code: sprint.code });
          } else {
            console.warn('Board from URL not found, falling back');
          }
        } finally {
          setUrlLoading(false);
        }
      } else {
        setUrlLoading(false);
      }
    } else {
      setUrlLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    setCurrentSprint(null);
    setDbUser(null);
  };

  useEffect(() => {
    checkUrlForSprint();

    // Listen for URL changes (popstate)
    const handlePopState = () => checkUrlForSprint();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentSprint?.code]);

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

  // 3.5 Ensure participant record exists for current sprint
  useEffect(() => {
    if (session?.user?.id && currentSprint?.id && dbUser && isSupabaseConfigured && supabase) {
        console.log('Ensuring participant record for:', currentSprint.name);
        supabase
            .from("sprint_participants")
            .upsert([{ sprint_id: currentSprint.id, user_id: session.user.id }], { onConflict: 'sprint_id,user_id' })
            .then(({ error }) => {
                if (error) {
                    console.error("Error ensuring participant record:", error);
                } else {
                    console.log('Participant record confirmed');
                }
            });
    }
  }, [session, currentSprint, dbUser]);

  if (authLoading || urlLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-n10">
        <Loader2 className="animate-spin text-b400" size={32} />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // Map Supabase user to App User, preferring DB data
  const defaultName = session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User';
  const defaultColor = stringToColor(session.user.id);

  const appUser: User = {
    id: session.user.id,
    name: dbUser?.name || defaultName,
    role: dbUser?.role || 'Team Member',
    color: dbUser?.color || defaultColor,
    isHandRaised: dbUser?.isHandRaised || false,
    handRaisedAt: dbUser?.handRaisedAt
  };

  if (!currentSprint || isSwitchingSprint) {
    return (
      <SprintSelection 
        user={appUser} 
        onSprintSelected={(id, name, code) => {
            setCurrentSprint({ id, name, code });
            setIsSwitchingSprint(false);
        }} 
        onCancel={currentSprint ? () => setIsSwitchingSprint(false) : undefined}
      />
    );
  }

  return (
    <RetroPage 
      user={appUser} 
      sprintId={currentSprint.id} 
      sprintName={currentSprint.name}
      sprintCode={currentSprint.code}
      onSwitchSprint={() => setIsSwitchingSprint(true)}
      onSignOut={handleSignOut}
    />
  );
};

export default App;
