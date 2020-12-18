import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({ 
    baseURL: 'http://192.168.0.102:8080'
 });

axiosRetry(api, { retries: 3 , retryDelay: axiosRetry.exponentialDelay});


export default api;