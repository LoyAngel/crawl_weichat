/**
 * 环境配置文件
 */

// 开发环境配置
const development = {
  API_BASE_URL: 'http://localhost:3000/api',
  NODE_ENV: 'development',
  DEBUG: true,
  LOG_LEVEL: 'debug'
};

// 生产环境配置
const production = {
  API_BASE_URL: '/api',
  NODE_ENV: 'production',
  DEBUG: false,
  LOG_LEVEL: 'error'
};

// 测试环境配置
const test = {
  API_BASE_URL: 'http://localhost:3001/api',
  NODE_ENV: 'test',
  DEBUG: true,
  LOG_LEVEL: 'warn'
};

// 根据环境变量选择配置
const getConfig = () => {
  const env = import.meta.env.MODE || 'development';
  
  switch (env) {
    case 'production':
      return production;
    case 'test':
      return test;
    default:
      return development;
  }
};

export const config = getConfig();

// 导出具体配置项
export const { API_BASE_URL, NODE_ENV, DEBUG, LOG_LEVEL } = config;
