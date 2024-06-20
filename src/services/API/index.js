require('dotenv').config({ path: './src/env/.env' });
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.API;
const routes = require('./routes');
const mongoose = require('mongoose');
const CrawlTime = require('./models/CrawlTime');
const { mapDataToIndex } = require('./helpers/elasticsearch');
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api', routes)

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: process.env.DB_NAME })
    .then(() => {
        console.log('Database connected')
        CrawlTime.find({}).then((data) => {
            if (data.length === 0) {
                // Create a new crawlTime document
                const crawlTime = new CrawlTime({
                    totalTime: 0,
                    lastCrawled: Date.now()
                })
                crawlTime.save()
            }
        }).catch(err => console.log(err));
        // mapDataToIndex().then(() => {
        //     console.log('Data mapped to index')
        // }).catch(err => console.log(err));
    })
    .catch(err => console.log(err));

app.listen(port, () => console.log(`server started at port ${port}`));