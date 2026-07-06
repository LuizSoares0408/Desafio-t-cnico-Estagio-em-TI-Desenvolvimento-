import axios from 'axios';

// Se sua API não usa o prefixo /api nas rotas, use apenas http://localhost:5097
const api = axios.create({
  baseURL: 'http://localhost:5097/api', 
});

export default api;