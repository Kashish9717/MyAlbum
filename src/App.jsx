/*
App.jsx handles routing between pages
Home
Photos
Videos
Trips
Traditional
*/

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Component/Navbar";


import Home from "./Pages/Home";
import Photos from "./Pages/Photos";
import Videos from "./Pages/Videos";
import Trips from "./Pages/Trips";



function App() {
  return (
    <BrowserRouter>

      {/* Navbar visible on every page */}
      <Navbar />

      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Photos Page */}
        <Route path="/photos" element={<Photos />} />

        {/* Videos Page */}
        <Route path="/videos" element={<Videos />} />

        {/* Trips Page */}
        <Route path="/trips" element={<Trips />} />

       
      </Routes>
      <Photos/>
      <Videos/>

    </BrowserRouter>
  );
}

export default App;