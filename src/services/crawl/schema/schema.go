package schema

import (
	"time"
)

type Activity string

const (
	Pornography Activity = "Pornography"
	Drugs       Activity = "Drugs"
	Weaponry    Activity = "Weaponry"
)

type Network string

const (
	Tor Network = "Tor"
	I2P Network = "I2P"
	// Freenet Network = "Freenet"
	// Tor2Web Network = "Tor2Web"
	Others Network = "Others"
)

type URL struct {
	// ID            primitive.ObjectID `bson:"_id, omitempty"`
	// url unique
	URL           string     `bson:"url, unique"`
	Title		  string 	 `bson:"title"`
	MetaTags	  map[string]string `bson:"metaTags"`
	IsSuspicious  bool       `bson:"isSuspicious"`
	Data          string     `bson:"data"`
	susScore	  map[string]int `bson:"susScore"`
	LastCrawled   time.Time  `bson:"lastCrawled"`
	IsOnline      bool       `bson:"isOnline"`
	CrawlCount    int        `bson:"crawlCount"`
	Type          []Activity `bson:"type,omitempty"` //Types of illegal activities
	Links         []string   `bson:"links"`          //Links to other sites
	Edges		  []string	 `bson:"edges"`			// Links between domains
	// ClearnetSites []string   `bson:"clearnetSites"`  //Clearnet sites hosted by the same ip address
	IsRootPath	  bool       `bson:"isRootPath"`
	Network 	  Network    `bson:"network"`
	Paths	  	  []string   `bson:"paths"`	
}

type UnscrapedUrl struct {
	// ID  primitive.ObjectID `bson:"_id"`
	URL        string `bson:"url"`
	IsRootPath bool   `bson:"isRootPath"`
}

type Count struct {
	Date        string   `bson:"date"`
	Legal       int      `bson:"legal"`
	Illegal     int      `bson:"illegal"`
	Timeout     int      `bson:"timeout"`
	Legalurls   []string `bson:"legalurls"`
	Illegalurls []string `bson:"illegalurls"`
	Timeouturls []string `bson:"timeouturls"`
}
