const { Kafka } = require('kafkajs')
const {checkCrawlerStatus} = require('../services/queueStatus')
const CrawlTime = require('../models/CrawlTime')
const URL = require('../models/URL')
const UnscrapedURL = require('../models/UnscrapedURL')
const DailyStat = require('../models/DailyStat')
const Uptime = require('../models/Uptime')

const kafkaUrl = process.env.KAFKA_URL || 'localhost:9092'
const topic = process.env.KAFKA_TOPIC1 || 'test'
// console.log(kafkaUrl,topic)
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [kafkaUrl]
})
const consumer = kafka.consumer({ groupId: 'my-consumer-group5' })
const producer = kafka.producer()
consumer.connect().then(()=>{
    consumer.subscribe({ topics: [topic] }).then(()=>{
        consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
            //   console.log({
            //     value: message.value.toString(),
            //   })
            }
        })
    })
});
        

const crawlerStatus = async(req,res)=>{
    try{
        if(await checkCrawlerStatus(topic,consumer)){
            return res.status(200).json({running:true})
        }
        return res.status(200).json({running:false})
    }catch(err){
        return res.status(500).json({error:err})
    }
    
}

const crawlerSwitch = async(req,res)=>{
    // {"error":{"name":"KafkaJSNonRetriableError","retriable":false}}
    // https://github.com/tulios/kafkajs/issues/1590
    // https://github.com/tulios/kafkajs/issues/584
    // https://stackoverflow.com/questions/35877047/node-kafka-pause-method-on-consumer-any-working-version
    try{
        const isCrawlerRunning = await checkCrawlerStatus(topic,consumer)
        
        if(isCrawlerRunning){
            consumer.pause([{ topic }])
            const curTime = Date.now()
            const {totalTime,lastCrawled} = await CrawlTime.findOne({})
            const timeDiff = curTime - lastCrawled
            await CrawlTime.findOneAndUpdate({}, { lastCrawled: curTime, totalTime: totalTime+timeDiff })
            return res.status(200).json({running:false})
        }else{
            //start crawler
            consumer.resume([{ topic }])
            const curTime = Date.now()
            await CrawlTime.findOneAndUpdate({}, { lastCrawled: curTime })
            return res.status(200).json({running:true})
        }
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err})
    }
}

const getQueue = async(req,res)=>{
// Read the kafka queue without popping the messages

}

const AddURL = async(req,res)=>{
    try{
        const {url} = req.body
        const topic = process.env.KAFKA_TOPIC3
        // To crawler
        await producer.connect()
        await producer.send({
            topic,
            messages: [
                { value: JSON.stringify({message:url}) },
            ],
          })
        return res.status(200).json({status:"added"})
    }catch(err){
        return res.status(500).json({error:err})
    }

}
const getUptime = async(req,res)=>{
    try{
        const {totalTime,lastCrawled} = await CrawlTime.findOne({})
        // Get UTC time from last crawled time
        const offset = new Date().getTimezoneOffset()

        return res.status(200).json({totalTime,lastCrawled: lastCrawled-offset*60*1000})
    }catch(err){
        return res.status(500).json({error:err})
    }
}

const getServicesCount = async(req,res)=>{
    try{
        const normal = await URL.find({isSuspicious:false,isRootPath:true}).countDocuments()
        const unscraped = await UnscrapedURL.find({isRootPath:true}).countDocuments()
        const suspicious = await URL.find({isSuspicious:true,isRootPath:true}).countDocuments()
        return res.status(200).json({normal,timedOut:unscraped,suspicious})
    }catch(err){
        return res.status(500).json({error:err})
    }
}
const getCrimeCount = async(req,res)=>{
    try{
        const susServices = await URL.find({isSuspicious:true,isRootPath:true})
        const crimeCount = {}
        susServices.forEach(service=>{
            service.types.forEach(type=>{
                // console.log(type[0])
                if(Object.keys(crimeCount).includes(type[0])){
                    crimeCount[type[0]] = crimeCount[type[0]]+1
                }else{
                    crimeCount[type[0]] = 1
                }
            })
        })
        // console.log(crimeCount)
        return res.status(200).json({crimeCount})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err})
    }
}

const getServiceDailyCount = async(req,res)=>{
    try{
        const {type} = req.body
        const curDate = new Date()
        const query = {}
        let offset = null
        if(type=="week"){
            offset = new Date(curDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        }else if(type=="month"){
            offset = new Date(curDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        }else if(type=="year"){
            offset = new Date(curDate.getTime() - 365 * 24 * 60 * 60 * 1000)
        }
        if(offset) query["date"] = {"$gte":offset.toISOString().split('T')[0]}
        const stats = await DailyStat.find(query).sort({date:1}).select('-_id')
        return res.status(200).json({stats})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err})
    }
}
const getUptimeDailyCount = async(req,res)=>{
    try{
        const {type} = req.body
        const curDate = new Date()
        const query = {}
        let offset = null
        if(type=="week"){
            offset = new Date(curDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        }else if(type=="month"){
            offset = new Date(curDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        }else if(type=="year"){
            offset = new Date(curDate.getTime() - 365 * 24 * 60 * 60 * 1000)
        }
        if(offset) query["date"] = {"$gte":offset.toISOString().split('T')[0]}
        const stats = await Uptime.find(query).sort({date:1}).select('-_id')
        return res.status(200).json({stats})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err})
    }
}
module.exports = {crawlerStatus,crawlerSwitch,getQueue,AddURL,getUptime,getServicesCount,getCrimeCount,getServiceDailyCount,getUptimeDailyCount}