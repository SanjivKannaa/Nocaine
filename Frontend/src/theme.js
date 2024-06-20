import { switchAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(switchAnatomy.keys)

const baseStyle = definePartsStyle({
  // define the part you're going to style
  container: {
    // ...
  },
  thumb: {
    // bg: 'red.500',
    // border: '2px solid',
    bg: 'red.500',
    // borderColor: 'red.500',
    _checked: {
        bg: '#33FF00',
    },
  },
  track: {
    border: '2px solid',
    bg: 'transparent',
    borderColor: 'red.500',
    // bg: 'gray.100',
    _checked: {
        bg: 'transparent',
        borderColor: '#33FF00',
    },
  },
})
const switchTheme = defineMultiStyleConfig({ baseStyle })
// import { switchTheme } from './components/switch'

export const theme = extendTheme({
  components: { Switch: switchTheme },
})