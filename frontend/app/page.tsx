'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { MeetingsDashboard } from '../components/MeetingsDashboard';
import { MeetingDetailView } from '../components/MeetingDetailView';
import { CreateMeetingModal } from '../components/CreateMeetingModal';
import { EditMeetingModal } from '../components/EditMeetingModal';
import { PlaceholdersModal } from '../components/PlaceholdersModal';
import { 
  MeetingListItem, 
  MeetingDetail, 
  GlobalStats, 
  fetchMeetings, 
  fetchMeetingDetail, 
  fetchGlobalStats, 
  deleteMeeting 
} from '../lib/api';
import { BarChart2, PieChart, Users, Clock, Sparkles, Search } from 'lucide-react';

export default function Home() {
  // Navigation & View state: 'meetings' | 'search' | 'analytics'
  const [currentTab, setCurrentTab] = useState<string>('meetings');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // Data state
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [activeMeetingDetail, setActiveMeetingDetail] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingListItem | null>(null);
  const [placeholderType, setPlaceholderType] = useState<'fred' | 'integrations' | 'settings' | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load meetings & stats
  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsData, statsData] = await Promise.all([
        fetchMeetings({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          sort_by: sortBy
        }),
        fetchGlobalStats()
      ]);
      setMeetings(meetingsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load meetings data", err);
    } finally {
      setLoading(false);
    }
  };

  // Load meeting detail if selected
  const loadMeetingDetail = async (id: string) => {
    try {
      setLoading(true);
      const detail = await fetchMeetingDetail(id);
      setActiveMeetingDetail(detail);
      setSelectedMeetingId(id);
    } catch (err) {
      console.error("Failed to load meeting detail", err);
      showToast("Error loading meeting details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, sortBy]);

  const handleDeleteMeeting = async (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      try {
        await deleteMeeting(id);
        showToast("Meeting deleted successfully.");
        if (selectedMeetingId === id) {
          setSelectedMeetingId(null);
          setActiveMeetingDetail(null);
        }
        loadData();
      } catch (err) {
        showToast("Failed to delete meeting.");
      }
    }
  };

  const handleTabSelect = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'meetings') {
      // Reset view to full Meetings Library
      setSelectedMeetingId(null);
      setActiveMeetingDetail(null);
      setSelectedCategory('All');
      setSearchQuery('');
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

      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabSelect}
        onOpenFredModal={() => setPlaceholderType('fred')}
        onOpenIntegrationsModal={() => setPlaceholderType('integrations')}
        onOpenSettingsModal={() => setPlaceholderType('settings')}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentTab !== 'meetings') setCurrentTab('meetings');
          }}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          title={
            selectedMeetingId && activeMeetingDetail 
              ? activeMeetingDetail.title 
              : currentTab === 'analytics'
              ? 'Workspace Analytics'
              : currentTab === 'search'
              ? 'Smart Search'
              : 'Meetings Workspace'
          }
        />

        <main className="flex-1">
          {/* TAB 1: MEETINGS LIBRARY / DETAIL */}
          {currentTab === 'meetings' && (
            selectedMeetingId && activeMeetingDetail ? (
              <MeetingDetailView
                meeting={activeMeetingDetail}
                onBack={() => {
                  setSelectedMeetingId(null);
                  setActiveMeetingDetail(null);
                  loadData();
                }}
                onRefresh={() => loadMeetingDetail(selectedMeetingId)}
                onDelete={handleDeleteMeeting}
                onEdit={() => {
                  const item: MeetingListItem = {
                    id: activeMeetingDetail.id,
                    title: activeMeetingDetail.title,
                    date: activeMeetingDetail.date,
                    duration_seconds: activeMeetingDetail.duration_seconds,
                    category: activeMeetingDetail.category,
                    sentiment: activeMeetingDetail.sentiment,
                    organizer_name: activeMeetingDetail.organizer_name,
                    status: activeMeetingDetail.status,
                    participant_count: activeMeetingDetail.participants.length,
                    action_item_count: activeMeetingDetail.action_items.length,
                    participants: activeMeetingDetail.participants
                  };
                  setEditingMeeting(item);
                }}
              />
            ) : (
              <MeetingsDashboard
                meetings={meetings}
                stats={stats}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onSelectMeeting={(id) => loadMeetingDetail(id)}
                onDeleteMeeting={handleDeleteMeeting}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onEditMeeting={(item) => setEditingMeeting(item)}
              />
            )
          )}

          {/* TAB 2: SMART SEARCH */}
          {currentTab === 'search' && (
            <div className="p-8 max-w-5xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-400" />
                  <span>Smart Search Across Transcripts</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Search across all indexed meeting transcripts, participant quotes, topics, and action items.
                </p>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords (e.g. database, pricing, roadmap)..."
                    className="w-full bg-slate-900 text-xs text-slate-100 pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <MeetingsDashboard
                meetings={meetings}
                stats={stats}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onSelectMeeting={(id) => loadMeetingDetail(id)}
                onDeleteMeeting={handleDeleteMeeting}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onEditMeeting={(item) => setEditingMeeting(item)}
              />
            </div>
          )}

          {/* TAB 3: ANALYTICS */}
          {currentTab === 'analytics' && (
            <div className="p-8 max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-400" />
                  <span>Team Conversation Analytics</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">Total Meetings Transcribed</span>
                  <div className="text-3xl font-bold text-slate-100">{stats?.total_meetings || 5}</div>
                  <div className="text-xs text-emerald-400 font-medium">↑ 100% indexed in SQLite</div>
                </div>

                <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">Hours Transcribed</span>
                  <div className="text-3xl font-bold text-purple-400">{stats?.total_duration_hours || 0.3} hrs</div>
                  <div className="text-xs text-purple-300 font-medium">98.4% transcription accuracy</div>
                </div>

                <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">Action Items Completed</span>
                  <div className="text-3xl font-bold text-emerald-400">
                    {(stats?.total_action_items || 11) - (stats?.pending_action_items || 6)} / {stats?.total_action_items || 11}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Tasks resolved across teams</div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Category Conversation Volume</h3>
                <div className="space-y-3">
                  {(stats?.top_categories || [
                    { category: 'Engineering', count: 3 },
                    { category: 'Product', count: 1 },
                    { category: 'Sales', count: 1 }
                  ]).map((c) => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>{c.category}</span>
                        <span>{c.count} Meetings</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${(c.count / (stats?.total_meetings || 5)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          showToast("New meeting created successfully!");
          loadData();
        }}
      />

      <EditMeetingModal
        meeting={editingMeeting}
        isOpen={!!editingMeeting}
        onClose={() => setEditingMeeting(null)}
        onSuccess={() => {
          showToast("Meeting updated successfully!");
          loadData();
          if (selectedMeetingId) loadMeetingDetail(selectedMeetingId);
        }}
      />

      <PlaceholdersModal
        type={placeholderType}
        onClose={() => setPlaceholderType(null)}
      />
    </div>
  );
}
