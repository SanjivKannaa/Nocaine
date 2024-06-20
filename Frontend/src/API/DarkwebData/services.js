import axios from 'axios';
// Get api url from .env file
const API_URL = process.env.REACT_APP_API_URL
const getServicesCount = async () => {
    try{
        const response = await axios.get(API_URL + 'dashboard/services');
        return response.data;
    }catch(err){
        return {error:err};
    }
}
const getCrimeCount = async () => {
    try{
        const response = await axios.get(API_URL + 'dashboard/crimes');
        return response.data;
    }catch(err){
        return {error:err};
    }
}
const getGraphData = async () => {
    try{
        const response = await axios.get(API_URL + 'graph');
        return response.data;
    }catch(err){
        return {error:err};
    }
}
const getServiceDailyCount = async (body) => {
    try{
        const response = await axios.post(API_URL + 'dashboard/service-daily-count',body);
        return response.data;
    }catch(err){
        return {error:err};
    }
}
const getUptimeDailyCount = async(body)=>{
    try{
        const response = await axios.post(API_URL+'dashboard/uptime-daily-count',body)
        return response.data
    }catch(err){
        return {error:err}
    }
}
export {getServicesCount,getCrimeCount,getGraphData,getServiceDailyCount,getUptimeDailyCount}