import axios from 'axios';
// Get api url from .env file
const API_URL = process.env.REACT_APP_API_URL
const filterServices = async(body)=>{
    try{
        const response = await axios.post(API_URL + 'activity/filter',body);
        return response.data;
    }catch(err){
        return {error:err};
    }
}

const searchServices = async(body)=>{
    try{
        const response = await axios.post(API_URL + 'activity/search',body);
        return response.data;
    }catch(err){
        return {error:err};
    }
}

const deepSearch = async(body)=>{
    try{
        const response = await axios.post(API_URL + 'archive/elastic',body);
        return response.data;
    }catch(err){
        return {error:err};
    }
}
export {filterServices,searchServices};