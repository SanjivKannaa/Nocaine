import React from 'react'
import { GraphCanvas, darkTheme } from 'reagraph';
import {Box,useToast} from '@chakra-ui/react'
import copy from 'copy-to-clipboard'
function Graph({nodes, edges}) {
  // Improve the theme
  // https://reagraph.dev/?path=/docs/docs-getting-started-theme--docs
  // Listen double click event
  const myTheme = {
    ...darkTheme,
    node: {
      ...darkTheme.node,
      // fill: '#5F21A1',
      // activeFill: '#351558',
      // label: {
      //   ...darkTheme.node.label,
      //   color: '#fff',
      //   activeColor: '#ABABAB',
      // }
    },
    canvas: {
      ...darkTheme.canvas,
      background: '#121212',
    },
    // arrow: {
    //   fill: '#242424',
    //   activeFill: '#242424'
    // },
    // edge: {
    //   fill: "#242424",
    //   activeFill: "#FFA800",
    // }
  };
  // const nodes = [
  //   {
  //     id: 'n-1',
  //     label: 'loreumipsum1234.onion'
  //   },
  //   {
  //     id: 'n-2',
  //     label: 'loreu1mipsu3m1234.onion'
  //   },
  //   {
  //     id: 'n-3',
  //     label: 'loreu1mipsu3m1234.onion'
  //   },
  //   {
  //     id: 'n-4',
  //     label: 'loreu1mipsu3m1234.onion'
  //   },{
  //     id: 'n-5',
  //     label: 'loreu1mipsu3m1234.onion'
  //   }
  // ]
  // const edges = [
  //   {
  //     id: '1->2',
  //     source: 'n-1',
  //     target: 'n-2',
  //     label: 'Edge 1-2'
  //   },{
  //     id: '1->3',
  //     source: 'n-1',
  //     target: 'n-3',
  //     label: 'Edge 1-3'
  //   },{
  //     id: '1->4',
  //     source: 'n-1',
  //     target: 'n-4',
  //     label: 'Edge 1-4'
  //   },{
  //     id: '4->5',
  //     source: 'n-4',
  //     target: 'n-5',
  //     label: 'Edge 4-5'
  //   },
  // ]
  const toast = useToast()
  const handleDoubleClick = (e) =>{
    copy(e.label)
    toast({
      title: 'URL copied successfully',
      status: 'success',
      duration: 9000,
      isClosable: true,
    })
  }
  return (
    <Box width={"75%"}
    height={"75%"} position={"fixed"} margin={"0"} border={'2px solid #FFA800'} borderRadius={"5px"}>

        <GraphCanvas
        
        theme={myTheme}
        nodes={nodes}
        edges={edges}
        cameraMode={"rotate"}
        defaultNodeSize={1}
        onNodeDoubleClick={handleDoubleClick}
      />
    </Box>
  )
}

export default Graph