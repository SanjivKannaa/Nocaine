import { Heading,Flex, Box,Select,Icon,Tooltip} from '@chakra-ui/react'
import React,{useState,useEffect} from 'react'
import { Line } from 'react-chartjs-2';
import { getServiceDailyCount } from '../../API/DarkwebData/services';
import {InfoOutlineIcon} from '@chakra-ui/icons'
function Activity() {
    const [type,setType] = useState('week')
    const [data,setData] = useState({labels: [],datasets: []})
    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          // title: {
          //   display: true,
          //   text: 'Chart.js Line Chart',
          // },
        },
      };
    useEffect(()=>{
      getServiceDailyCount({type}).then(res=>{
        setData({
          labels: res.stats.map(i=>i.date),
          datasets: [
            {
              label: 'Illegal Services',
              // fill: true,
              data: res.stats.map(i=>i.illegal),
              borderColor: '#E53E3E',
              backgroundColor: '#E53E3E',
            },
            {
              label: 'Normal Services',
              // fill: true,
              data: res.stats.map(i=>i.legal),
              borderColor: '#66ff33',
              backgroundColor: '#66ff33',
            },
          ],
        })
      })
    },[type])
    // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    // const data = {
    //     labels,
    //     datasets: [
    //       {
    //         label: 'Illegal Services',
    //         // fill: true,
    //         data: [400,200,500,300,400,50,600],
    //         borderColor: '#E53E3E',
    //         backgroundColor: '#E53E3E',
    //       },
    //       {
    //         label: 'Normal Services',
    //         // fill: true,
    //         data: [100,50,600,700,200,150,500],
    //         borderColor: '#66ff33',
    //         backgroundColor: '#66ff33',
    //       },
    //     ],
    //   };
    
  return (
    <Box margin={"20px 40px"} position={"relative"} width={"40vw"} minWidth={'600px'}>
        <Flex position={"relative"} width={"100%"}justifyContent={"space-between"}>
            <Heading color={"#DADADA"} fontFamily={'Advent Pro'} marginBottom={"20px"}>Activity  <Tooltip label="Number of legal and illegal services over a period" placement="right"><Icon as={InfoOutlineIcon} boxSize={4}></Icon>
            </Tooltip></Heading>
            <Select placeholder='Select option' bg={"#FFA800"} border={"none"} color={"black"} width={"150px"} value={type} onChange={e=>setType(e.target.value)}>
                <option value='week'>Last 7 Days</option>
                <option value='month'>Last 1 Month</option>
                <option value='year'>Last 1 Year</option>
                <option value='max'>Max</option>
            </Select>
        </Flex>
        <Box background={"rgb(36,36,36,0.7)"}>
            <Line data={data} options={options} />
        </Box>
    </Box>
  )
}

export default Activity