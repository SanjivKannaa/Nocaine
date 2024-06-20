const URL = require('../models/URL')
const UnscrapedURL = require('../models/UnscrapedURL')
const {graphData} = require('../services/onionData')
const graphDetails = async (req, res) => {
    try{
        const data = await graphData()
        return res.status(200).json(data)
    }catch(err){
        return res.status(500).json({error:err})
    }
}
module.exports = {graphDetails}