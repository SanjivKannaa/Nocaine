import './App.css';
import '@fontsource/advent-pro/800.css'
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
// import Url from './pages/Url';
// import Output from './pages/Output';
import Navbar from './Components/Navbar';
import Dashboard from './pages/Dashboard';
import Archive from './pages/Webarchive';
import Activity from './pages/Activity';
import Header from './Components/Header';
import {Box} from '@chakra-ui/react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title,BarElement,Filler } from "chart.js";
import CrawlerGraph from './pages/Graph';

ChartJS.register(ArcElement, CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  BarElement,Legend,Filler);

function App() {
  return (
    <div className="App">
          <BrowserRouter>
        <Navbar/>
          <Box position="relative" width="100%">
            <Header/>
            <Routes>
              <Route path="/" element={<Dashboard/>} />
              <Route path="/graph" element={<CrawlerGraph/>} />
              {/* <Route path="/archive" element={<Archive/>} /> */}
              <Route path="/activity" element={<Activity/>} />
              {/* <Route path="/dashboard" element={<Navbar/>}>
                <Route path="url" element={<Url />} />
                <Route path="output" element={<Output />} />
              </Route> */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Box>
          </BrowserRouter>
    </div>
  );
}

export default App;
