import axios from 'axios';

export const api = axios.create({
  // This points to your LIVE Render Backend
  baseURL: 'https://modex-doctor-app.onrender.com/api', 
});