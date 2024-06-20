const URL = require('../models/URL')
const UnscrapedURL = require('../models/UnscrapedURL')
const {filterWithPagination,search} = require('../services/onionData')

const filterURLs = async(req,res)=>{
    try{
        const {type,crime,status,network,scoreMin,scoreMax,sort,page} = req.body
        const urls = await filterWithPagination(type,crime,status,network,scoreMin,scoreMax,sort,page)
        return res.status(200).json({urls})
    }catch(err){
        // console.log(err)
        return res.status(500).json({error:err})
    }
}
const searchURL = async(req,res)=>{
    try{
        const {query} = req.body
        const urls = await search(query)
        return res.status(200).json({urls})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err})
    }
}
module.exports = {filterURLs,searchURL}