const { Client } = require('@elastic/elasticsearch');
require('dotenv').config({ path: './src/env/.env' });
const elasticsearchApiUrl = process.env.ELASTICSEARCH_API_URL
const client = new Client({ node: elasticsearchApiUrl });
const URL = require('../models/URL')

async function mapDataToIndex() {
  const urls = await URL.find({}).select('-_id').lean()

  urls.forEach(async (url) => {
    await client.index({
      index: 'urls',
      body: {
        url: url.url,
        links: url.links,
        types: url.types,
        isSuspicious: url.isSuspicious,
        network: url.network,
        edges: url.edges,
        susScore: url.susScore,
        isOnline: url.isOnline,
        isRootPath: url.isRootPath,
        data: url.data,
        }
    });
  });
}

async function elasticsearch(query){
    const { body } = await client.search({
        // scroll: '30s',
        body: {
          query: {
            multi_match: {
                query,
                fields: [],
            }
          }
        }
      });
    return body.hits.hits
    //   let scrollId = body._scroll_id;
    //   let hits = body.hits.hits;
    
    //   while (hits.length) {
    //     hits.forEach(hit => callback(hit));
    
    //     const { body: scrollResponse } = await client.scroll({
    //       scroll: '30s',
    //       scrollId: scrollId
    //     });
    
    //     scrollId = scrollResponse._scroll_id;
    //     hits = scrollResponse.hits.hits;
    //   }
}
module.exports = {mapDataToIndex,elasticsearch}