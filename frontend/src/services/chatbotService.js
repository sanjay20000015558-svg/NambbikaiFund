import axios from './api';

const sendMessage = async (messages) => {
  try {
    const response = await axios.post('/chatbot', { messages });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default { sendMessage };