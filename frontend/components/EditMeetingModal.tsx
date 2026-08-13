'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { MeetingListItem, updateMeeting } from '../lib/api';

interface EditMeetingModalProps {
  meeting: MeetingListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditMeetingModal: React.FC<EditMeetingModalProps> = ({
  meeting,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Product');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setCategory(meeting.category);
    }
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await updateMeeting(meeting.id, {
        title: title.trim(),
        category
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update meeting", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Edit className="w-4 h-4 text-purple-400" />
            <span>Edit Meeting Details</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Meeting Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
            />
          </div>

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

          <div className="flex justify-end gap-3 pt-3">
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
