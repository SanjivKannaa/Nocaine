import { SearchIcon } from '@chakra-ui/icons'
import { Box, Button, Icon, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import React from 'react'

function Archive() {
  const handleClick = () => {
    console.log('click')
  }
  return (
    <Box padding={"20px 40px"}>
      <InputGroup size='md' marginBottom={"10px"} marginRight={"20px"} width={"40vw"} minWidth={"200px"} maxWidth={"500px"}>
              <Input
                  pr='4.5rem'
                  type={'text'}
                  placeholder='Search keyword'
                  border={'2px solid #FFA800'}
              />
              <InputRightElement width='2rem' padding='5px'>
                  <Button mr={'10px'} h='1.75rem' size='sm' onClick={handleClick} background={'#FFA800'}>
                  <Icon as={SearchIcon} />
                  </Button>
              </InputRightElement>
            </InputGroup>
    </Box>
  )
}

export default Archive