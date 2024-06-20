const checkCrawlerStatus = async (topic,consumer) => {
    try {
        const pausedTopics = await consumer.paused();
        for(const i of pausedTopics){
            // console.log(i.topic,topic)
            if(i.topic==topic) return false;
        }
        return true;
    }
    catch (err) {
        return { error: err };
    }
}
module.exports = { checkCrawlerStatus}