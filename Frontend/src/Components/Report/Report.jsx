import { AddIcon, Icon, MinusIcon } from '@chakra-ui/icons'
import { AccordionButton, AccordionItem, AccordionPanel, Badge, Box, CircularProgress, CircularProgressLabel, Flex, Heading, Link, Text,useDisclosure,Tag, Tooltip } from '@chakra-ui/react'
import React, { useState } from 'react'
import { FaFlag } from "react-icons/fa";
import {InfoOutlineIcon} from '@chakra-ui/icons'
import Moment from "react-moment";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,Button
} from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

function Report({ data, title, url, active, isSus, archiveLink, lastVisited, CumScore, susScores, children, refCount, onionscan, metaTags,network,types,paths }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <AccordionItem borderRadius={"5px"} border={"none"} marginY={"20px"}>
      <Heading borderRadius={"5px"} fontFamily={"Advent Pro"} fontSize={"larger"} background={"white"} padding={"10px 20px"}>
        <Flex alignItems={"center"}>
          {typeof CumScore !== 'undefined' && <Icon as={FaFlag} color={isSus ? "red" : "green"}></Icon>}
          <Badge marginX={"20px"} colorScheme={active ? "red" : "green"}>{active ? "active" : "inactive"}</Badge>
          <Text noOfLines={1}>{title}</Text>
        </Flex>
        <Flex justifyContent={"space-between"} alignItems={"center"}>

          <Text wordBreak={"break-word"}>{url}</Text>
          <Flex alignItems={"center"}>
            <Tooltip label="Snapshot link">
              <Link href={archiveLink} isExternal><Box height={"20px"} width={"20px"} backgroundImage={'assets/Archive.png'} backgroundSize={'cover'}></Box></Link>
            </Tooltip>
            {/* <Box as={'a'} href={archiveLink} height={"20px"} width={"30px"} backgroundImage={'assets/Archive.png'} backgroundSize={'cover'}></Box> */}
            <AccordionButton onClick={() => setIsExpanded(x => !x)}>
              {isExpanded ? (
                <Box height={"20px"} width={"20px"} backgroundImage={'assets/Globe-open.png'} backgroundSize={'cover'}></Box>
              ) : (
                <Tooltip label="View report">
                  <Box height={"20px"} width={"20px"} backgroundImage={'assets/Globe.png'} backgroundSize={'cover'}></Box>
                </Tooltip>
              )}
            </AccordionButton>
          </Flex>
        </Flex>
      </Heading>
      <AccordionPanel borderRadius={"5px"} pb={4} bg={"rgb(104,104,104,0.2)"} color={"white"} padding={"20px 40px"}>
        <Flex justifyContent={"space-between"}>
          <Box textAlign={"center"}>
            <Text color={"tomato"}>Suspicion Score</Text>
            <Badge colorScheme='red'>{Math.round(CumScore * 100) / 100}</Badge>
          </Box>
          <Box>
            <Text>LAST VISITED: <Moment>{lastVisited}</Moment></Text>
            <Text>POPULARITY METRIC: {refCount}  <Tooltip label="Number of services pointing to it" placement="right"><Icon as={InfoOutlineIcon} boxSize={4}></Icon></Tooltip></Text>
          </Box>
        </Flex>
        <Heading fontFamily={"Advent Pro"} fontSize={"medium"} color={"white"} marginY={"20px"}>Crime Scores</Heading>
        <Flex justifyContent={"space-around"} flexWrap={"wrap"}>
          {typeof susScores !== 'undefined' &&
            Object.keys(susScores).map(key => (
              <Box textAlign={"center"}>
                <CircularProgress value={susScores[key]} color='red.400'>
                  <CircularProgressLabel>{Math.round(susScores[key] * 100) / 100}</CircularProgressLabel>
                </CircularProgress>
                <Text>{key}</Text>
              </Box>
            ))
          }
        </Flex>
        <Flex justifyContent="space-between">
          <Button onClick={onOpen} marginTop={"20px"} bg="#FFA800">Investigation Report</Button>
          <Tooltip label="Network type">
            <Tag size={"lg"} marginTop={"20px"} variant={"solid"} colorScheme={network=="Tor"?"purple":network=="I2P"?"blue":"red"}>{network}</Tag>
          </Tooltip>
        </Flex>
        <Box>
          {typeof types==="undefined" || types.length==0?"":
          <Box>
            <Heading fontFamily={"Advent Pro"} fontSize={"medium"} color={"white"} marginY={"20px"}>Other Crimes in the Subpaths</Heading>
            <Flex justifyContent={"space-around"} flexWrap={"wrap"}>
              {types.map(type=>(
                <Tag size={"lg"} key={type[0]} variant='solid' colorScheme='red'>
                {typeof type=="string"?type:type[0]}
              </Tag>))
              }
            </Flex>
          </Box>
          }
        </Box>
        <Modal onClose={onClose} size={'xl'} isOpen={isOpen} scrollBehavior={"inside"}>
          <ModalOverlay/>
          <ModalContent backgroundColor="#121212" color="white">
            <ModalHeader><Heading fontFamily={"Advent Pro"}>Investigation</Heading></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <Tabs variant='enclosed'>
              <TabList>
                <Tab>Meta Data</Tab>
                <Tab>HTML</Tab>
                {/* <Tab>Paths</Tab> */}
              </TabList>
              <TabPanels>
                <TabPanel>
                {typeof metaTags !== "undefined" && metaTags!=null ? (
                <>
                  <Heading fontFamily={"Advent Pro"} size="lg">Meta Tags</Heading>
                  <TableContainer fontFamily={"Advent Pro"}>
                    <Table variant='simple' size='sm'>
                      <TableCaption>Meta Tags</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Key</Th>
                          <Th>Value</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {
                          typeof metaTags !="undefined"?
                          (Object.keys(metaTags).map(key => (
                            <Tr>
                              <Td>{key}</Td>
                              <Td>{metaTags[key]}</Td>
                            </Tr>
                          ))):""
                        }
                      </Tbody>
                    </Table>
                  </TableContainer>
                </>) : ""}
                {/* If onion service */}
                {
                  typeof onionscan !== "undefined" ? (
                    <Box fontFamily={"Advent Pro"} marginTop="20px" borderRadius="5px" padding="10px"color="#5F21A1" backgroundColor="#fff">
                      <Heading fontFamily={"Advent Pro"} size="lg">Onionscan report</Heading>
                      <Box marginBottom="10px">
                        <Text fontWeight="bold">Hidden Service</Text>
                        <Text>{onionscan.hiddenService}</Text>
                      </Box>
                      <Box marginBottom="10px">
                        <Text fontWeight="bold">Date Scanned</Text>
                        <Text>{onionscan.dateScanned}</Text>
                      </Box>
                      <Box marginBottom="10px">
                        <Text fontWeight="bold">Performed Scans</Text>
                        <Flex flexWrap="wrap">
                          {
                            onionscan.performedScans.map(scan => (
                              <Badge marginRight="10px" marginBottom="5px" colorScheme={onionscan[`${scan}Detected`]?'green':'red'}>{scan}</Badge>
                            ))
                          }
                        </Flex>
                      </Box>
                      <Box marginBottom="10px">
                        <Text>PGP Keys</Text>
                        {onionscan.pgpKeys === null ? ("Not found"):onionscan.pgpKeys.map(key=>(
                          <Text>{key}</Text>
                        ))}
                      </Box>
                      <Box marginBottom="10px">
                        <Text fontWeight="bold">Certificates</Text>
                        {onionscan.certificates === null ? ("Not found"):onionscan.certificates.map(certificate=>(
                          <Text>{certificate}</Text>
                        ))}
                      </Box>
                      <Box marginBottom="10px">
                        <Heading fontFamily={"Advent Pro"}  size="md">Cryptocurrency Services</Heading>
                        {
                          Object.keys(onionscan.bitcoinServices).map(service=>(
                            (onionscan.bitcoinServices[service].detected) ? (
                              <>
                                <Text fontWeight="semibold">{service}</Text>
                                <Text>User agent: {onionscan.bitcoinServices[service].userAgent}</Text>
                                <Text>Protocol version: {onionscan.bitcoinServices[service].prototocolVersion}</Text>
                                <Text>Onion peers: </Text>
                                {onionscan.bitcoinServices[service].onionPeers?.map(peer=>(
                                  <Text>{peer}</Text>
                                ))}
                              </>
                              ):"")
                          )
                        }
                      </Box>
                      <Box marginBottom="10px">
                      <Heading fontFamily={"Advent Pro"} size="md">SSH Services</Heading>
                        <Box>
                          <Text>SSH Key: {onionscan.sshKey==""?"Not found":onionscan.sshKey}</Text>
                        </Box>
                        <Box>
                          <Text>SSH Banner: {onionscan.sshBanner==""?"Not found":onionscan.sshBanner}</Text>
                        </Box>
                      </Box>
                      <Box marginBottom="10px">
                      <Heading fontFamily={"Advent Pro"} size="md">FTP Services</Heading>
                        <Box>
                          <Text>FTP Fingerprint: {onionscan.ftpFingerprint==""?"Not found":onionscan.ftpFingerprint}</Text>
                        </Box>
                        <Box>
                          <Text>FTP Banner: {onionscan.ftpBanner==""?"Not found":onionscan.ftpBanner}</Text>
                        </Box>
                      </Box>
                      <Box marginBottom="10px">
                      <Heading fontFamily={"Advent Pro"} size="md">SMTP Services</Heading>
                        <Box>
                          <Text>SMTP Fingerprint: {onionscan.smtpFingerprint==""?"Not found":onionscan.smtpFingerprint}</Text>
                        </Box>
                        <Box>
                          <Text>SMTP Banner: {onionscan.smtpBanner==""?"Not found":onionscan.smtpBanner}</Text>
                        </Box>
                      </Box>
                      <Box marginBottom="10px">
                      <Heading fontFamily={"Advent Pro"} size="md">Identifier Report</Heading>
                        <Flex flexWrap="wrap">
                          <Badge marginRight="10px" colorScheme={onionscan.identifierReport['privateKeyDetected']?'green':'red'}>Private Key Detected</Badge>
                          <Badge marginRight="10px" colorScheme={onionscan.identifierReport['foundApacheModStatus']?'green':'red'}>Found Apache Mod Status</Badge>
                        </Flex>
                        <Box>
                          <Text>Server version: {onionscan.identifierReport["serverVersion"]}</Text>
                          <Text>Related onion services: </Text>
                          {onionscan.identifierReport["relatedOnionServices"]?.map(service=>(
                            <Text>{service}</Text>
                          ))}
                          <Text>Related onion domains: </Text>
                          {onionscan.identifierReport["relatedOnionDomains"]?.map(domain=>(
                            <Text>{domain}</Text>
                          ))}
                          <Text>IP Addresses: </Text>
                          {onionscan.identifierReport["ipAddresses"]?.map(ip=>(
                            <Text>{ip}</Text>
                          ))}
                          <Text>Email Addresses: </Text>
                          {onionscan.identifierReport["emailAddresses"]?.map(email=>(
                            <Text>{email}</Text>
                          ))}
                          <Text>Analytics IDs: </Text>
                          {onionscan.identifierReport["analyticsIDs"]?.map(id=>(
                            <Text>{id}</Text>
                          ))}
                          <Text>Bitcoin Addresses: </Text>
                          {onionscan.identifierReport["bitcoinAddresses"]?.map(address=>(
                            <Text>{address}</Text>
                          ))}
                          <Text>Linked Onions: </Text>
                          {onionscan.identifierReport["linkedOnions"]?.map(onion=>(
                            <Text>{onion}</Text>
                          ))}
                          <Text>Open Directories: </Text>
                          {onionscan.identifierReport["openDirectories"]?.map(directory=>(
                            <Text>{directory}</Text>
                          ))}
                          <Text>EXIF Images: </Text>
                          {onionscan.identifierReport["exifImages"]?.map(image=>(
                            <Text>{image}</Text>
                          ))}
                        </Box>
                      </Box>

                      {/* {JSON.stringify(onionscan)} */}
                    </Box>
                  ) : ""
                }
                </TabPanel>
                <TabPanel>
                  <p>{data}</p>
                </TabPanel>
                {/* <TabPanel>
                  {paths?.map(path=>(
                    <p>{path}</p>
                  ))}
                </TabPanel> */}
              </TabPanels>
            </Tabs>
              
                
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose} fontFamily={"Advent Pro"}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* <Heading fontFamily={"Advent Pro"} fontSize={"medium"} color={"white"} marginY={"20px"}>Children</Heading> */}

      </AccordionPanel>
    </AccordionItem>
  )
}

export default Report