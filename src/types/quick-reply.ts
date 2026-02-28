// ----------------------------------------------------------------------

export type IQuickReplyItem = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type IQuickReplyFormData = {
  title: string;
  content: string;
  image_url: string;
  position: number;
  active: boolean;
};
