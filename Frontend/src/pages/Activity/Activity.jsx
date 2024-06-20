import React,{useEffect, useState} from 'react'
import { AddIcon, MinusIcon, SearchIcon } from '@chakra-ui/icons'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, Icon, Input, InputGroup, InputRightElement, Select, Stack, Text, Spinner } from '@chakra-ui/react'
import {
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from '@chakra-ui/react'
import Report from '../../Components/Report'
import { filterServices, searchServices } from '../../API/DarkwebData/query'
import InfiniteScroll from 'react-infinite-scroll-component';

function Activity() {
  const [searchVal, setSearchVal] = useState("")
  const [reports, setReports] = useState([{}])
  const [type, setType] = useState("")
  const [crime, setCrime] = useState("")
  const [status, setStatus] = useState("")
  const [suspicionScore, setSuspicionScore] = useState([0,100])
  const [hasMore, setHasMore] = useState(true)
  const [sort,setSort] = useState(-1)
  const [page,setPage] = useState(2)
  const [network,setNetwork] = useState("")
  const archiveUrl = process.env.REACT_APP_ARCHIVE_API_URL
  const handleClick = ()=>{
    console.log(searchVal)
    searchServices({query:searchVal}).then((res)=>{
        setReports(res?.urls)
        if(res?.urls?.length===0){
          setHasMore(false)
          console.log('has more',hasMore)
        }
      }
    ).catch((err)=>{
      console.log(err)
    })
  }
  const fetchData = ()=>{
    console.log(page)
    filterServices({type,crime,status,network,scoreMin:suspicionScore[0],scoreMax:suspicionScore[1],sort,page}).then((res)=>{
      console.log(res.urls)
      
      setReports(reports=>[...reports,...res.urls])
      setPage(x=>x+1)
    if(res.urls.length===0){
        setHasMore(false)
        console.log('has more',hasMore)
      }
    }).catch((err)=>{
      console.log(err)
    })
  }
  useEffect(()=>{
    console.log(type,crime,status,suspicionScore,sort)
    // type,crime,status,scoreMin,scoreMax,sort,page
    filterServices({type,crime,status,network,scoreMin:suspicionScore[0],scoreMax:suspicionScore[1],sort}).then((res)=>{
      console.log(res?.urls)
      setReports(res?.urls)
      if(res?.urls.length===0){
        setHasMore(false)
        console.log('has more',hasMore)
      }
    }).catch((err)=>{
      console.log(err)
    })
  },[,type,crime,status,suspicionScore,sort,network])
  return (
    <Box padding={"20px 40px"}>
      <Flex paddingY={"20px"} flexWrap={"wrap"}>
            <InputGroup size='md' marginBottom={"10px"} marginRight={"20px"}>
              <Input
                  pr='4.5rem'
                  type={'text'}
                  placeholder='Search using keywords'
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  border={'2px solid #FFA800'}
                  color={'white'}
              />
              <InputRightElement width='2rem' padding='5px'>
                  <Button mr={'10px'} h='1.75rem' size='sm' onClick={handleClick} background={'#FFA800'}>
                  <Icon as={SearchIcon} />
                  </Button>
              </InputRightElement>
            </InputGroup>
            <Select placeholder='Select type' bg={"#FFA800"} border={"none"} color={"black"} width={"150px"} marginRight={"20px"} value={type} onChange={e=>setType(e.target.value)}>
                <option value='All'>All</option>
                <option value='Suspicious'>Suspicious</option>
                <option value='Timed Out'>Timed Out</option>
                <option value='Normal'>Normal</option>
            </Select>
            <Select placeholder='Select crime' bg={"tomato"} border={"none"} color={"black"} width={"150px"} marginRight={"20px"} value={crime} onChange={e=>setCrime(e.target.value)}>
                <option value='All'>All</option>
                <option value='Armory'>Armory</option>
                <option value='Crypto'>Crypto</option>
                <option value='Drugs'>Drugs</option>
                <option value='Electronics'>Electronics</option>
                <option value='Financial'>Financial</option>
                <option value='Gambling'>Gambling</option>
                <option value='Hacking'>Hacking</option>
                <option value='Pornography'>Pornography</option>
                <option value='Violence'>Violence</option>
            </Select>
            <Select placeholder='Select status' bg={"#FFA800"} border={"none"} color={"black"} width={"150px"} marginRight={"20px"} value={status} onChange={e=>setStatus(e.target.value)}>
                <option value='All'>All</option>
                <option value='Active'>Active</option>
                <option value='Inactive'>Inactive</option>
            </Select>
            <Select placeholder='Select network' bg={"#FFA800"} border={"none"} color={"black"} width={"150px"} value={network} onChange={e=>setNetwork(e.target.value)}>
                <option value='All'>All</option>
                <option value='Tor'>TOR</option>
                <option value='I2P'>I2P</option>
                <option value='Others'>Others</option>
            </Select>
      </Flex>
      <Flex paddingY={"20px"}>
        <Box color={"white"}>
          <Text>Suspicion Score</Text>
          <RangeSlider aria-label={['min', 'max']} defaultValue={[0, 100]} width={"30vw"} onChange={val=>setSuspicionScore(val)} value={suspicionScore}>
            <RangeSliderTrack>
              <RangeSliderFilledTrack  bg={"tomato"}/>
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
        </Box>
        <Select placeholder='Sort by Suspicion Score' bg={"white"} border={"none"} color={"black"} width={"150px"} marginX={"20px"} value={sort} onChange={e=>setSort(e.target.value)}>
                <option value='-1'>High to Low</option>
                <option value='1'>Low to High</option>
            </Select>
      </Flex>
      <Flex direction={"column"} alignItems={"center"}>
        <Accordion width={"80vw"} allowMultiple>
        <InfiniteScroll
          dataLength={reports?.length} //This is important field to render the next data
          next={fetchData}
          hasMore={hasMore}
          loader={<Spinner color='red.500' />}
          endMessage={
            <p style={{ textAlign: 'center',color:'white' }}>
              <b>You have seen it all</b>
            </p>
          }
        >
          {reports?.map((report,index)=>(
              <Report data={report.data} key={index} title={report.title} url={report.url} active={report.isOnline} isSus={report.isSuspicious} lastVisited={report.lastCrawled} CumScore={report.susScore?.total} susScores={report.susScore} children={report.links}refCount={report.crawlCount} metaTags={report.metaTags} archiveLink={archiveUrl+report.archiveLink} onionscan={report.onionscan} network={report.network} types={report.types} paths={report.paths}/>
            ))
          }
        </InfiniteScroll>
          
        </Accordion>
      </Flex>
    </Box>
  )
}

export default Activity