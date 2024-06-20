from bs4 import BeautifulSoup
from flask import Flask, jsonify
import requests
import torch
from datetime import datetime
from transformers import RobertaTokenizer, RobertaForSequenceClassification
from confluent_kafka import Consumer,Producer, KafkaError
import os
import pymongo
import torch.nn.functional as F
import time
import docker
import threading
from urllib.parse import urlparse
# from dotenv import load_dotenv

pyclient = pymongo.MongoClient(os.getenv("DB_URL"))
db = pyclient[os.getenv("DB_NAME")]
collection = db[os.getenv("DB_TABLE")]
count_collection = db[os.getenv("COUNT_DB_TABLE")]

def scrape_text(url):
    # Send a GET request to the URL
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the HTML content using Beautiful Soup
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all text content within the HTML tags
        text_content = ' '.join([tag.get_text() for tag in soup.find_all(text=True)])
        
        return text_content
    else:
        print(f"Failed to retrieve content from {url}. Status code: {response.status_code}")
        return None

def update_count(url, urldomain):
    today_date = datetime.today().strftime("%Y-%m-%d")
    document = count_collection.find_one({"date": today_date})
    data = collection.find_one({"url": urldomain, "isRootPath": True})
    try:
        if data.get("isSuspicious"):
            sus = True
        else:
            sus = False
    except:
        return
    if document:
        if (sus and (document.get("illegalurls")!=None and urldomain in document.get("illegalurls"))) or (not sus and (document.get("legalurls")!=None and urldomain in document.get("legalurls"))) :
            pass
        elif (sus and (document.get("legalurls")!=None and urldomain in document.get("legalurls"))):
            count_collection.update_one({"date": today_date}, {"$set": {"legal": document.get("legal", 0) - 1}, "$pull": {"legalurls": urldomain}, "$set": {"illegal": document.get("illegal", 0) + 1}, "$push": {"illegalurls": urldomain}})
        elif (not sus and (document.get("illegalurls")!=None and urldomain in document.get("illegalurls"))):
            count_collection.update_one({"date": today_date}, {"$set": {"illegal": document.get("illegal", 0) - 1}, "$pull": {"illegalurls": urldomain}, "$set": {"legal": document.get("legal", 0) + 1}, "$push": {"legalurls": urldomain}})
        elif (not sus and ((document.get("legalurls")!=None and urldomain not in document.get("legalurls") and (document.get("illegalurls")!=None and urldomain not in document.get("illegalurls"))))):
            count_collection.update_one({"date": today_date}, {"$set": {"legal": document.get("legal", 0) + 1}, "$push": {"legalurls": urldomain}})
        elif (sus and ((document.get("legalurls")!=None and urldomain not in document.get("legalurls") and (document.get("illegalurls")!=None and urldomain not in document.get("illegalurls"))))):
            count_collection.update_one({"date": today_date}, {"$set": {"illegal": document.get("illegal", 0) + 1}, "$push": {"illegalurls": urldomain}})
        else:
            print("ERROR IN UPDATING COUNTS")
        # if document.get("illegal_urls")==None or urldomain not in list(document.get("illegal_urls")):
        #     if sus:
        #         if document.get("legal_urls")!=None and urldomain in list(document.get("legal_urls")):
        #             # remove from legal
        #             count_collection.update_one({"date": today_date, "legal_urls": urldomain}, {"$set": {"legal": document.get("legal", 0) - 1}, "$pull": {"legal_urls": urldomain}})
        #         count_collection.update_one({"date": today_date}, {"$set": {"illegal": document.get("illegal", 0) + 1}, "$push": {"illegal_urls": urldomain}})
        #         print("updated for illegal")
        #     else:            
        #         if document.get("illegal_urls")!=None and urldomain in list(document.get("illegal_urls")):
        #             # remove from illegal
        #             count_collection.update_one({"date": today_date, "illegal_urls": urldomain}, {"$set": {"illegal": document.get("illegal", 0) - 1}, "$pull": {"illegal_urls": urldomain}})
        #         count_collection.update_one({"date": today_date}, {"$set": {"legal": document.get("legal", 0) + 1}, "$push": {"legal_urls": urldomain}})
        #         print(f"updated for legal")
    else:
        # if document.get("legal_urls")==None or urldomain not in list(document.get("legal_urls")):
        if sus:
            new_document = {"date": today_date, "legal": 0, "illegal": 1, "timeout": 0, "legalurls": [], "illegalurls": [urldomain], "timeouturls": []}
            collection.insert_one(new_document)
            print(f"new row created with illegal = 1")
        else:
            new_document = {"date": today_date, "legal": 1, "illegal": 0, "timeout": 0, "legalurls": [urldomain], "illegalurls": [], "timeouturls": []}
            collection.insert_one(new_document)
            print(f"new row craeted with legal = 1")


def predict(data):
    url = ""
    text = ""
    flag = True
    for i in str(data):
        if i==",":
            flag = False
            continue
        if flag:
            url+=i
        else:
            text+=i
    inputs = tokenizer.encode_plus(
        text,
        padding='max_length',
        max_length=128,
        truncation=True,
        return_tensors='pt',
        return_attention_mask=True
    )
    input_ids = inputs['input_ids'].to(device)
    attention_mask = inputs['attention_mask'].to(device)

    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        probabilities = F.softmax(logits, dim=1)[0]
        predicted_probabilities = {f'Class {i}': probability.item() for i, probability in enumerate(probabilities)}

    result = {
        'url': url,
        'predicted_probabilities': predicted_probabilities
    }

    


    # make susscor
    sus = False
    predicted_class = ""
    _ = []
    _.append(predicted_probabilities["Class 0"])
    _.append(predicted_probabilities["Class 1"])
    _.append(predicted_probabilities["Class 2"])
    _.append(predicted_probabilities["Class 3"])                                                                                                                                                                                        
    _.append(predicted_probabilities["Class 4"])
    _.append(predicted_probabilities["Class 5"])
    _.append(predicted_probabilities["Class 6"])
    _.append(predicted_probabilities["Class 7"])
    _.append(predicted_probabilities["Class 8"])
    _.append(predicted_probabilities["Class 9"])
    susScore = {}
    legal = predicted_probabilities["Class 9"]
    if(legal<0.5):
        sus = True
    classes = ["Armory","Crypto","Drugs","Electronics","Financial","Gambling","Hacking","Pornography","Violence"]
    types = []
    for i in range(9):
        score = predicted_probabilities[f"Class {i}"]*100
        if(score>30):
            types.append(classes[i])
        susScore[classes[i]] = score
    susScore["total"] = (1-predicted_probabilities["Class 9"])*100
    print(url)
    print(susScore)
    # Db write (Use upsert instead)
    url = url[2:]
    url = url.rstrip('/')
    if collection.count_documents({"url":url})==0:
        result = {
            "url":url,
            "data":text,
            "susScore": susScore,
            "lastCrawled": datetime.now(),
            "isOnline": True,
            "crawlCount": 1,
        }
        if(sus):
            result["isSuspicious"] = True
            result["types"] = types
        else:
            result["isSuspicious"] = False
        try:
            collection.insert_one(result)
            print("Inserted data into database!")
        except Exception as e:
            print(f"Error in inserting data into database: {e}")
    else:
        records = collection.find({"url":url})
        newrec = records[0]
        newrec["susScore"] = susScore
        newrec["crawlCount"]+=1
        newrec["lastCrawled"] = datetime.now()
        newrec["isOnline"] = True
        newrec["data"] = text
        if(sus):
            newrec["isSuspicious"] = True
            newrec["types"] = types
        else:
            newrec["isSuspicious"] = False
        try:
            collection.update_one({"url":url}, {"$set":newrec})
            print("Updated data into database!")
        except Exception as e:
            print(f"Error in updating data into database: {e}")
    try:
        producer.produce(topic=os.getenv("KAFKA_TOPIC5"), value=str(url))
        producer.flush()
    except Exception as ex:
        print("Exception happened :",ex)

    # Update rootpath document's sus score
    rootpath = '/'.join(url.split('/')[:3])
    # print(rootpath)
    parsed_url = urlparse(url)
    urldomain = f"{parsed_url.scheme}://{parsed_url.netloc}"
    # update_count(url, urldomain)
    if collection.count_documents({"url":rootpath})==0:
        result = {
            "url":rootpath,
            "susScore": susScore,
            "isOnline": True,
            "isRootPath": True
        }
        result["isSuspicious"] = sus
        result["types"] = types
        try:
            collection.insert_one(result)
            print("Inserted data into database!")
        except Exception as e:
            print(f"Error in inserting data into database: {e}")
    else:
        records = collection.find({"url":rootpath})
        newrec = records[0]
        newrec["isOnline"] = True
        newrec["isRootPath"] = True
        # Won't be accurate for multicrime services
        newrec["isSuspicious"] = sus or newrec["isSuspicious"]
        if newrec["susScore"]["total"]<susScore["total"]:
            newrec["susScore"] = susScore
        if("types" not in newrec):
                newrec["types"] = types
        else:
            for t in types:
                if t not in newrec["types"]:
                    newrec["types"].append(t)
        try:
            collection.update_one({"url":rootpath}, {"$set":newrec})
            print("Updated data into database!")
        except Exception as e:
            print(f"Error in updating data into database: {e}")
            
    # if(sus):
    #     if collection.count_documents({"url":rootpath})==0:
    #         result = {
    #             "url":rootpath,
    #             "susScore": susScore,
    #         }
    #         result["isSuspicious"] = True
    #         result["types"] = types
    #         try:
    #             collection.insert_one(result)
    #             print("Inserted data into database!")
    #         except Exception as e:
    #             print(f"Error in inserting data into database: {e}")
    #     else:
    #         records = collection.find({"url":rootpath})
    #         newrec = records[0]
    #         if(newrec["isSuspicious"]==False):
    #             newrec["isSuspicious"] = True
    #             newrec["susScore"] = susScore
    #         else:
    #             # Won't be accurate for multicrime services
    #             if newrec["susScore"]["total"]<susScore["total"]:
    #                 newrec["susScore"] = susScore
    #         if("types" not in newrec):
    #             newrec["types"] = types
    #         else:
    #             for t in types:
    #                 if t not in newrec["types"]:
    #                     newrec["types"].append(t)
    #         try:
    #             collection.update_one({"url":rootpath}, {"$set":newrec})
    #             print("Updated data into database!")
    #         except Exception as e:
    #             print(f"Error in updating data into database: {e}")
    # else:

    update_count(url, urldomain)


conf = {
    'bootstrap.servers': os.getenv("KAFKA_URL"),
    'group.id': "my-consumer-group2",
    'auto.offset.reset': 'smallest'
}

consumer = Consumer(conf)
producer = Producer(conf)

# Load the tokenizer and model
tokenizer = RobertaTokenizer.from_pretrained('fine_tuned_model_roberta')
# tokenizer = RobertaTokenizer.from_pretrained
model = RobertaForSequenceClassification.from_pretrained('fine_tuned_model_roberta')
device = 'cpu'
model.to(device)

topic = os.getenv("KAFKA_TOPIC4")
consumer.subscribe([topic])
print("waiting for message")
while True:
    msg = consumer.poll(500.0)  # Wait for at most 500 second for a message
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
        predict(msg.value())
