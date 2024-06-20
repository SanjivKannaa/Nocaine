package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/SpiderNitt/nocaine/crawl/config"

	// "github.com/SpiderNitt/nocaine/crawl/helpers"
	"github.com/SpiderNitt/nocaine/crawl/schema"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MessageData struct {
	Message string `json:"message"`
}
type void struct{}
var value void

func main() {
	// err := godotenv.Load("../../env/.env")
	// if err != nil {
	// 	log.Println("Error in loading the .env file: ", err)
	// }
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

	config.InitDB()
	kafkaUrl := os.Getenv("KAFKA_URL")
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": kafkaUrl,
	})
	if err != nil {
		log.Println("Failed to create kafka producer: ", err)
	}
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":        kafkaUrl,
		"group.id":                 "my-consumer-group1",
		"auto.offset.reset":        "earliest",
		"go.events.channel.enable": true,
	})
	if err != nil {
		log.Println("Failed to create kafka consumer: ", err)
	}

	log.Println(torhttpClient)
	log.Println(i2phttpClient)
	log.Println(producer)
	log.Println(consumer)

	ctx, cancel := context.WithCancel(context.Background())
	wg := &sync.WaitGroup{}
	wg.Add(2)

	// to crawl seed url
	// go func() {
	// 	defer wg.Done()

	// 	// Get the seed urls
	// 	urls, err := helpers.Read("url_queue.json")
	// 	if err != nil {
	// 		log.Println(err)
	// 	}
	// 	for len(urls) > 0 {
	// 		cur := urls[0]
	// 		// Remove the current url from the queue
	// 		urls = urls[1:]
	// 		current := strings.Trim(cur.Url, "/")
	// 		// data := map[string]string{
	// 		// 	"message": current,
	// 		// }
	// 		// jsonBytes, err := json.Marshal(data)
	// 		// if err != nil {
	// 		// 	log.Println("Failed to create json message: ", err)
	// 		// }

	// 		// topic := os.Getenv("KAFKA_TOPIC3")
	// 		// // for testing API
	// 		// // time.Sleep(1 * time.Second)
	// 		// err = producer.Produce(&kafka.Message{
	// 		// 	TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
	// 		// 	Value:          jsonBytes,
	// 		// }, nil)
	// 		// if err != nil {
	// 		// 	log.Println("Failed to produce kafka message: ", err)
	// 		// }
	// 		crawlUrl(current, producer, httpClient)
	// 	}
	// }()
	go func(torhttpClient *http.Client, i2phttpClient *http.Client, producer *kafka.Producer, consumer *kafka.Consumer) {
		defer wg.Done()
		msg_count := 0
		for {
			select {
			case <-ctx.Done():
				return
			default:
				//msg, err := consumer.ReadMessage(-1)
				if err != nil {
					log.Println("Error reading message:", err)
					break
				}

				Crawl(torhttpClient, i2phttpClient, producer, consumer, msg_count)
			}
		}
	}(torhttpClient, i2phttpClient, producer, consumer)
	waitForTerminationSignal(cancel, wg)
	//Crawl(httpClient, producer, consumer)
}

func Crawl(torhttpClient *http.Client, i2phttpClient *http.Client, producer *kafka.Producer, consumer *kafka.Consumer, msg_count int) {
	if a := recover(); a != nil {
		log.Println("Error in crawling function", a)
		return
	}

	// check if a visited url file exists
	// _, err := os.Stat("visited.json")
	// if err != nil {
	// 	if os.IsNotExist(err) {
	// 		os.Create("visited.json")
	// 	}
	// }

	// // Get the seed urls
	// urls, err := helpers.Read("url_queue.json")
	// if err != nil {
	// 	log.Println(err)
	// }

	// // adding seed urls(from url_queue.json) to KAFKA_TOPIC1
	// for len(urls) > 0 {
	// 	cur := urls[0]
	// 	// Remove the current url from the queue
	// 	urls = urls[1:]
	// 	data := map[string]string{
	// 		"message": cur.Url,
	// 	}
	// 	jsonBytes, err := json.Marshal(data)
	// 	if err != nil {
	// 		log.Println("Failed to create json message: ", err)
	// 	}
	// 	topic := os.Getenv("KAFKA_TOPIC1")
	// 	err = producer.Produce(&kafka.Message{
	// 		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
	// 		Value:          jsonBytes,
	// 	}, nil)
	// 	if err != nil {
	// 		log.Println("Failed to produce kafka message: ", err)
	// 	}
	// links, err := Scrap(httpClient, cur.Url)
	// if err != nil {
	// 	log.Println("Error scraping the url => ", cur.Url, " : ", err)
	// 	continue
	// }

	// Update the visited urls
	// visited, err := helpers.Read("visited.json")
	// if err != nil {
	// 	log.Println(err)
	// }
	// visited = append(visited, cur)
	// err = helpers.Write(visited, "visited.json")
	// if err != nil {
	// 	log.Println(err)
	// }

	// Update the url queue
	// for _, i := range links {
	// 	if i != "" {
	// 		urls = append(urls, helpers.Link{Url: i})
	// 	}
	// }
	// err = helpers.Write(urls, "url_queue.json")
	// if err != nil {
	// 	log.Println(err)
	// }
	//}
	// signalChan := make(chan os.Signal, 1)
	// signal.Notify(signalChan, syscall.SIGINT, syscall.SIGTERM)
	topic1 := os.Getenv("KAFKA_TOPIC3")
	err := consumer.SubscribeTopics([]string{topic1}, nil)
	if err != nil {
		log.Println("Failed to subscribe to kafka topic: ", err)
	}
	msg, err := consumer.ReadMessage(-1)
	if err != nil {
		log.Println("Error reading message:", err)
	}
	msg_count += 1
	// if msg_count % MIN_COMMIT_COUNT == 0 {
	// 	go func() {
	// 		consumer.Commit()
	// 	}()
	// }
	// fmt.Printf("%% Message on %s:\n%s\n",
	// 	e.TopicPartition, string(e.Value))
	if msg != nil {
		var data MessageData
		err = json.Unmarshal(msg.Value, &data)
		if err != nil {
			log.Println("Failed to parse JSON message:", err)
			return
		}
		message := data.Message
		fmt.Println("recieved message: ", message)
		crawlUrl(message, producer, torhttpClient, i2phttpClient)
	}
	// run := true
	// go func() {
	// for run == true {
	// 	select {
	// 	case sig := <-signalChan:
	// 		consumer.Close()
	// 		fmt.Println("Terminating: ", sig)
	// 		close(signalChan)
	// 		return
	// 	case event := <-consumer.Events():
	// 		switch e := event.(type) {
	// 		case *kafka.Message:
	// 			var mes map[string]string
	// 			err = json.Unmarshal(e.Value, &mes)
	// 			fmt.Println("The message is: ", mes["message"])
	// 			topic := os.Getenv("KAFKA_TOPIC1")
	// 			err = producer.Produce(&kafka.Message{
	// 				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
	// 				Value:          e.Value,
	// 			}, nil)
	// 			if err != nil {
	// 				log.Println("Error in producing messages: ", err)
	// 			}
	// 		default:
	// 			// fmt.Println("Error in consuming messages: ", e)
	// 			run = true
	// 		}
	// 	default:
	// 		// fmt.Println("gonna terminate")
	// 		run = true

	// 	}
	// }
	// }()

}

func waitForTerminationSignal(cancel context.CancelFunc, wg *sync.WaitGroup) {
	// err := redisClient.Close()
	// if err != nil {
	// log.Printlnf("Failed to close Redis client: %v", err)
	// }
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt)
	signal.Notify(signalChan, os.Kill)
	<-signalChan
	log.Println("Termination signal received. Shutting down...")
	cancel()
	wg.Wait()
	os.Exit(0)
}

func crawlUrl(url string, producer *kafka.Producer, torhttpClient *http.Client, i2phttpClient *http.Client) {
	topicMiddleware := os.Getenv("KAFKA_TOPIC1")

	paths := strings.Split(url, "/")
	if len(paths) < 3 {
		return
	}
	network := schema.Others
	var err error
	var resp *http.Response
	if strings.HasSuffix(paths[2], ".i2p") {
		network = schema.I2P
		resp, err = i2phttpClient.Get(url)
	} else {
		if strings.HasSuffix(paths[2], ".onion") {
			network = schema.Tor
		}
		resp, err = torhttpClient.Get(url)
	}

	url = strings.Trim(url, "/")
	url = strings.Trim(url," ")
	log.Println(url)
	// Check if url is root path
	path := strings.Split(url, "/")
	isRootPath := false
	if len(path) == 3 {
		isRootPath = true
	}
	if err != nil {
		log.Println("Error getting data from the url ", url, err)
		ErroneousUrl(url, isRootPath)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		log.Println("Error in fetching the page", url, resp.StatusCode)
		ErroneousUrl(url, isRootPath)
		return
	}
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		log.Println("Error parsing data from the url ", url, err)
		ErroneousUrl(url, isRootPath)
		return
	}
	// Get the title of the page
	title := doc.Find("title").Text()
	log.Println("The title of the page is: ", title)

	// Get meta tags
	metaTags := make(map[string]string)
	doc.Find("meta").Each(func(i int, s *goquery.Selection) {
		name, _ := s.Attr("name")
		content, _ := s.Attr("content")
		if name != "" {
			metaTags[name] = content
		}
	})

	// Add the children urls to URL collection
	
	child_urls_unique := make(map[string]void)
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		link, _ := s.Attr("href")
		link = strings.Trim(link, " ")
		// Ignore id links
		if len(link) == 0 || link == "/" {
			return
		}
		if strings.HasPrefix(link, "#") {
			return
		}
		// Find same domain sublinks
		if strings.HasPrefix(link, "/") {
			link = url + link
		}
		if(!strings.HasPrefix(link,"http") && !strings.HasPrefix(link,"https")){
			link = url + "/" + link
		}
		// Check if child_urls_unique already contains the link
		if _, ok := child_urls_unique[link]; ok {
			return
		}
		
		// child_urls = append(child_urls, link)
		child_urls_unique[link] = value
		mes := map[string]string{
			"message": link,
			"isChild": "true",
		}
		jsonBytes, err := json.Marshal(mes)
		if err != nil {
			log.Println("Failed to marshal data: ", err)
		}
		fmt.Println("URLs entering the crawler: ",link)
		err = producer.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &topicMiddleware, Partition: kafka.PartitionAny},
			Value:          jsonBytes,
		}, nil)
		if err != nil {
			fmt.Println("Failed to produce messages: ", err)
		}
		// fmt.Println(link)
	})
	var child_urls []string
	for i := range child_urls_unique {
		child_urls = append(child_urls,i)
	}
	// fmt.Println("The child urls are: ", child_urls)
	db := config.Getdb()
	if db == nil {
		log.Fatal("Failed to connect to the database")
		os.Exit(1)
	}
	urlCollection := db.Collection("urls")
	// Check if url startswith b'
	if url[:2] == "b'" {
		url = url[2:]
	}

	// Check if url is a dark web url
	// paths := strings.Split(url, "/")
	// network := schema.Others
	// if strings.Contains(paths[2], ".onion") {
	// 	network = schema.Tor
	// } else if strings.Contains(paths[2], ".i2p") {
	// 	network = schema.I2P
	// }

	type void struct{}
	var value void
	edges_unique := make(map[string]void)
	// Get domains from the child urls and update the root path document
	for _, i := range child_urls {
		if strings.HasPrefix(i, "http://") || strings.HasPrefix(i, "https://") {
			domain := strings.Join(strings.Split(i, "/")[0:3], "/")
			edges_unique[domain] = value
		}
	}
	edges := make([]string,0)
	for i := range edges_unique {
		edges = append(edges, i)
	}
	// Update the root path document
	data := schema.URL{
		Title:      title,
		MetaTags:   metaTags,
		URL:        url,
		Links:      child_urls,
		IsRootPath: isRootPath,
		Network:    network,
		Paths:		make([]string,0),
	}

	var exists schema.URL
	error := urlCollection.FindOne(context.Background(), bson.M{"url": url}).Decode(&exists)
	if error != nil {
		log.Println("Failed to find data in database: ", error)
	}
	// log.Println(exists)
	if exists.URL == "" {
		if isRootPath {
			data.Edges = edges
		}
		res, err := urlCollection.InsertOne(context.Background(), data)
		if err != nil {
			log.Println("Failed to insert data into database: ", err)
		} else {
			log.Println("Inserted data into database successfully: ", res)
			mes := map[string]string{
				"message": url,
				"isChild": "false",
			}
			jsonBytes, err := json.Marshal(mes)
			if err != nil {
				log.Println("Failed to marshal data: ", err)
			}
			err = producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topicMiddleware, Partition: kafka.PartitionAny},
				Value:          jsonBytes,
			}, nil)
			if err != nil {
				fmt.Println("Failed to produce messages: ", err)
			}
		}
	} else {
		// Update the edges
		log.Println("The paths are: ", exists.Paths)
		if exists.Paths == nil {
			data.Paths = make([]string,0)
		}
		var update bson.M
		if exists.Edges == nil {
			update=bson.M{
				"$set":bson.M{
					"title":title,
					"metaTags":metaTags,
					"links":child_urls,
					"network":network,
					"isRootPath":isRootPath,
					"paths":data.Paths,
					"edges": make([]string,0),
				},
			}
		}else{
			update=bson.M{
				"$set":bson.M{
					"title":title,
					"metaTags":metaTags,
					"links":child_urls,
					"network":network,
					"isRootPath":isRootPath,
					"paths":data.Paths,
				},
				"$addToSet":bson.M{
					"edges":bson.M{"$each":edges},
				},
			}
		}
		// if exists.Edges == nil {
		// 	update["$set"]["edges"] = make([]string,0)
		// }else{
		// 	update["$addToSet"]["edges"] = url
		// }
		res, err := urlCollection.UpdateOne(context.Background(), bson.M{"url": url}, update)
		if err != nil {
			log.Println("Failed to update last crawled time: ", err)
		} else {
			log.Println("Updated last crawled time successfully: ", res)
		}
	}
	// Find the parent paths
	if !isRootPath {
		parentPath := strings.Join(path[:len(path)-1], "/")
		fmt.Println("The parent path is: ", parentPath)
		// Upsert the parent path document and add the url to its paths array
		// opts := options.Update().SetUpsert(true)
		// filter := schema.URL{URL: parentPath}
		var exists schema.URL
		error := urlCollection.FindOne(context.Background(), bson.M{"url": parentPath}).Decode(&exists)
		if error != nil {
			log.Println("Failed to find data in database: ", error)
		}
		// log.Println(exists)
		rootPath := strings.Join(path[:3], "/")
		if exists.URL != "" {
			var update bson.M
			// update := schema.URL{Paths: append(exists.Paths, url)}
			if rootPath == parentPath {
				update = bson.M{"edges":bson.M{"$each":edges}}
				// exists.Edges = append(exists.Edges, edges...)
			}else{
				update = bson.M{"paths":url}
				// exists.Edges = append(exists.Edges,edges...)
				// exists.Paths = append(exists.Paths,url)
			}

			res, err := urlCollection.UpdateOne(context.Background(), bson.M{"url":parentPath}, bson.M{"$addToSet":update})
			if err != nil {
				log.Println("Failed to update parent path document: ", err)
			} else {
				log.Println("Updated parent path document successfully: ", res)
			}
		} else {
			// If the parent path document doesn't exist, then create a new document
			data := schema.URL{
				Edges:	make([]string,0),
				Paths: []string{url},
				URL:   parentPath,
			}
			if rootPath == parentPath {
				data.Edges = edges
			}
			res, err := urlCollection.InsertOne(context.Background(), data)
			if err != nil {
				log.Println("Failed to insert data into database: ", err)
			} else {
				log.Println("Inserted data into database successfully: ", res)
			}
		}

		// Update the edges of the root path document
		if rootPath != parentPath {
			// filter = schema.URL{URL: rootPath}
			log.Println(rootPath)
			var exists schema.URL
			error := urlCollection.FindOne(context.Background(), bson.M{"url": rootPath}).Decode(&exists)
			if error != nil {
				log.Println("Failed to find data in database: ", error)
			}
			// log.Println(exists)
			if exists.URL != "" {
				update := bson.M{"edges":bson.M{"$each":edges}}
				// exists.Edges = append(exists.Edges,edges...)
				res, err := urlCollection.UpdateOne(context.Background(), bson.M{"url":rootPath}, bson.M{"$addToSet":update})
				if err != nil {
					log.Println("Failed to update root path document: ", err)
				} else {
					log.Println("Updated root path document successfully: ", res)
				}
			} else {
				// If the root path document doesn't exist, then create a new document
				data := schema.URL{
					Edges: edges,
					URL:   rootPath,
					Paths: make([]string,0),
				}
				res, err := urlCollection.InsertOne(context.Background(), data)
				if err != nil {
					log.Println("Failed to insert data into database: ", err)
				} else {
					log.Println("Inserted data into database successfully: ", res)
				}
			}
		}
	}
}

func ErroneousUrl(urlstring string, isRootPath bool) {
	db := config.Getdb()
	if db == nil {
		// Handle the error, log it, or return from the function
		log.Println("Failed to connect to the database")
	}
	unscrapedUrl := db.Collection(os.Getenv("FAILURE_DB_TABLE"))
	data := schema.UnscrapedUrl{
		URL:        urlstring,
		IsRootPath: isRootPath,
	}
	var exists schema.UnscrapedUrl
	error := unscrapedUrl.FindOne(context.Background(), bson.M{"url": urlstring}).Decode(&exists)
	if error != nil {
		log.Println("Failed to find data in database: ", error)
	}
	// log.Println(exists)
	if exists.URL == "" {
		// ctx := context.Background()
		res, err := unscrapedUrl.InsertOne(context.TODO(), data)
		if err != nil {
			log.Println("Failed to insert data into database: ", err)
		} else {
			log.Println("Inserted data into database successfully: ", res)
		}
	}
	log.Println("starting ErroneousUrl for ", urlstring)
	parsedURL, err := url.Parse(urlstring)
	if err != nil {
		fmt.Printf("Error parsing URL %s: %s\n", urlstring, err)
	}
	// Extracting the scheme and host to construct the domain
	domainURL := &url.URL{
		Scheme: parsedURL.Scheme,
		Host:   parsedURL.Host,
	}

	// Convert the URL back to a string
	domainString := domainURL.String()
	countcollection := db.Collection(os.Getenv("COUNT_DB_TABLE"))
	todayDate := time.Now().Format("2006-01-02")
	filter := bson.M{"date": todayDate}
	var result schema.Count
	err = countcollection.FindOne(context.Background(), filter).Decode(&result)
	if err == mongo.ErrNoDocuments {
		// If there isn't a match, create a new entry
		newEntry := bson.M{"date": todayDate, "legal": 0, "illegal": 0, "timeout": 1, "legalurls": []string{}, "illegalurls": []string{}, "timeouturls": []string{domainString}}
		_, err := countcollection.InsertOne(context.Background(), newEntry)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("New entry created:", newEntry)
	} else if err != nil {
		log.Fatal(err)
	} else {
		// If there is a match, update the row by incrementing the value of "timeout" by 1
		// log.Println(result["timeouturls"])

		urlAlreadyExists := false
		for _, existingURL := range result.Timeouturls {
			if existingURL == domainString {
				urlAlreadyExists = true
				break
			}
		}
		if !urlAlreadyExists {
			update := bson.M{"$inc": bson.M{"timeout": 1}, "$push": bson.M{"timeouturls": domainString}}
			_, err := countcollection.UpdateOne(context.Background(), filter, update)
			if err != nil {
				log.Fatal(err)
			}
			fmt.Println("Row updated:", filter)
		} else {
			log.Println("url already exists")
		}

		// 	update := bson.M{"$inc": bson.M{"timeout": 1}}
		// 	_, err := countcollection.UpdateOne(context.Background(), filter, update)
		// 	if err != nil {
		// 		log.Fatal(err)
		// 	}
		// 	fmt.Println("Row updated:", filter)
	}
}

// adding this comment for checking
