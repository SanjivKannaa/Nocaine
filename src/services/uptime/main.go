package main

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	// "strconv"

	"github.com/SpiderNitt/nocaine/uptime/config"
	"github.com/SpiderNitt/nocaine/uptime/schema"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func siteup(urlstring string, todaydate string, k int) {
	db := config.Getdb()
	uptime_collection := db.Collection(os.Getenv("UP_TIME_DB_TABLE"))
	var result schema.Uptime
	err := uptime_collection.FindOne(context.Background(), bson.M{"date": todaydate, "key": k}).Decode(&result)
	if err == mongo.ErrNoDocuments {
		_, err = uptime_collection.InsertOne(context.Background(), bson.M{"date": todaydate, "key": k, "upurls": []string{urlstring}, "upcount": 1, "downurls": []string{}, "downcount": 0})
		if err != nil {
			log.Println(err)
		}
	} else if err != nil {
		log.Println(err)
	} else {
		_, err = uptime_collection.UpdateOne(context.Background(), bson.M{"date": todaydate, "key": k}, bson.M{"$push": bson.M{"upurls": urlstring}, "$inc": bson.M{"upcount": 1}})
		if err != nil {
			log.Println(err)
		}
	}
}

func sitedown(urlstring string, todaydate string, k int) {
	db := config.Getdb()
	uptime_collection := db.Collection(os.Getenv("UP_TIME_DB_TABLE"))
	var result schema.Uptime
	err := uptime_collection.FindOne(context.Background(), bson.M{"date": todaydate, "key": k}).Decode(&result)
	if err == mongo.ErrNoDocuments {
		_, err = uptime_collection.InsertOne(context.Background(), bson.M{"date": todaydate, "key": k, "upurls": []string{}, "upcount": 0, "downurls": []string{urlstring}, "downcount": 1})
		if err != nil {
			log.Println(err)
		}
	} else if err != nil {
		log.Println(err)
	} else {
		_, err = uptime_collection.UpdateOne(context.Background(), bson.M{"date": todaydate, "key": k}, bson.M{"$push": bson.M{"downurls": urlstring}, "$inc": bson.M{"downcount": 1}})
		if err != nil {
			log.Println(err)
		}
	}
}

func process(urlstring string, todaydate string, k int) {
	// TOR proxy setup
	torProxyUrl := os.Getenv("TOR_PROXY_URL")
	torProxy, err := url.Parse(torProxyUrl)
	if err != nil {
		log.Println("Unable to parse TOR proxy url", err)
	}
	torTransport := &http.Transport{Proxy: http.ProxyURL(torProxy)}
	// No timeout
	torhttpClient := &http.Client{Transport: torTransport}
	log.Println("Tor proxy setup done!!!")
	// I2P proxy setup
	i2pProxyUrl := os.Getenv("I2P_PROXY_URL")
	i2pProxy, err := url.Parse(i2pProxyUrl)
	if err != nil {
		log.Println("Unable to parse i2p proxy url", err)
	}
	i2pTransport := &http.Transport{Proxy: http.ProxyURL(i2pProxy)}
	// No timeout
	i2phttpClient := &http.Client{Transport: i2pTransport}
	log.Println("I2P proxy setup done!!!")
	paths := strings.Split(urlstring, "/")
	if len(paths) < 3 {
		return
	}
	var resp *http.Response
	if strings.HasSuffix(paths[2], ".i2p") {
		resp, err = i2phttpClient.Get(urlstring)
	} else {
		resp, err = torhttpClient.Get(urlstring)
	}
	if err != nil {
		log.Fatal(err)
		return
	}
	if resp.StatusCode != 200 {
		log.Println("site down", resp.StatusCode)
		sitedown(urlstring, todaydate, k)
	} else {
		log.Println("site up", resp.StatusCode)
		siteup(urlstring, todaydate, k)
	}
}

func main() {
	config.InitDB()
	db := config.Getdb()
	todaydate := time.Now().Format("2006-01-02")
	count := 0
	uptime_collection := db.Collection(os.Getenv("UP_TIME_DB_TABLE"))
	cursor, err := uptime_collection.Find(context.Background(), bson.M{"date": todaydate})
	defer cursor.Close(context.Background())
	if err != nil {
		log.Println(err)
	}

	for cursor.Next(context.Background()) {
		var existing_data schema.Uptime
		if err := cursor.Decode(&existing_data); err != nil {
			log.Println(err)
			continue
		}

		// Process each row (existing_data) as needed
		count++
	}

	if err := cursor.Err(); err != nil {
		log.Println(err)
		return
	}
	collection := db.Collection(os.Getenv("DB_TABLE"))
	cursor, err = collection.Find(context.Background(), bson.M{"isRootPath": true})
	if err != nil {
		log.Println(err)
	}

	defer cursor.Close(context.Background())
	for cursor.Next(context.Background()) {
		var existing_data schema.URL
		if err := cursor.Decode(&existing_data); err != nil {
			log.Println(err)
			continue
		}

		// Process each row (existing_data) as needed
		log.Println("processing", existing_data.URL)
		process(existing_data.URL, todaydate, count)
	}

	if err := cursor.Err(); err != nil {
		log.Println(err)
		return
	}
	time.Sleep(6 * time.Hour)
}
