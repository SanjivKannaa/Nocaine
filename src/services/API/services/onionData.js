const { elasticsearch } = require('../helpers/elasticsearch')
const URL = require('../models/URL')
const UnscrapedURL = require('../models/UnscrapedURL')
const filterWithPagination = async(type,crime,status,network,scoreMin,scoreMax,sort,page) => {
        const query = {}
        if(crime && crime!='All'){
            query.types = crime
        }
        if(network && network!='All'){
            query.network = network
        }
        if(!page){
            page = 1
        }
        if(type){
            if(type=='Suspicious'){
                query.isSuspicious = true
            }else if(type=='Normal'){
                query.isSuspicious = false
            }else if(type=='Timed Out'){
                const urls = await UnscrapedURL.find({isRootPath:true}).skip((page-1)*10).limit(10).select("-_id")
                return urls
            }
        }
        if(status){
            if(status=='Active'){
                query.isOnline = true
            }else if(status=='Inactive'){
                query.isOnline = false
            }
        }
        query["susScore.total"] = {$gte:scoreMin,$lte:scoreMax}
        if(!sort){
            sort = -1
        }
        if(sort==1){
            sort='asc'
        }
        
        query.isRootPath = true
        console.log(query)
        const urls = await URL.find(query).sort({'susScore.total':sort}).skip((page-1)*10).limit(10).select("-_id")
        return urls
}
const search = async(url) => {
        // const urls = await URL.find({url:{$regex:url,$options:'i'}})
        const results = await elasticsearch(url)
        let urls = []
        results.forEach(result=>{
            urls.push(result._source)
        })
        return urls
}

const graphData = async()=>{
        const urls = await URL.find({isRootPath:true}).select('url links id types isSuspicious network edges')
        // const unscraped = await UnscrapedURL.find({}).select('url')
        const nodes = []
        const edges = []
        urls.forEach(url=>{
            nodes.push({
                id: url.url,
                label: url.url
            })
            url.edges?.forEach(link=>{
                edges.push({
                    id: url.url+link,
                    source: url.url,
                    target: link,
                    label: `${url.url} -> ${link}`
                })
            })
        })
        return {nodes,edges}
}
module.exports = {filterWithPagination,search,graphData}