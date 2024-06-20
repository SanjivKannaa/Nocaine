package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"
	"context"


	"github.com/confluentinc/confluent-kafka-go/kafka"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Message struct to match the expected JSON structure
type Message struct {
	Message string `json:"Message"`
}

func main() {
	now := time.Now()

	log.Println("Starting cron job...", now)
	// MongoDB connection
	mongoURL := os.Getenv("DB_URL")
	client, err := mongo.NewClient(options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}
	defer client.Disconnect(ctx)
	db := client.Database(os.Getenv("DB_NAME"))
	collection := db.Collection(os.Getenv("FAILURE_DB_TABLE"))

	// Kafka configuration
	bootstrapServers := os.Getenv("KAFKA_URL")
	topic := os.Getenv("KAFKA_TOPIC3")
	configMap := &kafka.ConfigMap{
		"bootstrap.servers": bootstrapServers,
		"group.id":           "my-consumer-group2",
		"auto.offset.reset":  "smallest",
	}
	producer, err := kafka.NewProducer(configMap)
	if err != nil {
		log.Fatal("Error creating Kafka producer:", err)
	}
	defer producer.Close()

	// Fetch data from MongoDB and produce messages to Kafka
	cursor, err := collection.Find(context.Background(), bson.D{})
	if err != nil {
		log.Fatal("Error fetching data from MongoDB:", err)
	}
	defer cursor.Close(context.Background())
	var q []string
	for cursor.Next(context.Background()) {
		var result bson.M
		err := cursor.Decode(&result)
		if err != nil {
			log.Println("Error decoding data from MongoDB:", err)
			continue
		}
		url := result["url"].(string)
		log.Println("read URL:", url)
		q = append(q, url)
		// fmt.Printf("Message sent to topic '%s': %s\n", topic, jsonMessage)
		filter := bson.M{"url": url} // Assuming 'url' is the unique identifier for your documents
		_, err = collection.DeleteOne(context.Background(), filter)
		if err != nil {
			log.Println("Error deleting document from MongoDB:", err)
			continue
		}
		fmt.Printf("removed from the database")
	}
	log.Println("completed reading from DB")
	log.Println("starting to produce to kafka")
	for len(q) > 0 {
		url := q[0]
		log.Println("current url:", url)
		q = q[1:]
		message := Message{Message: url}
		jsonMessage, err := json.Marshal(message)
		if err != nil {
			log.Println("Error marshaling JSON:", err)
			continue
		}
		err = producer.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
			Value:          jsonMessage,
		}, nil)
		if err != nil {
			log.Println("Error producing message to Kafka:", err)
		} else {
			fmt.Printf("Message sent to topic '%s': %s\n", topic, jsonMessage)
		// 	filter := bson.M{"url": url} // Assuming 'url' is the unique identifier for your documents
		// 	_, err = collection.DeleteOne(context.Background(), filter)
		// 	if err != nil {
		// 		log.Println("Error deleting document from MongoDB:", err)
		// 		continue
		// 	}
		// 	fmt.Println("Corresponding row removed from the database")
		}
		producer.Flush(15 * 1000)
	}
	log.Println("going to sleep for 24 hrs")
	time.Sleep(24 * time.Hour)
	main()
}
