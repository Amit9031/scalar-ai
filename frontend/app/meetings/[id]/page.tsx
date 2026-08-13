'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../components/Sidebar';
import { Navbar } from '../../../components/Navbar';
import { MeetingDetailView } from '../../../components/MeetingDetailView';
import { EditMeetingModal } from '../../../components/EditMeetingModal';
import { PlaceholdersModal } from '../../../components/PlaceholdersModal';
import { 
  MeetingDetail, 
  MeetingListItem, 
  fetchMeetingDetail, 
  deleteMeeting 
} from '../../../lib/api';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params?.id as string;

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [editingMeeting, setEditingMeeting] = useState<MeetingListItem | null>(null);
  const [placeholderType, setPlaceholderType] = useState<'fred' | 'integrations' | 'settings' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    if (!meetingId) return;
    try {
      setLoading(true);
      setError(null);
      const detail = await fetchMeetingDetail(meetingId);
      setMeeting(detail);
    } catch (err) {
      console.error("Failed to load meeting detail", err);
      setError("Failed to load meeting details. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [meetingId]);

  const handleDeleteMeeting = async (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      try {
        await deleteMeeting(id);
        router.push('/');
      } catch (err) {
        showToast("Failed to delete meeting.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-2xl border border-purple-400/30">
          {toastMessage}
        </div>
      )}

      <Sidebar
        currentTab="meetings"
        onSelectTab={() => router.push('/')}
        onOpenFredModal={() => setPlaceholderType('fred')}
        onOpenIntegrationsModal={() => setPlaceholderType('integrations')}
        onOpenSettingsModal={() => setPlaceholderType('settings')}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          searchQuery=""
          onSearchChange={() => {}}
          onOpenCreateModal={() => router.push('/')}
          title={meeting ? meeting.title : "Meeting Detail"}
        />

        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-xs text-slate-400">Loading transcript & AI notes...</p>
            </div>
          ) : error || !meeting ? (
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
              <p className="text-sm font-semibold text-red-400">{error || "Meeting not found."}</p>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Meetings Library
              </button>
            </div>
          ) : (
            <MeetingDetailView
              meeting={meeting}
              onBack={() => router.push('/')}
              onRefresh={loadData}
              onDelete={handleDeleteMeeting}
              onEdit={() => {
                const item: MeetingListItem = {
                  id: meeting.id,
                  title: meeting.title,
                  date: meeting.date,
                  duration_seconds: meeting.duration_seconds,
                  category: meeting.category,
                  sentiment: meeting.sentiment,
                  organizer_name: meeting.organizer_name,
                  status: meeting.status,
                  participant_count: meeting.participants.length,
                  action_item_count: meeting.action_items.length,
                  participants: meeting.participants
                };
                setEditingMeeting(item);
              }}
            />
          )}
        </main>
      </div>

      <EditMeetingModal
        meeting={editingMeeting}
        isOpen={!!editingMeeting}
        onClose={() => setEditingMeeting(null)}
        onSuccess={() => {
          showToast("Meeting updated successfully!");
          loadData();
        }}
      />

      <PlaceholdersModal
        type={placeholderType}
        onClose={() => setPlaceholderType(null)}
      />
    </div>
  );
}
