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

type URL struct {
	// ID            primitive.ObjectID `bson:"_id, omitempty"`
	URL           string     `bson:"url, unique"`
	IsSuspicious  bool       `bson:"isSuspicious"`
	Data          string     `bson:"data"`
	susScore	  map[string]int `bson:"susScore"`
	LastCrawled   time.Time  `bson:"lastCrawled"`
	IsOnline      bool       `bson:"isOnline"`
	CrawlCount    int        `bson:"crawlCount"`
	Type          []Activity `bson:"type,omitempty"` //Types of illegal activities
	Links         []string   `bson:"links"`          //Links to other sites
	// ClearnetSites []string   `bson:"clearnetSites"`  //Clearnet sites hosted by the same ip address
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
