'use client';

import React, { useState } from 'react';
import { X, Flame, Zap, Check, Grid, Settings, Video, ShieldCheck } from 'lucide-react';

interface PlaceholdersModalProps {
  type: 'fred' | 'integrations' | 'settings' | null;
  onClose: () => void;
}

export const PlaceholdersModal: React.FC<PlaceholdersModalProps> = ({ type, onClose }) => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [joined, setJoined] = useState(false);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-100 font-bold text-sm">
            {type === 'fred' && <Flame className="w-5 h-5 text-purple-400" />}
            {type === 'integrations' && <Grid className="w-5 h-5 text-indigo-400" />}
            {type === 'settings' && <Settings className="w-5 h-5 text-slate-400" />}
            <span>
              {type === 'fred' && 'Invite Fred (Fireflies Bot) to Live Call'}
              {type === 'integrations' && 'Apps & CRM Integrations'}
              {type === 'settings' && 'Workspace & Account Settings'}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-xs space-y-4">
          
          {/* FRED BOT LIVE JOIN MODAL */}
          {type === 'fred' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Paste your Zoom, Google Meet, or Microsoft Teams web link below. Fred will automatically join the call as a silent attendee and record, transcribe, and extract action items in real-time.
              </p>

              {joined ? (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50 text-purple-200 space-y-2 text-center">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center mx-auto animate-pulse">
                    F
                  </div>
                  <div className="font-bold text-sm">Fred Bot Dispatched!</div>
                  <p className="text-[11px] text-purple-300">
                    Fred is joining your live call in 30 seconds. Your transcript will appear in the library automatically after the meeting ends.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (meetingUrl.trim()) setJoined(true);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Live Meeting URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://meet.google.com/abc-defg-hij or Zoom URL"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="w-full bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-900/40"
                    >
                      Invite Fred Now
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* INTEGRATIONS MODAL */}
          {type === 'integrations' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Connect Fireflies.ai with your team workflow tools to automatically sync meeting summaries, action items, and transcripts.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Slack', status: 'Connected', desc: 'Post summaries to #meetings', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                  { name: 'Salesforce', status: 'Connected', desc: 'Sync CRM contacts & log calls', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                  { name: 'HubSpot', status: 'Available', desc: 'Auto-map lead conversation notes', color: 'bg-slate-900 border-slate-800 text-slate-400' },
                  { name: 'Notion', status: 'Connected', desc: 'Export AI notes to databases', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                  { name: 'Zoom', status: 'Connected', desc: 'Cloud recording auto-transcribe', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                  { name: 'Google Meet', status: 'Connected', desc: 'Chrome extension bot auto-join', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' }
                ].map((app) => (
                  <div key={app.name} className={`p-3.5 rounded-xl border ${app.color} space-y-1`}>
                    <div className="flex items-center justify-between font-bold text-slate-100">
                      <span>{app.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{app.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS MODAL */}
          {type === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">Default Logged-In Account</div>
                <div className="text-xs text-slate-400">
                  User: <strong className="text-slate-200">Alex Rivera</strong> (alex@fireflies.ai)<br />
                  Role: Workspace Admin & Product Lead<br />
                  Storage Plan: Enterprise Unlimited
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200">Bot Preferences</div>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-purple-600" />
                  Auto-join calendar meetings with video link
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-purple-600" />
                  Send recap email to all participants after meeting ends
                </label>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
