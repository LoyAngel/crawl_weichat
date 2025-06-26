import axios from 'axios';
import type { 
  StartCrawlRequest, 
  StartCrawlResponse, 
  GetTaskStatusResponse,
  ApiResponse 
} from './types';
import { config } from '../config';

// 创建axios实例
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 开始爬取任务
 * @param params 爬取参数
 * @returns 响应结果，包含任务ID
 */
export const startCrawl = async (params: StartCrawlRequest): Promise<StartCrawlResponse> => {
  try {
    const response = await api.post<StartCrawlResponse>('/crawl/start', params);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || '开始爬取失败'
    };
  }
};

/**
 * 获取任务状态
 * @param taskId 任务ID
 * @returns 任务状态信息
 */
export const getTaskStatus = async (taskId: string): Promise<GetTaskStatusResponse> => {
  try {
    const response = await api.get<GetTaskStatusResponse>(`/crawl/status/${taskId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || '获取任务状态失败'
    };
  }
};

/**
 * 下载压缩文件
 * @param downloadUrl 下载地址
 * @param filename 文件名
 */
export const downloadFile = (downloadUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 取消任务
 * @param taskId 任务ID
 * @returns 取消结果
 */
export const cancelTask = async (taskId: string): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>(`/crawl/cancel/${taskId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || '取消任务失败'
    };
  }
};

/**
 * 获取任务历史列表
 * @returns 任务历史列表
 */
export const getTaskHistory = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>('/crawl/history');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || '获取历史记录失败'
    };
  }
};
