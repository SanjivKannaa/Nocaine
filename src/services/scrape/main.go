package main

import (
	"bytes"
	"context"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"time"

	// "strconv"

	"github.com/SpiderNitt/nocaine/scrape/schema"

	"syscall"

	"github.com/PuerkitoBio/goquery"
	"github.com/SpiderNitt/nocaine/scrape/config"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/jlaffaye/ftp"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

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
		"group.id":                 "my-consumer-group3",
		"auto.offset.reset":        "earliest",
		"go.events.channel.enable": true,
	})
	if err != nil {
		log.Println("Failed to create kafka consumer: ", err)
	}

	// connecting to FTP server
	ftpServer := os.Getenv("FTP_SERVER")
	ftpUser := os.Getenv("FTP_USER")
	ftpPassword := os.Getenv("FTP_PASS")
	ftpClient, err := ftp.Dial(fmt.Sprintf("%s:21", ftpServer))
	if err != nil {
		log.Println("Error connecting to FTP server:", err)
		return
	}
	defer ftpClient.Quit()

	// Login to the FTP server
	err = ftpClient.Login(ftpUser, ftpPassword)
	if err != nil {
		log.Println("Error logging in:", err)
		return
	} else {
		log.Println("Connected to FTP server")
	}

	Scrap(torhttpClient, i2phttpClient, producer, consumer, ftpClient)
}

func Scrap(torhttpClient *http.Client, i2phttpClient *http.Client, producer *kafka.Producer, consumer *kafka.Consumer, ftpClient *ftp.ServerConn) {
	if a := recover(); a != nil {
		log.Println("Error in Scrap function", a)
	}
	topic := os.Getenv("KAFKA_TOPIC2")
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, syscall.SIGINT, syscall.SIGTERM)
	err := consumer.SubscribeTopics([]string{topic}, nil)
	if err != nil {
		log.Println("Error in subscribing to the kafka topic: ", err)
	}
	run := true
	for run == true {
		select {
		case sig := <-signalChan:
			consumer.Close()
			log.Println("Terminating: ", sig)
			close(signalChan)
			return
		case event := <-consumer.Events():
			switch e := event.(type) {
			case *kafka.Message:
				var mes map[string]string
				err = json.Unmarshal(e.Value, &mes)
				if err != nil {
					log.Println("Error in unmarshalling data: ", err)
				} else {
					log.Println("got message : ", mes["message"])
				}
				ScrapeUrl(mes["message"], producer, torhttpClient, i2phttpClient, ftpClient)
				continue
			default:
				run = true
			}
		default:
			run = true

		}
	}
}

func ScrapeUrl(url string, producer *kafka.Producer, torhttpClient *http.Client, i2phttpClient *http.Client, ftpClient *ftp.ServerConn) {
	//topicCrawler := os.Getenv("KAFKA_TOPIC3")
	topicMlmodel := os.Getenv("KAFKA_TOPIC4")
	// Check if url is root path
	paths := strings.Split(url, "/")
	isRootPath := false
	if len(paths) == 3 {
		isRootPath = true
	}
	var err error
	var resp *http.Response
	if strings.HasSuffix(paths[2], ".i2p") {
		resp, err = i2phttpClient.Get(url)
	} else {
		resp, err = torhttpClient.Get(url)
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
	// Commet out the image upload code
	// doc.Find("img").Each(func(i int, s *goquery.Selection) {
	// 	// 	link, _ := s.Attr("href")
	// 	// 	link = strings.Trim(link, " ")
	// 	// 	mes := map[string]string{
	// 	// 		"message": url,
	// 	// 	}
	// 	// 	jsonBytes, err := json.Marshal(mes)
	// 	// 	if err != nil {
	// 	// 		log.Println("Failed to marshal data: ", err)
	// 	// 	}
	// 	// err = producer.Produce(&kafka.Message{
	// 	// 	TopicPartition: kafka.TopicPartition{Topic: &topicCrawler, Partition: kafka.PartitionAny},
	// 	// 	Value:          jsonBytes,
	// 	// }, nil)
	// 	// 	if err != nil {
	// 	// 		log.Println("Failed to produce messages: ", err)
	// 	// 	}
	// 	// 	log.Println(link)
	// 	// log.Println("got image")
	// 	imgSrc, exists := s.Attr("src")
	// 	if exists {
	// 		if strings.HasPrefix(imgSrc, "http") {
	// 			// Download the image
	// 			imgResp, err := httpClient.Get(imgSrc)
	// 			if err != nil {
	// 				log.Println("Error downloading image", imgSrc, err)
	// 				return
	// 			}
	// 			defer imgResp.Body.Close()
	// 			url_ := convertUrl(url) + "_"

	// 			// Upload the image to FTP server using the function
	// 			err = uploadImageToFTP(ftpClient, imgResp.Body, i, url_)
	// 			if err != nil {
	// 				log.Println("Error uploading image to FTP server", err)
	// 				// log.Println(url + "_" + "image%d.jpg")
	// 				return
	// 			}

	// 			log.Println("Image uploaded to FTP server: ", fmt.Sprintf(url_+"image%d.jpg", i))
	// 		}
	// 	}

	// })
	// document := map[string](string){
	// 	"url":     url,
	// 	"message": doc.Text(),
	// }
	scrap_data := url + "," + doc.Text()
	// jsonBytes, err := json.Marshal(document)
	// if err != nil {
	// 	log.Println("Failed to marshal data: ", err)
	// }
	// if doc.StatusCode() == "200" {
	err = producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topicMlmodel, Partition: kafka.PartitionAny},
		Value:          []byte(scrap_data),
	}, nil)
	if err != nil {
		log.Println("Failed to produce message: ", err)
		// use API2 to scrape and put into DB
		log.Println("using API2 for ", url)
		apiURL := "http://nocaine-api-" + os.Getenv("DEPLOY_SERVER") + ":" + os.Getenv("API2") + "/start2"
		payload := map[string]interface{}{
			"seed_url": url,
		}

		// Convert payload to JSONtor-proxy
		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			log.Println("Error marshaling JSON: ", err)
		}

		// Send POST request to the API server
		response, err := http.Post(apiURL, "application/json", bytes.NewBuffer(payloadBytes))
		if err != nil {
			log.Println("Error making the request: ", err)
		}
		defer response.Body.Close()

		// Decode the JSON response
		var data map[string]interface{}
		err = json.NewDecoder(response.Body).Decode(&data)
		if err != nil {
			log.Println("Error decoding JSON response: ", err)
		} else {
			log.Println(data)
		}

	} else {
		log.Println("data sent to ML model: ", url)
	}
}

func uploadImageToFTP(ftpClient *ftp.ServerConn, imageBody io.Reader, index int, url string) error {
	err := ftpClient.Stor(fmt.Sprintf(url+"image%d.jpg", index), imageBody)
	// fileContents := strconv.Itoa(index)
	fileContents := make([]byte, 8)
	binary.BigEndian.PutUint64(fileContents, uint64(index))
	ftpClient.Stor(url, bytes.NewReader(fileContents))
	return err
}

func convertUrl(url string) string {
	url = strings.TrimPrefix(url, "https://")

	var url_ strings.Builder
	for _, char := range url {
		if char != '/' {
			url_.WriteRune(char)
		} else {
			url_.WriteRune('_')
		}
	}

	result := url_.String()
	return result
}

func ErroneousUrl(urlstring string, isRootPath bool) {
	db := config.Getdb()
	UnscrapedUrl := db.Collection(os.Getenv("FAILURE_DB_TABLE"))
	data := schema.UnscrapedUrl{
		URL:        urlstring,
		IsRootPath: isRootPath,
	}
	// ctx := context.Background()
	res, err := UnscrapedUrl.InsertOne(context.TODO(), data)
	if err != nil {
		log.Println("Failed to insert data into database: ", err)
	} else {
		log.Println("Inserted data into database successfully: ", res)
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
