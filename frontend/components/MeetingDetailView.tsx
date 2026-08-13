'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MeetingDetail, 
  Utterance, 
  ActionItem, 
  createActionItem, 
  updateActionItem, 
  deleteActionItem, 
  askAiAboutMeeting,
  getExportUrl
} from '../lib/api';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  FileText, 
  PieChart, 
  Bookmark, 
  ChevronUp, 
  ChevronDown,
  User,
  Send,
  Check
} from 'lucide-react';

interface MeetingDetailViewProps {
  meeting: MeetingDetail;
  onBack: () => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export const MeetingDetailView: React.FC<MeetingDetailViewProps> = ({
  meeting,
  onBack,
  onRefresh,
  onDelete,
  onEdit
}) => {
  // Audio & Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Active tab state: 'summary' | 'transcript' | 'highlights' | 'analytics' | 'ask_ai'
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'highlights' | 'analytics' | 'ask_ai'>('summary');

  // Transcript Search & Filter
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('All');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  // Action Items State
  const [newTaskText, setNewTaskText] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Ask AI Chat State
  const [aiQuestion, setAiQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamps?: number[] }>>([
    {
      sender: 'ai',
      text: `Hello! I'm Fred, your AI meeting assistant. Ask me anything about **${meeting.title}**—such as decisions made, action items, or specific topics!`,
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Export Menu State
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Utterance Refs for Auto-scroll
  const utteranceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Audio Playback effect timer fallback
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= meeting.duration_seconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, meeting.duration_seconds]);

  // Audio element sync if audio url is valid
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, volume, isMuted]);

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Find active utterance based on currentTime
  const activeUtterance = meeting.utterances.find(
    (u) => currentTime >= u.start_time && currentTime <= u.end_time
  ) || meeting.utterances[0];

  // Action Items handlers
  const handleToggleTask = async (item: ActionItem) => {
    await updateActionItem(item.id, { is_completed: !item.is_completed });
    onRefresh();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    await createActionItem({
      meeting_id: meeting.id,
      task: newTaskText.trim(),
      assignee: newAssignee.trim() || 'Unassigned',
      due_date: newDueDate.trim() || 'Next Week',
      timestamp: currentTime
    });
    setNewTaskText('');
    setNewAssignee('');
    setNewDueDate('');
    setIsAddingTask(false);
    onRefresh();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteActionItem(id);
    onRefresh();
  };

  // Ask AI handler
  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiLoading) return;

    const q = aiQuestion.trim();
    setAiQuestion('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setIsAiLoading(true);

    try {
      const response = await askAiAboutMeeting(meeting.id, q);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.answer,
          timestamps: response.source_timestamps
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "Sorry, I ran into an error processing your query." }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered utterances
  const filteredUtterances = meeting.utterances.filter((u) => {
    const matchesSpeaker = speakerFilter === 'All' || u.speaker_name === speakerFilter;
    const matchesText = !transcriptSearch || u.text.toLowerCase().includes(transcriptSearch.toLowerCase()) || u.speaker_name.toLowerCase().includes(transcriptSearch.toLowerCase());
    return matchesSpeaker && matchesText;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19]">
      {/* Hidden HTML5 Audio Element for Sound Helix track */}
      <audio
        ref={audioRef}
        src={meeting.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
      />

      {/* Top Meeting Header Bar */}
      <div className="px-8 py-5 border-b border-slate-800 bg-[#111827]/80 backdrop-blur flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Back to meetings library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-100">{meeting.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {meeting.category}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
              <span>Organized by <strong className="text-slate-300">{meeting.organizer_name}</strong></span>
              <span>•</span>
              <span>{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{formatTime(meeting.duration_seconds)}</span>
            </div>
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-12 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 w-44 text-xs space-y-1">
                <a
                  href={getExportUrl(meeting.id, 'markdown')}
                  download
                  onClick={() => setShowExportMenu(false)}
                  className="block w-full p-2 text-left hover:bg-slate-800 text-slate-200 rounded font-medium"
                >
                  Export Markdown (.md)
                </a>
                <a
                  href={getExportUrl(meeting.id, 'txt')}
                  download
                  onClick={() => setShowExportMenu(false)}
                  className="block w-full p-2 text-left hover:bg-slate-800 text-slate-200 rounded font-medium"
                >
                  Export Text (.txt)
                </a>
                <a
                  href={getExportUrl(meeting.id, 'json')}
                  download
                  onClick={() => setShowExportMenu(false)}
                  className="block w-full p-2 text-left hover:bg-slate-800 text-slate-200 rounded font-medium"
                >
                  Export JSON (.json)
                </a>
              </div>
            )}
          </div>

          <button
            onClick={onEdit}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Edit Meeting Title & Details"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(meeting.id)}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
            title="Delete Meeting"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embedded Custom Audio / Media Player Bar */}
      <div className="bg-[#131B2E] border-b border-slate-800 px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-16 z-10 shadow-lg">
        {/* Play / Seek Controls */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 active:scale-95 transition"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={() => seekTo(Math.max(0, currentTime - 10))}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => seekTo(Math.min(meeting.duration_seconds, currentTime + 10))}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Time Counter */}
          <span className="text-xs font-mono text-slate-300 font-semibold w-24">
            {formatTime(currentTime)} / {formatTime(meeting.duration_seconds)}
          </span>
        </div>

        {/* Media Seek Bar & Waveform Visualization */}
        <div className="flex-1 max-w-2xl w-full flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={meeting.duration_seconds}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          {/* Audio Waveform Equalizer Animation */}
          {isPlaying && (
            <div className="flex items-center gap-1 h-5 px-2">
              <span className="w-1 bg-purple-500 rounded animate-wave-1"></span>
              <span className="w-1 bg-indigo-500 rounded animate-wave-2"></span>
              <span className="w-1 bg-purple-400 rounded animate-wave-3"></span>
              <span className="w-1 bg-pink-500 rounded animate-wave-4"></span>
              <span className="w-1 bg-purple-600 rounded animate-wave-5"></span>
            </div>
          )}
        </div>

        {/* Speed & Volume Controls */}
        <div className="flex items-center gap-4">
          {/* Playback Speed */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-purple-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value={0.75} className="bg-slate-900 text-slate-200">0.75x</option>
              <option value={1.0} className="bg-slate-900 text-slate-200">1.0x</option>
              <option value={1.25} className="bg-slate-900 text-slate-200">1.25x</option>
              <option value={1.5} className="bg-slate-900 text-slate-200">1.5x</option>
              <option value={2.0} className="bg-slate-900 text-slate-200">2.0x</option>
            </select>
          </div>

          {/* Volume Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Workspace Layout with Tab Bar */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Tabbed Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Workspace Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'summary', label: 'Summary & Notes', icon: FileText },
              { id: 'transcript', label: 'Interactive Transcript', icon: MessageSquare, badge: meeting.utterances.length },
              { id: 'highlights', label: 'Soundbites', icon: Bookmark, badge: meeting.highlights.length },
              { id: 'analytics', label: 'Speaker Analytics', icon: PieChart }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-purple-900 text-purple-200' : 'bg-slate-800 text-slate-400'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: SUMMARY & AI NOTES */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Executive Overview Card */}
              <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Executive Overview
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {meeting.summary_overview || "Summary generating..."}
                </p>
              </div>

              {/* Key Outline Chapters */}
              <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4 shadow-lg">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Key Chapter Outline
                </h3>
                <div className="space-y-3">
                  {meeting.topics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => seekTo(topic.start_time)}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer group flex items-start gap-4"
                    >
                      <button className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white transition">
                        {formatTime(topic.start_time)}
                      </button>
                      <div className="space-y-1 flex-1">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition">
                          {topic.title}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {topic.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items & Tasks Section */}
              <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Action Items & Tasks ({meeting.action_items.filter(a => a.is_completed).length}/{meeting.action_items.length})
                  </h3>
                  <button
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                {/* Add New Task Form */}
                {isAddingTask && (
                  <form onSubmit={handleCreateTask} className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 space-y-3">
                    <input
                      type="text"
                      placeholder="Task description..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="w-full bg-slate-800 text-xs text-slate-100 p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Assignee (e.g. David)"
                        value={newAssignee}
                        onChange={(e) => setNewAssignee(e.target.value)}
                        className="bg-slate-800 text-xs text-slate-100 p-2 rounded-lg border border-slate-700"
                      />
                      <input
                        type="text"
                        placeholder="Due Date (e.g. Friday)"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="bg-slate-800 text-xs text-slate-100 p-2 rounded-lg border border-slate-700"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(false)}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold"
                      >
                        Save Action Item
                      </button>
                    </div>
                  </form>
                )}

                {/* Action Items List */}
                <div className="space-y-2.5">
                  {meeting.action_items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => handleToggleTask(item)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            item.is_completed 
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                              : 'border-slate-600 hover:border-purple-500'
                          }`}
                        >
                          {item.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span className={`text-xs ${item.is_completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}`}>
                          {item.task}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                          {item.assignee}
                        </span>
                        {item.timestamp !== undefined && item.timestamp !== null && (
                          <button
                            onClick={() => seekTo(item.timestamp!)}
                            className="text-[10px] text-purple-400 hover:underline font-mono"
                          >
                            [{formatTime(item.timestamp)}]
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE TRANSCRIPT */}
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              {/* Filter & Search Bar for Transcript */}
              <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search words in transcript..."
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    className="w-full bg-slate-900 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Speaker Filter */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="whitespace-nowrap font-medium">Speaker:</span>
                  <select
                    value={speakerFilter}
                    onChange={(e) => setSpeakerFilter(e.target.value)}
                    className="bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    <option value="All">All Speakers</option>
                    {meeting.participants.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transcript Utterances List */}
              <div className="space-y-3">
                {filteredUtterances.map((u) => {
                  const isActive = activeUtterance?.id === u.id;
                  const participant = meeting.participants.find(p => p.name === u.speaker_name);

                  return (
                    <div
                      key={u.id}
                      ref={(el) => { utteranceRefs.current[u.id] = el; }}
                      onClick={() => seekTo(u.start_time)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-900/20'
                          : 'bg-[#131B2E] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            style={{ backgroundColor: participant?.avatar_color || '#7C3AED' }}
                            className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                          >
                            {u.speaker_name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-200">{u.speaker_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            [{formatTime(u.start_time)}]
                          </span>
                        </div>

                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500 text-white animate-pulse">
                            NOW PLAYING
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-normal pl-8">
                        {u.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SOUNDBITES & HIGHLIGHTS */}
          {activeTab === 'highlights' && (
            <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-400" />
                Saved Soundbites & Highlights
              </h3>

              {meeting.highlights.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No highlights saved yet. Click any transcript utterance to create a soundbite snippet.
                </div>
              ) : (
                <div className="space-y-3">
                  {meeting.highlights.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => seekTo(h.start_time)}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-300">{h.tag}</span>
                        <span className="font-mono text-slate-500 text-[10px]">[{formatTime(h.start_time)}]</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{h.comment_text}</p>
                      <div className="text-[10px] text-slate-500">Added by {h.created_by}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SPEAKER ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-6 shadow-lg">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                Speaker Talk Time Analytics
              </h3>

              <div className="space-y-4">
                {meeting.participants.map((p) => (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          style={{ backgroundColor: p.avatar_color }}
                          className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                        >
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-200">{p.name} ({p.role})</span>
                      </div>
                      <span className="font-mono font-bold text-purple-300">{p.talk_time_percentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${p.talk_time_percentage}%`, backgroundColor: p.avatar_color }}
                        className="h-full rounded-full transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ask AI Chat Panel (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4 shadow-xl sticky top-36">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-xs border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Ask AI About This Meeting</span>
            </div>

            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto space-y-3 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white ml-6 font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 mr-2 space-y-1.5'
                  }`}
                >
                  <div>{msg.text}</div>
                  {msg.timestamps && msg.timestamps.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">Jump to:</span>
                      {msg.timestamps.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => seekTo(t)}
                          className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] hover:underline"
                        >
                          {formatTime(t)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isAiLoading && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-purple-400 text-xs animate-pulse">
                  Fred AI is analyzing transcript...
                </div>
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleAskAi} className="relative">
              <input
                type="text"
                placeholder="Ask Fred a question..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="w-full bg-slate-900 text-xs text-slate-100 pl-3 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuestion.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-purple-600 text-white disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
