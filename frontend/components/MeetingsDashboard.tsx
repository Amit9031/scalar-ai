'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MeetingListItem, 
  GlobalStats 
} from '../lib/api';
import { 
  Video, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  UserCheck,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';

interface MeetingsDashboardProps {
  meetings: MeetingListItem[];
  stats: GlobalStats | null;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onSelectMeeting: (id: string) => void;
  onDeleteMeeting: (id: string) => void;
  onOpenCreateModal: () => void;
  onEditMeeting: (meeting: MeetingListItem) => void;
}

export const MeetingsDashboard: React.FC<MeetingsDashboardProps> = ({
  meetings,
  stats,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSelectMeeting,
  onDeleteMeeting,
  onOpenCreateModal,
  onEditMeeting
}) => {
  const router = useRouter();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const categories = ["All", "Product", "Engineering", "Sales", "1-on-1", "General"];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCardClick = (id: string) => {
    onSelectMeeting(id);
    router.push(`/meetings/${id}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            Meeting Library
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {meetings.length} Recorded
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse past meeting transcripts, AI summaries, chapters, and extracted action items.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>New Meeting / Upload</span>
        </button>
      </div>

      {/* Global Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Meetings</span>
            <Video className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {stats ? stats.total_meetings : meetings.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            ↑ 100% indexed & searchable
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Hours Transcribed</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {stats ? `${stats.total_duration_hours} hrs` : '1.2 hrs'}
          </div>
          <div className="text-[11px] text-indigo-300 mt-1 font-medium">
            Speech-to-text accuracy: 98.4%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Action Items</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {stats ? stats.pending_action_items : 5}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Assigned to team members
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Top Category</span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 truncate">
            {stats && stats.top_categories.length > 0 ? stats.top_categories[0].category : 'Product'}
          </div>
          <div className="text-[11px] text-pink-300 mt-1 font-medium">
            Highest team conversation volume
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="date_desc" className="bg-slate-900">Newest First</option>
              <option value="date_asc" className="bg-slate-900">Oldest First</option>
              <option value="duration_desc" className="bg-slate-900">Longest Duration</option>
              <option value="title_asc" className="bg-slate-900">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800/80 p-8">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No meetings found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No meeting records matched your query. Try clearing filters or create/upload a new transcript.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold shadow"
          >
            Create New Meeting
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => handleCardClick(meeting.id)}
              className="group p-5 rounded-2xl bg-[#131B2E] border border-slate-800 hover:border-purple-500/50 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-purple-900/10 flex flex-col md:flex-row md:items-center justify-between gap-5 relative"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                    {meeting.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formatDate(meeting.date)}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {formatDuration(meeting.duration_seconds)}
                  </span>
                  {meeting.sentiment && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      Sentiment: {meeting.sentiment}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition flex items-center gap-2">
                  {meeting.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Organizer: <strong className="text-slate-300">{meeting.organizer_name}</strong></span>
                  <span>•</span>
                  <span>{meeting.action_item_count} Action Items</span>
                </div>
              </div>

              {/* Right Details & Participant Avatars */}
              <div className="flex items-center gap-6 justify-between md:justify-end">
                {/* Participant Avatars */}
                <div className="flex items-center -space-x-2 overflow-hidden">
                  {meeting.participants.map((p) => (
                    <div
                      key={p.id}
                      title={`${p.name} (${p.talk_time_percentage}% talk time)`}
                      style={{ backgroundColor: p.avatar_color }}
                      className="w-8 h-8 rounded-full border-2 border-[#131B2E] text-white text-xs font-bold flex items-center justify-center shadow"
                    >
                      {p.name.charAt(0)}
                    </div>
                  ))}
                </div>

                {/* View CTA */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMeeting(meeting.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>View Transcript</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === meeting.id ? null : meeting.id);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === meeting.id && (
                      <div className="absolute right-0 top-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 w-36 text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onEditMeeting(meeting);
                          }}
                          className="w-full p-2 text-left hover:bg-slate-800 text-slate-300 rounded flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onDeleteMeeting(meeting.id);
                          }}
                          className="w-full p-2 text-left hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
