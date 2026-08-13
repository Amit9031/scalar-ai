'use client';

import React, { useState } from 'react';
import { X, Upload, Sparkles, FileText, Check } from 'lucide-react';
import { createMeeting, uploadTranscriptFile } from '../lib/api';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [tab, setTab] = useState<'form' | 'file'>('form');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Product');
  const [participantsStr, setParticipantsStr] = useState('Fred (Fireflies Bot), Alex Rivera, Sarah Lin');
  const [rawTranscript, setRawTranscript] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createMeeting({
        title: title.trim(),
        category,
        participants_str: participantsStr,
        raw_transcript: rawTranscript.trim() || undefined
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create meeting", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title.trim()) formData.append('title', title.trim());
      formData.append('category', category);
      await uploadTranscriptFile(formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to upload transcript file", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Create / Upload Meeting</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-6 space-y-5">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setTab('form')}
              className={`flex-1 py-2 rounded-lg transition ${tab === 'form' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
            >
              Manual Form / Paste
            </button>
            <button
              onClick={() => setTab('file')}
              className={`flex-1 py-2 rounded-lg transition ${tab === 'file' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
            >
              Upload File (.vtt / .txt / .json)
            </button>
          </div>

          {tab === 'form' ? (
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Strategy & Product Launch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    <option value="Product">Product</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="1-on-1">1-on-1</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Participants</label>
                  <input
                    type="text"
                    placeholder="Comma separated names"
                    value={participantsStr}
                    onChange={(e) => setParticipantsStr(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Paste Transcript (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Speaker 1: Welcome to the call!&#10;Speaker 2: Glad to be here..."
                  value={rawTranscript}
                  onChange={(e) => setRawTranscript(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
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
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/30"
                >
                  {loading ? 'Creating...' : 'Create Meeting'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Meeting Title (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-detected from file name if blank"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl p-8 text-center bg-slate-900/50 cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.vtt,.json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 text-purple-400 mx-auto" />
                  <div className="text-slate-200 font-semibold">
                    {file ? file.name : 'Click to upload transcript (.vtt, .txt, .json)'}
                  </div>
                  <p className="text-[10px] text-slate-500">Maximum file size: 25MB</p>
                </label>
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
                  disabled={loading || !file}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Upload & Parse Transcript'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
