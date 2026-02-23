import axios, { AxiosRequestConfig } from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/v1/admins/me',
    login: '/api/v1/admins/sign_in',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  feedback: {
    list: '/api/v1/admins/feedbacks',
    details: (id: string) => `/api/v1/admins/feedbacks/${id}`,
  },
  user: {
    list: '/api/v1/admins/users',
    details: (id: string) => `/api/v1/admins/users/${id}`,
    update: (id: string) => `/api/v1/admins/users/${id}`,
    delete: (id: string) => `/api/v1/admins/users/${id}`,
    resources: (userId: string, resource: string) => `/api/v1/admins/users/${userId}/${resource}`,
  },
};
