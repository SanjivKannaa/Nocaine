import { Box, Heading, Select,Icon,Tooltip } from '@chakra-ui/react';
import React,{useEffect,useState} from 'react'
import { Bar } from 'react-chartjs-2';
import { getCrimeCount } from '../../API/DarkwebData/services';
import {InfoOutlineIcon} from '@chakra-ui/icons'
function Crime() {
    const options = {
        responsive: true,
        plugins: {
          // legend: {
          //   position: 'top',
          // },
          // title: {
          //   display: true,
          //   text: 'Chart.js Bar Chart',
          // },
        },
      };
      const [data,setData] = useState({labels:[],datasets:[]})
      // const labels = ['Drugs', 'Pornography', 'Armory', 'Hacking', 'Counterfeit', 'Other'];
      // const data = {
      //   labels,
      //   datasets: [
      //     {
      //       label: 'Crime Classes',
      //       data: [12, 19, 3, 5, 2, 3],
      //       backgroundColor: '#E53E3E',
      //     },
      //   ],
      // };

      const crimeColors = ["#FFD700",'#FF0000',"#8F00FF","#1F51FF","00000","#34495e","#f39c12","#d35400","#2c3e50","#1abc9c"]
      useEffect(() => {
        getCrimeCount().then((res)=>{
          const labels = Object.keys(res.crimeCount)
          const values = Object.values(res.crimeCount)
          setData({
            labels,
            datasets: [
                {
                  label: 'No of services',
                  data: values,
                  backgroundColor: crimeColors,
                },
              ],
            })
          })
      
        return () => {
          
        }
      }, [])
      
  return (
    <Box margin={"20px 40px"} width={"40vw"} minW={"600px"}>
        <Heading marginBottom={"20px"} color={"#DADADA"} fontFamily={'Advent Pro'}>Crime Report <Tooltip label="Darkweb services are classified into 9 crime classes based on its text and image conten" placement="right"><Icon as={InfoOutlineIcon} boxSize={4}></Icon>
            </Tooltip></Heading>
        <Box background={"rgb(36,36,36,0.7)"}>
            <Bar options={options} data={data}/>
        </Box>

    </Box>
  )
}

export default Crime