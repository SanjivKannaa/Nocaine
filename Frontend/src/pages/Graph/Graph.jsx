import React from 'react'
import Graph from '../../Components/Graph'
import {Box,Flex,Heading,Tooltip,Icon} from '@chakra-ui/react'
import { useState,useEffect } from 'react'
import {getGraphData} from '../../API/DarkwebData/services'
import {InfoOutlineIcon} from '@chakra-ui/icons'

function CrawlerGraph() {
  const [nodes,setNodes] = useState([])
  const [edges,setEdges] = useState([])
  useEffect(() => {
    getGraphData().then((res) => {
      console.log(res)
      setNodes(res.nodes)
      setEdges(res.edges)
    }).catch(err=>{
      console.log(err)
    })
  }, [])
  
  return (
    <Box>
        <Heading color={"#DADADA"} fontFamily={'Advent Pro'} marginLeft={"80px"} marginBottom={"20px"}>My Dark Web Journey <Tooltip label="A visualization of the graph traversal across various anonymity networks. It helps us obtain correlation between nodes. Hint: Double click the node to copy its URL" placement="right"><Icon as={InfoOutlineIcon} boxSize={4}></Icon></Tooltip></Heading>
        <Flex width={"100%"} marginTop={"50px"} position={"relative"} justifyContent={"center"}>
            <Graph nodes={nodes} edges={edges}/>
        </Flex>
    </Box>
  )
}

export default CrawlerGraph