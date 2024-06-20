package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"sync"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/redis/go-redis/v9"
)

type MessageData struct {
	Message string `json:"message"`
	IsChild string `json:"isChild"`
}

var producer *kafka.Producer

// var redisClient *redis.Client

func main() {
	// err := godotenv.Load("../../env/.env")
	// if err != nil {
	// 	log.Println("Error loading .env file:", err)
	// }
	var redisClient *redis.Client
	fmt.Print("hello")
	redisUrl := os.Getenv("REDIS_URL")
	opt, err := redis.ParseURL(redisUrl)
	if err != nil {
		log.Println("Error parsing redis url", err)
	}
	// fmt.Println("addr is", opt.Addr)
	// fmt.Println("db is", opt.DB)
	// fmt.Println("password is", opt.Password)
	opt.Password = os.Getenv("REDIS_PASSWORD")
	redisClient = redis.NewClient(&redis.Options{
		Addr:     opt.Addr,
		DB:       opt.DB,
		Password: opt.Password,
	})
	ctx := context.Background()
	pong, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Println("Redis Connection failed : ", err)
	} else {
		log.Info("Redis ping ", pong)
		log.Info("Connected to Redis")
	}

	kafka_url := os.Getenv("KAFKA_URL")
	config := kafka.ConfigMap{
		"bootstrap.servers": kafka_url,
		"group.id":          "my-consumer-group2",
		"auto.offset.reset": "earliest",
		// "auto.commit.interval.ms": 8000,
		//		"enable.auto.commit": "false",
	}

	consumer, err := kafka.NewConsumer(&config)
	if err != nil {
		log.Println("Failed to create Kafka consumer:", err)
	}

	topic := os.Getenv("KAFKA_TOPIC1")
	// topic := "to_middleware"
	fmt.Println("listening to topic:", topic)
	err = consumer.SubscribeTopics([]string{topic}, nil)
	if err != nil {
		log.Println("Failed to subscribe to topic:", err)
	}

	producer, err = kafka.NewProducer(&config)
	if err != nil {
		log.Println("Failed to create Kafka producer:", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	wg := &sync.WaitGroup{}
	wg.Add(1)

	go func() {
		defer wg.Done()
		for {
			select {
			case <-ctx.Done():
				return
			default:
				msg, err1 := consumer.ReadMessage(-1)
				// offset, err2 := consumer.Commit()
				// if err2 != nil {
				// 	log.Println(err2)
				// }
				// log.Println(offset)
				if err1 != nil {
					log.Println("Error reading message:", err1)
					break
				}

				processMessage(redisClient, msg.Value)
			}
		}
	}()
	waitForTerminationSignal(cancel, wg)
	consumer.Close()
}

func processMessage(redisClient *redis.Client, value []byte) {
	var data MessageData
	err := json.Unmarshal(value, &data)
	if err != nil {
		log.Println("Failed to parse JSON message:", err)
		return
	}
	message := data.Message
	isChild := data.IsChild == "true"

	// types:
	// 		1. already crawled -> check DB
	// 		2. none -> to next queue
	// fmt.Println("Received message:", data.Message)
	if len(message) >= 4 && strings.HasPrefix(message, "http") {
		fmt.Println("recieved and processing message: ", message)
		jsonData := map[string]string{
			"message": message,
			// "message2": message2,
		}
		jsonBytes, err := json.Marshal(jsonData)
		if err != nil {
			log.Println("Failed to create JSON message:", err)
		}
		if !check_if_already_crawled(redisClient, message) {
			if isChild {
				topic := os.Getenv("KAFKA_TOPIC3")
				// topic = "to_crawler"
				log.Println("Sent child URL to the crawler: ", message)
				kafkaMessage := &kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
					Value:          jsonBytes,
				}

				err = producer.Produce(kafkaMessage, nil)
				if err != nil {
					log.Println("Failed to produce message:", err)
				} else {
					log.Println("Message sent to crawler:", message)
				}
			} else {
				time.Sleep(1 * time.Second)
				topic := os.Getenv("KAFKA_TOPIC2")
				// topic := "to_scrapper"
				log.Println("Sent URL to the scraper: ", message)
				kafkaMessage := &kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
					Value:          jsonBytes,
				}
				err = producer.Produce(kafkaMessage, nil)
				if err != nil {
					log.Println("Failed to produce message:", err)
				} else {
					log.Println("Message sent to scrapper:", message)
					mark_as_crawled_err := mark_as_crawled(redisClient, message)
					if mark_as_crawled_err != nil {
						log.Println("Redis updation failed for: ", message)
					}
				}
			}
		}
		// Find the parent paths
		// if parent path is already crawled, then skip
		// else send to next queue
		paths := strings.Split(message, "/")
		// fmt.Println(paths)
		for i := 3; i < len(paths); i++ {
			path := strings.Join(paths[0:i], "/")
			// fmt.Println(path)
			if !check_if_already_crawled(redisClient, path) {
				jsonData := map[string]string{
					"message": path,
				}
				jsonBytes, err := json.Marshal(jsonData)
				if err != nil {
					log.Println("Failed to create JSON message:", err)
				}
				topic := os.Getenv("KAFKA_TOPIC3")
				// topic := "to_crawler"
				kafkaMessage := &kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
					Value:          jsonBytes,
				}
				err = producer.Produce(kafkaMessage, nil)
				if err != nil {
					log.Println("Failed to produce message:", err)
				} else {
					log.Println("Message sent to Crawler:", path)
				}
			}
		}
	} else {
		fmt.Println("recieved and skipping message: ", message)
	}

}

func mark_as_crawled(redisClient *redis.Client, url string) error {
	ctx := context.Background()
	err := redisClient.Set(ctx, url, "true", 0).Err()
	if err != nil {
		return err
	}
	return nil
}

func check_if_already_crawled(redisClient *redis.Client, url string) bool {
	value, err := redisClient.Get(context.Background(), url).Result()
	if err == redis.Nil {
		fmt.Printf("Value for URL '%s' does not exist in Redis\n", url)
		return false
	} else if err != nil {
		fmt.Printf("Failed to get value from Redis: %v", err)
		return false
	} else {
		fmt.Printf("Value for URL '%s': %s\n", url, value)
		if value == "true" {
			return true
		} else {
			return false
		}
	}
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
