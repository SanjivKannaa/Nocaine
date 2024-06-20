import axios from 'axios';
// Get api url from .env file
const API_URL = process.env.REACT_APP_API_URL
const addUrlToQueue = async (url) => {
    try {
        const response = await axios.post(API_URL + 'dashboard/add', { url: url });
        return response.data;
    }
    catch (err) {
        return { error: err };
    }
}
const viewQueue = async () => {
    try {
        const response = await axios.get(API_URL + 'dashboard/queue');
        return response.data;
    }
    catch (err) {
        return { error: err };
    }
}
export {addUrlToQueue,viewQueue};