# NOCAINE - CRAWLER
An intelligent system that monitors, identifies, and investigates illegal activities hosted on the dark web. It is compatible with anonymity networks such as TOR and I2P. It uses the Microservices architecture with twenty services running together. It's designed for distributed deployment, and it's horizontally scalable. We've utilized go routines in the crawl, middleware, and scrape services to boost the performance and multithreading in ML and investigation services. It uses Kafka to handle large volumes of data and distribute messages across different services.

Nocaine classifies the dark web services it reaches into various crime classes based on the text and image content available in it. We've implemented a time-based proxy to take periodic snapshots of the suspicious services using Archivebox. We use Elasticsearch to perform deep searches based on the keywords present in the data monitored by the Nocaine. Onionscan is performed by the investigation service on the classified data to find identifiable information present in the dark web services.

Also, Nocaine includes a GUI with a dashboard, an activities page, and a graph. The dashboard presents the data monitored by the Nocaine, and seed URLs can be provided. The activities page is used to perform an investigation of the collected data. The graph page visualizes Nocaine's journey through the dark web. It can identify interconnection between dark web services, even across networks.

Presentation link: https://docs.google.com/presentation/d/1SBlAnwshifpqhHYl2epFJymaLxpTHuzsut0dcaz89oM/edit?usp=sharing

## Requirements
- Docker

## Setup
- Clone the repo
```bash
$ git clone https://github.com/spidernitt/nocaine
```
- enable docker API
```bash
refer https://medium.com/@ssmak/how-to-enable-docker-remote-api-on-docker-host-7b73bd3278c6
```
- Install and use git-lfs
```bash
$ sudo apt install git-lfs (for debian based distros)
$ git lfs install
$ git lfs pull
```
- Create `url_queue.json` and add seed urls to it. (refer url_queue.example.json)
- Create `.env` file from .env.example 
- Mongo secure key generation
```bash
$ openssl rand -base64 756 > mongo_key_file.txt
$ chmod 400 mongo_key_file.txt
$ chown 999:999 mongo_key_file.txt
```
- Run 
```bash
$ docker-compose --env-file=src/env/.env up -d
```
