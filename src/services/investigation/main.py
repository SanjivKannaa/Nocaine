from confluent_kafka import Consumer, KafkaError
import pymongo
import os
import docker
import threading
import time
import redis
import json

pyclient = pymongo.MongoClient(os.getenv("DB_URL"))
db = pyclient[os.getenv("DB_NAME")]
collection = db[os.getenv("DB_TABLE")]
def investigate(url):
    url = url.decode("utf-8")
    archive_link = ""
    # sending to archivebox
    client = docker.DockerClient(base_url='tcp://host.docker.internal:'+os.getenv("DOCKER_PORT"))
    try:
        command1 = "archivebox add " + str(url)
        command2 = "archivebox list " + str(url)
        vol = {
            str(os.getenv("host_repo_path"))+"/archivebox/data": {
                "bind": "/data", "mode": "rw"
            },
            str(os.getenv("host_repo_path"))+"/archivebox/etc/crontabs": {
                "bind":"/var/spool/cron/crontabs", "mode":"rw"
            }
        }
        client.containers.run("archivebox/archivebox", command1, volumes=vol)
        output = client.containers.run("archivebox/archivebox", command2, volumes=vol)
        print(str(output.split()[0])[8:-1])
        archive_link = str(output.split()[0])[8:-1]+'/index.html'
        client.containers.prune()
        print("Sent to archivebox")
    except Exception as e:
        print(f"Error in sending to archivebox: {e}")
    
    param = url.split('/')[2]
    if(r.get(param) is None):
        if(url.split('/')[2].endswith(".onion")):
            try:
                tor_proxy = "host.docker.internal:9050"
                # tor_proxy = os.getenv("TOR_PROXY_URL")
                r.set(param, "true")
                command = "onionscanv3 --jsonReport --scans tls,ssh,irc,ricochet,ftp,smtp,mongodb,vnc,xmpp,bitcoin,bitcoin_test,litecoin,litecoin_test,dogecoin,dogecoin_test --torProxyAddress="+str(tor_proxy)+" "+str(param)
                onionscan_container = client.containers.get("onionscan")
                _,stream = onionscan_container.exec_run(cmd=command,stream=True)
                report = ""
                for data in stream:
                    if data.decode().startswith('{"hiddenService":'):
                        report = data.decode()
                        break
                onionscan = json.loads(report)
                root_url = '/'.join(url.split('/')[:3])
                records = collection.find({"url":root_url})
                newrec = records[0]
                newrec["onionscan"] = onionscan
                collection.update_one({"url":root_url}, {"$set":newrec})
            except Exception as e:
                print(f"Error performing onionscan: {e}")

    # Db write
    records = collection.find({"url":url})
    newrec = records[0]
    newrec["archiveLink"] = archive_link   
    try:
        collection.update_one({"url":url}, {"$set":newrec})
        print("Updated data into database!")
    except Exception as e:
        print(f"Error in updating data into database: {e}")

    return

conf = {
    'bootstrap.servers': os.getenv("KAFKA_URL"),
    'group.id': "my-consumer-group2",
    'auto.offset.reset': 'smallest'
}

consumer = Consumer(conf)
topic = os.getenv("KAFKA_TOPIC5")
consumer.subscribe([topic])
# Avoid hardcoded URL
# r = redis.Redis(host=os.getenv("REDIS_URL"),password=os.getenv("REDIS_PASSWORD"), decode_responses=True)
r = redis.Redis(host="host.docker.internal",port="6378",password=os.getenv("REDIS_PASSWORD"), decode_responses=True)
print("waiting for message")
while True:
    msg = consumer.poll()
    if msg is None:
        print("got None message at ", time.ctime())
        continue

    if msg.error():
        if msg.error().code() == KafkaError._PARTITION_EOF:
            print('Reached end of partition')
        else:
            print(f'Error while consuming message: {msg.error()}')
    else:
        # print(f'Received message: {msg.value().decode("utf-8")}')
        t = threading.Thread(target=investigate, args=(msg.value(),))
        t.start()
        # Kill the thread after investigation
        # t.join()
        # print("Thread killed")
        
