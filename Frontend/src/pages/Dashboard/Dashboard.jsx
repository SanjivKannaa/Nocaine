import React from 'react'
import Graph from '../../Components/Graph'
import {Box,Flex, Heading} from '@chakra-ui/react'
import Overview from '../../Components/Overview';
import Queue from '../../Components/Queue';
import Activity from '../../Components/Activity';
import Crime from '../../Components/Crime';
import Uptime from '../../Components/Uptime';

function Dashboard() {
  return (
    <>
      <Flex flexWrap={"wrap"} justifyContent={"space-around"} marginBottom={"50px"}>
        <Overview/>
        {/* <Queue/> */}
        <Uptime/>
      </Flex>
      <Flex flexWrap={"wrap"} justifyContent={"space-around"}>
        <Activity/>
        <Crime/>
      </Flex>
    </>
  )
}

export default Dashboard