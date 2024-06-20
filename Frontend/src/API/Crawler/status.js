import axios from 'axios';
// Get api url from .env file
const API_URL = process.env.REACT_APP_API_URL
const getStatus = async ()=>{
    try{
        const response = await axios.get(API_URL+'dashboard/status')
        return response.data
    }catch(err){
        return {error:err}
    }
}

const switchStatus = async ()=>{
    try{
        const response = await axios.get(API_URL+'dashboard/switch')
        return response.data
    }catch(err){
        return {error:err}
    }
}
export {getStatus,switchStatus};