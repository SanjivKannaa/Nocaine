// Why a separate model for unscraped URLs?
const mongoose = require("mongoose")
const UptimeSchema = new mongoose.Schema({
    date:{
        type:String,
    },
    key:{
        type:Number,
    },
    upurls:{
        type:Array,
    },
    upcount:{
        type:Number,
    },
    downurls:{
        type:Array,
    },
    downcount:{
        type:Number,
    }
})
module.exports = mongoose.model('Uptime', UptimeSchema)