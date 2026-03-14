import axios from 'axios';
export const googleAuth = async (code) => {
  try {
return await axios.get(`http://localhost:8000/auth/google?code=${code}`);
  } catch (err) {
    console.error("googleAuth error:", err?.response?.data || err?.message || err);
    throw err; // re-throw so your outer try/catch still works
  }
};
