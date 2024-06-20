import React,{useState,useEffect} from 'react'
import {Box,Flex,Text,Heading,List,ListIcon,ListItem,Icon, Stat,StatLabel,StatNumber,StatHelpText,Tooltip} from '@chakra-ui/react'
import { Doughnut } from "react-chartjs-2";
import {getServicesCount} from '../../API/DarkwebData/services'
import {InfoOutlineIcon} from '@chakra-ui/icons'
const CircleIcon = (props) => (
    <Icon viewBox='0 0 200 200' {...props}>
      <path
        fill='currentColor'
        d='M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
      />
    </Icon>
)
function Overview() {
    const [normal,setNormal] = useState(0)
    const [suspicious,setSuspicious] = useState(0)
    const [timedout,setTimedout] = useState(0)
    const [data,setData] = useState({
      labels: ['Suspicious', 'Normal', 'Timed out'],
      datasets: [],
    })
    useEffect(() => {
      getServicesCount().then((res) => {
        setNormal(res.normal)
        setSuspicious(res.suspicious)
        setTimedout(res.timedOut)
        const data = {
          labels: ['Suspicious', 'Normal', 'Timed out'],
          datasets: [
            {
              label: '# of Darkweb Services',
              data: [res.suspicious, res.normal, res.timedOut],
              backgroundColor: [
                  '#E53E3E',
                  'rgb(80, 255, 64)',
                  'rgb(253, 201, 57)'
              ],
              borderColor: [
                  'rgb(255, 0, 0)',
                  'rgb(21, 255, 0)',
                  'rgb(255, 188, 3)'
              ],
              borderWidth: 1,
            },
          ],
        };
        setData(data)
      })
    }, [])
    
  return (
        <Box margin={"20px 40px"} borderRadius={"5px"} width={"40vw"} height={"400px"} minWidth={"700px"}>
          <Heading  color={"#DADADA"} marginBottom={"20px"} fontFamily={'Advent Pro'}>Overview <Tooltip label="Number of darkweb services being monitored" placement="right"><Icon as={InfoOutlineIcon} boxSize={4}></Icon>
            </Tooltip></Heading>
          <Flex padding={"30px 20px"} height={"300px"} background={"rgb(36,36,36,0.7)"} justifyContent={"space-around"} alignItems={"center"}>
          {/* https://stackoverflow.com/questions/53872165/cant-resize-react-chartjs-2-doughnut-chart */}
            <Doughnut data={data} options = {{responsive:true,maintainAspectRatio:true,}} />
            <Box color={"white"}>
            <List spacing={3}>
              <ListItem display={"flex"}>
                <ListIcon as={CircleIcon} color='red.500' />
                <Stat>
                  <StatLabel>Suspicious</StatLabel>
                  <StatNumber>{suspicious}</StatNumber>
                </Stat>
              </ListItem>
              <ListItem display={"flex"}>
                <ListIcon as={CircleIcon} color='rgb(80, 255, 64)' />
                <Stat>
                  <StatLabel>Normal</StatLabel>
                  <StatNumber>{normal}</StatNumber>
                </Stat>
              </ListItem>
              <ListItem display={"flex"}>
                <ListIcon as={CircleIcon} color='rgb(255, 188, 3)' />
                <Stat>
                  <StatLabel>Timed Out</StatLabel>
                  <StatNumber>{timedout}</StatNumber>
                </Stat>
              </ListItem>
            </List>
              
            </Box>
          </Flex>
        </Box>
  )
}

export default Overview