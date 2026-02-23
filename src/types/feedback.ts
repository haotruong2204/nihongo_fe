// ----------------------------------------------------------------------

export type IFeedbackUser = {
  id: string;
  email: string;
  display_name: string;
  photo_url: string;
};

export type IFeedbackItem = {
  id: string;
  user_id: number | null;
  email: string;
  text: string;
  display: boolean;
  status: 'pending' | 'reviewed' | 'done' | 'rejected';
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  user: IFeedbackUser | null;
};

export type IFeedbackPagination = {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
};
