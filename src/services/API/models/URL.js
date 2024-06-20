const mongoose = require('mongoose');

const URLSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    metaTags:{
        type: Map,
    },
    isRootPath:{
        type: Boolean,
        default: false
    },
    network:{
        type: String,
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    isSuspicious: {
        type: Boolean,
        default: false
    },
    data: {
        type: String,
        required: true
    },
    paths:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'URL'
    },
    subdomains:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'URL'
    },
    susScore: {
        type: Map,
        default: {total:0}
    },
    lastCrawled: {
        type: Date,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        // default: true
    },
    crawlCount: {
        type: Number,
        default: 0
    },
    types: [{
        type: [String],
        enum: ["Armory","Crypto","Drugs","Electronics","Financial","Gambling","Hacking","Pornography","Violence"]
    }],
    links: [{
        type: String
    }],
    edges: [{
        type: String
    }],
    // clearnetSites: [{
    //     type: String
    // }],
    archiveLink:{
        type: String
    },
    onionscan:{
        type: Map
    }
});

module.exports = mongoose.model('URL',URLSchema)