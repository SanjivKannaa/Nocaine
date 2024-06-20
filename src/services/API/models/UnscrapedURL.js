// Why a separate model for unscraped URLs?
const mongoose = require("mongoose")
const UnscrapedURLSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    isRootPath:{
        type: Boolean
    }
})
module.exports = mongoose.model('UnscrapedURL', UnscrapedURLSchema)