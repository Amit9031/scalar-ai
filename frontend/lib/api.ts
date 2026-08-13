import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Participant {
  id: string;
  meeting_id: string;
  name: string;
  email?: string;
  avatar_color: string;
  role: string;
  talk_time_percentage: number;
}

export interface Utterance {
  id: string;
  meeting_id: string;
  speaker_name: string;
  start_time: number;
  end_time: number;
  text: string;
  sentiment: string;
  order_index: number;
}

export interface Topic {
  id: string;
  meeting_id: string;
  title: string;
  start_time: number;
  summary?: string;
  order_index: number;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  task: string;
  assignee: string;
  due_date?: string;
  is_completed: boolean;
  timestamp?: number;
}

export interface Highlight {
  id: string;
  meeting_id: string;
  utterance_id?: string;
  start_time: number;
  end_time: number;
  comment_text: string;
  tag: string;
  created_by: string;
  created_at: string;
}

export interface MeetingListItem {
  id: string;
  title: string;
  date: string;
  duration_seconds: number;
  category: string;
  sentiment: string;
  organizer_name: string;
  status: string;
  participant_count: number;
  action_item_count: number;
  participants: Participant[];
}

export interface MeetingDetail extends MeetingListItem {
  audio_url?: string;
  summary_overview?: string;
  created_at: string;
  utterances: Utterance[];
  topics: Topic[];
  action_items: ActionItem[];
  highlights: Highlight[];
}

export interface GlobalStats {
  total_meetings: number;
  total_duration_hours: number;
  total_action_items: number;
  pending_action_items: number;
  top_categories: { category: string; count: number }[];
}

export interface AskAIResponse {
  question: string;
  answer: string;
  relevant_utterance_ids: string[];
  source_timestamps: number[];
}

// API methods
export const fetchGlobalStats = async (): Promise<GlobalStats> => {
  const res = await axios.get(`${API_BASE_URL}/meetings/stats`);
  return res.data;
};

export const fetchMeetings = async (params?: {
  search?: string;
  category?: string;
  participant?: string;
  sort_by?: string;
}): Promise<MeetingListItem[]> => {
  const res = await axios.get(`${API_BASE_URL}/meetings`, { params });
  return res.data;
};

export const fetchMeetingDetail = async (id: string): Promise<MeetingDetail> => {
  const res = await axios.get(`${API_BASE_URL}/meetings/${id}`);
  return res.data;
};

export const createMeeting = async (payload: {
  title: string;
  category?: string;
  date?: string;
  participants_str?: string;
  raw_transcript?: string;
}): Promise<MeetingDetail> => {
  const res = await axios.post(`${API_BASE_URL}/meetings`, payload);
  return res.data;
};

export const uploadTranscriptFile = async (formData: FormData): Promise<MeetingDetail> => {
  const res = await axios.post(`${API_BASE_URL}/meetings/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const updateMeeting = async (
  id: string,
  payload: { title?: string; category?: string; summary_overview?: string }
): Promise<MeetingDetail> => {
  const res = await axios.patch(`${API_BASE_URL}/meetings/${id}`, payload);
  return res.data;
};

export const deleteMeeting = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/meetings/${id}`);
};

export const createActionItem = async (payload: {
  meeting_id: string;
  task: string;
  assignee?: string;
  due_date?: string;
  timestamp?: number;
}): Promise<ActionItem> => {
  const res = await axios.post(`${API_BASE_URL}/action-items`, payload);
  return res.data;
};

export const updateActionItem = async (
  id: string,
  payload: { is_completed?: boolean; task?: string; assignee?: string }
): Promise<ActionItem> => {
  const res = await axios.patch(`${API_BASE_URL}/action-items/${id}`, payload);
  return res.data;
};

export const deleteActionItem = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/action-items/${id}`);
};

export const askAiAboutMeeting = async (
  meetingId: string,
  question: string
): Promise<AskAIResponse> => {
  const res = await axios.post(`${API_BASE_URL}/meetings/${meetingId}/ask-ai`, { question });
  return res.data;
};

export const getExportUrl = (meetingId: string, format: 'markdown' | 'txt' | 'json') => {
  return `${API_BASE_URL}/meetings/${meetingId}/export?format=${format}`;
};
