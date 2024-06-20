const mongoose = require("mongoose")

const DailyStatSchema = new mongoose.Schema({
    date:{
        type: String
    },
    legal:{
        type: Number
    },
    illegal:{
        type: Number
    },
    timeout:{
        type: Number
    }
})
module.exports = mongoose.model('DailyStat', DailyStatSchema)