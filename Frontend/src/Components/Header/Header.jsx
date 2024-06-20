import {Text, Box, Flex, Image, Icon, Button, Input, InputGroup, InputRightElement,useToast} from "@chakra-ui/react"
import {RepeatClockIcon,ExternalLinkIcon,AddIcon} from "@chakra-ui/icons"
import { Switch } from '@chakra-ui/react'
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import Moment from "react-moment"
import getUptime from "../../API/Crawler/uptime"
import {getStatus,switchStatus} from "../../API/Crawler/status"
import { addUrlToQueue } from "../../API/Crawler/queue";
const Header = ()=>{
    const location = useLocation();
    const [url,setUrl] = useState('')
    const [uptime, setUptime] = useState(0);
    const [isOn, setIsOn] = useState(false);
    const [displaytoast, setDisplaytoast] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("");
    const toast = useToast()

    const handleSwitch = ()=>{
        switchStatus().then((data)=>{
            console.log(data)
            if(data.running){
                setIsOn(true)
            }else{
                setIsOn(false)
            }
        }).catch((err)=>{
            console.log(err)
            setMessage("Encountered error")
            setDisplaytoast(true)
            setType("error")
        })
    }
    const handleClick = async()=>{
        try{
          await addUrlToQueue(url)
          toast({
            title: 'The Seed URL has been added successfully',
            description: `The URL ${url} will be consumed by the crawler once the queue frees up`,
            status: 'success',
            duration: 9000,
            isClosable: true,
          })
          setUrl('')
        //   setMessage("URL added successfully")
        //   setDisplaytoast(true)
        //   setType("success")
        }catch(e){
            console.log(e)
            toast({
                title: 'Error adding URL',
                description: "The API has faced some error",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        }
      }
    useEffect(()=>{
        getUptime().then((data)=>{
            // console.log(data)
            // console.log(data.totalTime,Date.now()-data.lastCrawled)
            setUptime(data.totalTime+Date.now()-data.lastCrawled)
        }).catch((err)=>{
            // Toast
            console.log(err)
            setMessage("Encountered error fetching uptime")
            setDisplaytoast(true)
            setType("error")
        })
        getStatus().then((data)=>{
            if(data.running){
                setIsOn(true)
            }else{
                setIsOn(false)
            }
        }).catch((err)=>{
            
            setMessage("Error fetching the crawler status")
            setDisplaytoast(true)
            setType("error")
        })
    },[])
    useEffect(()=>{
        const timer = setInterval(() => {
            // console.log(isOn)
            if(isOn){
                // console.log(uptime)
                setUptime(x=>x+1000)
            }
        }, 1000);
        return ()=>clearInterval(timer)
    },[,uptime,isOn])
    // useEffect(() => {
    //     console.log(`The current route is ${location.pathname}`);
    // }, [location]);
    return (
        <>
        <Flex color={"#FFA800"} width={"100%"} zIndex="1" justifyContent={"space-between"} alignItems={"center"} fontFamily={"Advent Pro"} padding={"20px 80px"}>
            <Box>
                <Text fontSize={"3em"}>NOCAINE</Text>
            </Box>
            <Box>
                {
                    location.pathname === "/" ?(
                    <Flex alignItems={"center"}>
                        <InputGroup size='md'>
                            <Input
                                pr='4.5rem'
                                type={'text'}
                                placeholder='Add Seed URL'
                                border={'2px solid #FFA800'}
                                value={url}
                                onChange={(e)=>setUrl(e.target.value)}
                                color={'white'}
                            />
                            <InputRightElement width='2rem' padding='5px'>
                                <Button mr={'10px'} h='1.75rem' size='sm' onClick={handleClick} background={'#FFA800'}>
                                <Icon as={AddIcon} />
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <Button as="a" href={process.env.REACT_APP_ARCHIVE_API_URL} target="_blank" variant={"outline"} marginLeft="10px" color="#ffa800" borderColor={"#ffa800"}>ARCHIVE<ExternalLinkIcon mx='2px' /></Button>
                        {/* <Box border={"2px solid #FFA800"} padding="5px 20px" borderRadius={"5px"}>
                            <Text>UPTIME</Text>
                            <Moment format="hh:mm:ss">
                                {uptime}
                            </Moment>
                        </Box> */}
                        {/* <Box paddingX={"40px"}>
                            <Switch size='lg' isChecked={isOn} onChange={handleSwitch}/>
                        </Box> */}
                    </Flex>
                ):(<></>)
                }
                {
                    location.pathname === "/archive" ?(<Text color={"white"}>WEB ARCHIVE</Text>):(<></>)
                }
                {
                    location.pathname === "/activity" ?(
                    <Flex alignItems="center">
                        <Text color={"white"}>ACTIVITY</Text>
                    </Flex>
                    ):(<></>)
                }
                {
                    location.pathname === "/graph" ?(<Text color={"white"}>GRAPH</Text>):(<></>)
                }
            </Box>
        </Flex>
        </>
    )
}

export default Header;