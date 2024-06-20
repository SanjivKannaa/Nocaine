import { Box, Button, Flex, Heading, Icon, Input, InputGroup, InputRightElement, Text,useToast } from '@chakra-ui/react'
import React,{useState} from 'react'
import {AddIcon} from '@chakra-ui/icons'
import { addUrlToQueue } from '../../API/Crawler/queue'

function Queue() {
  const [url,setUrl] = useState('')
  // const [displaytoast, setDisplaytoast] = useState(false);
  // const [message,setMessage] = useState("")
  // const [type,setType] = useState("")
  const toast = useToast()
  const handleClick = async()=>{
    try{
      await addUrlToQueue(url)
      toast({
        title: 'The Seed URL has been added successfully',
        description: "The URL will be consumed by the crawler once the queue frees up",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
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
  const queue = ['loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion','loremipsum1234.onion']
  return (
    <>
    <Flex width={"40vw"} minWidth={'300px'} margin={"20px 40px"} justifyContent={"center"} alignItems={"center"}position={"relative"}>
          <Heading color={"#DADADA"} marginBottom={"20px"} fontFamily={'Advent Pro'} style={{transform: "rotate(-90deg)"}}>URL Queue</Heading>
          <Box position={"relative"} marginX={"5px"}>
            <InputGroup size='md' marginBottom={"10px"}>
              <Input
                  pr='4.5rem'
                  type={'text'}
                  placeholder='Add URL'
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
            {/* Custom scroll bar https://www.w3schools.com/howto/howto_css_custom_scrollbar.asp */}
            <Box background={"rgb(36,36,36,0.7)"} color={"#DADADA"} padding={"5px 20px"} maxHeight={"300px"} overflowY={"scroll"} width={"30vw"} minWidth={"400px"} position={"relative"} >
              {queue.map(url=>(
                <Box borderBottom={"2px solid rgb(218,218,218,0.2)"} textAlign={"center"} padding="10px">
                  <Text>{url}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Flex>
        {/* {displaytoast && <Toast message={message} type={type} display={setDisplaytoast}/>} */}
        </>
  )
}

export default Queue