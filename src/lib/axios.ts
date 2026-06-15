import axios from 'axios';

const TOKEN_KEY = 'topoflow_token';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('auth-storage');
      if (!error.config?._skipRedirect) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function downloadFile(url: string, filename: string): Promise<{ success: boolean; expired?: boolean }> {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
      _skipRedirect: true,
    } as any);

    const blob = response.data;
    const contentDisposition = response.headers['content-disposition'];
    let actualFilename = filename;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
      if (match) {
        actualFilename = decodeURIComponent(match[1].replace(/["']/g, ''));
      }
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = actualFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    return { success: true };
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, expired: true };
    }
    return { success: false };
  }
}

export default api;
