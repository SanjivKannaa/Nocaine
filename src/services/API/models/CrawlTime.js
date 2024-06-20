// Find a better way to store this data
const mongoose = require("mongoose")
const CrawlTimeSchema = new mongoose.Schema({
    totalTime: {
        type: Number,
        required: true,
        default: 0,
    },
    lastCrawled: {
        type: Date,
    },
})
module.exports = mongoose.model('CrawlTime', CrawlTimeSchema)