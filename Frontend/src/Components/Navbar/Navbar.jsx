import "./Navbar.module.css"
import { Outlet, useLocation } from "react-router-dom";
import {Box, Flex} from "@chakra-ui/react"
import { useEffect } from "react";

const Navbar = ()=>{
    const location = useLocation();

    useEffect(() => {
        console.log(`The current route is ${location.pathname}`);
    }, [location]);
    return (
        <>
        <Flex
        color={"white"}
        flexDirection="column"
        width="100px"
        // position="absolute"
        padding="10px 2px 10px 2px"
        backgroundColor={"#FFA800"}
        height="100vh"
        justify="flex-start"
        alignItems="center"
        zIndex="2"
        boxShadow={"4px 4px 4px rgba(0, 0, 0, 0.25)"}
        position={"sticky"}
        top={0}
        >
            <Flex
            flexDirection="column"
            alignItems="center"
            >
                <Box as={'a'} href="/" height={"50px"} width={"50px"} margin={"5px"} marginBottom={"30px"} backgroundImage={'assets/Home.png'} backgroundSize={'cover'} borderBottom={location.pathname=='/'?'3px solid black':''}></Box>
                {/* <Box as={'a'} href="/archive" height={"50px"} width={"50px"} margin={"5px"} marginBottom={"30px"} backgroundImage={'assets/Time.png'} backgroundSize={'cover'} borderBottom={location.pathname=='/archive'?'3px solid black':''}></Box> */}
                <Box as={'a'} href="/activity"height={"50px"} width={"50px"} margin={"5px"} marginBottom={"30px"} backgroundImage={'assets/Detective.png'} backgroundSize={'cover'} borderBottom={location.pathname=='/activity'?'3px solid black':''}></Box>
                <Box as={'a'} href="/graph"height={"50px"} width={"50px"} margin={"5px"} backgroundImage={'assets/Network.png'} backgroundSize={'cover'} borderBottom={location.pathname=='/graph'?'3px solid black':''}></Box>
            </Flex>
        </Flex>
        {/* <Outlet/> */}
        </>
    )
}

export default Navbar;