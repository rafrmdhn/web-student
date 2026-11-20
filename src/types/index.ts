export type UserRole = 'siswa' | 'guru_bk' | 'admin';

export type AccentColor = 'teal' | 'blue' | 'indigo' | 'emerald';

export type MaterialStatus = 'published' | 'draft' | 'archived';

export type PlanTimeframe = 'jangka_pendek' | 'jangka_menengah' | 'jangka_panjang';

export type FollowupStatus = 'menunggu' | 'pendampingan' | 'selesai';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  class_name: string;
  is_active: boolean;
  share_activity_consent: boolean;
  created_at: string;
}

export interface Material {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  status: MaterialStatus;
  author_id: string | null;
  created_at: string;
}

export interface MaterialProgress {
  id: string;
  student_id: string;
  material_id: string;
  completed_at: string;
}

export interface ReflectionActivity {
  id: string;
  title: string;
  prompt: string;
  due_date: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface StudentReflection {
  id: string;
  student_id: string;
  activity_id: string | null;
  interest_notes: string;
  strength_notes: string;
  reflection_content: string;
  created_at: string;
}

export interface PotentialMap {
  id: string;
  student_id: string;
  academic_score: number;
  social_score: number;
  creative_score: number;
  leadership_score: number;
  technical_score: number;
  top_strengths: string;
  top_interests: string;
  updated_at: string;
}

export interface ActionStep {
  id: string;
  label: string;
  done: boolean;
}

export interface FuturePlan {
  id: string;
  student_id: string;
  title: string;
  timeframe: PlanTimeframe;
  target_goal: string;
  action_steps: ActionStep[];
  progress: number;
  created_at: string;
}

export interface CounselorFollowup {
  id: string;
  student_id: string;
  counselor_id: string | null;
  guidance_note: string;
  recommendation: string;
  status: FollowupStatus;
  updated_at: string;
}

export interface ConsultationInfo {
  id: string;
  counselor_name: string;
  schedule: string;
  location_or_link: string;
  contact_info: string;
  notes: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  tagline: string;
  accent_color: AccentColor;
  show_announcement_banner: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name?: string;
  action: string;
  module: string;
  detail: string;
  created_at: string;
}

export type AppView = 'auth' | 'dashboard';
