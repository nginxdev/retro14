import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { dataService } from '../services/dataService';
import { User } from '../types';
import { Loader2, Plus, Users, ArrowRight } from 'lucide-react';

interface SprintSelectionProps {
  user: User;
  onSprintSelected: (sprintId: string, sprintName: string, sprintCode: string) => void;
  onCancel?: () => void;
}

export const SprintSelection: React.FC<SprintSelectionProps> = ({ user, onSprintSelected, onCancel }) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [sprintName, setSprintName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { id, code } = await dataService.createSprint(sprintName, user.id);
      onSprintSelected(id, sprintName, code);
    } catch (err: any) {
      setError(err.message || 'Failed to create sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const sprint = await dataService.joinSprint(joinCode.trim());
      if (sprint) {
        onSprintSelected(sprint.id, sprint.name, sprint.code);
      } else {
        setError('Invalid sprint code not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join sprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-n10 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[3px] shadow-sm border border-n40 overflow-hidden">
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-n800">Welcome, {user.name}</h1>
            <p className="text-sm text-n300 mt-1">Choose how you want to start</p>
          </div>

          {mode === 'select' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full flex items-center p-4 border border-n40 rounded-[3px] hover:bg-n20 transition-colors group text-left"
              >
                <div className="w-10 h-10 bg-b50 text-b400 rounded-full flex items-center justify-center mr-4 group-hover:bg-b400 group-hover:text-white transition-colors">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-n800">Create New Sprint</h3>
                  <p className="text-xs text-n300">Start a fresh retrospective board</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-n100 group-hover:text-n300" />
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full flex items-center p-4 border border-n40 rounded-[3px] hover:bg-n20 transition-colors group text-left"
              >
                <div className="w-10 h-10 bg-g50 text-g400 rounded-full flex items-center justify-center mr-4 group-hover:bg-g400 group-hover:text-white transition-colors">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-n800">Join Existing Sprint</h3>
                  <p className="text-xs text-n300">Enter a code to join your team</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-n100 group-hover:text-n300" />
              </button>

              {onCancel && (
                <button
                    onClick={onCancel}
                    className="w-full py-2 px-4 rounded-[3px] text-n300 hover:bg-n20 font-medium text-sm transition-colors text-center mt-2"
                >
                    Cancel and Return to Current Board
                </button>
              )}
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreateSprint}>
              <h2 className="text-sm font-semibold text-n800 uppercase tracking-wide mb-4">Name your Sprint</h2>
              <input
                type="text"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                placeholder="e.g., Sprint 42 Retro"
                className="w-full p-2 bg-n10 border border-n40 rounded-[3px] mb-4 focus:outline-none focus:ring-2 focus:ring-b50 focus:border-b200"
                required
              />
              {error && <p className="text-r400 text-xs mb-4">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="flex-1 py-2 px-4 rounded-[3px] text-n300 hover:bg-n20 font-medium text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 rounded-[3px] bg-b400 text-white hover:bg-b500 font-medium text-sm flex items-center justify-center"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Sprint'}
                </button>
              </div>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoinSprint}>
              <h2 className="text-sm font-semibold text-n800 uppercase tracking-wide mb-4">Enter Sprint Code</h2>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="abcd-defg-hijk"
                className="w-full p-2 bg-n10 border border-n40 rounded-[3px] mb-4 focus:outline-none focus:ring-2 focus:ring-b50 focus:border-b200 font-mono text-center tracking-widest uppercase"
                required
              />
              {error && <p className="text-r400 text-xs mb-4">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="flex-1 py-2 px-4 rounded-[3px] text-n300 hover:bg-n20 font-medium text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 rounded-[3px] bg-b400 text-white hover:bg-b500 font-medium text-sm flex items-center justify-center"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Join Sprint'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
