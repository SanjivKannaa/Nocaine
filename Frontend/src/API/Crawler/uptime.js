import axios from 'axios';
// Get api url from .env file
const API_URL = process.env.REACT_APP_API_URL
const getUptime = async ()=>{
    try{
        const response = await axios.get(API_URL+'dashboard/uptime')
        return response.data
    }catch(err){
        return {error:err}
    }
}

export default getUptime;