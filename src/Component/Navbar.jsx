import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 
    bg-blue-300
    shadow-lg backdrop-blur-md  ">

      <h2 className="text-2xl font-bold text-purple-700 tracking-wide">
        ✨ Memory Album
      </h2>

      <div className="flex mr-20 text-lg font-medium gap-20">

        <Link 
        to="/" 
        className="text-purple-700 hover:text-pink-600 hover:scale-110 transition duration-300">
          Home
        </Link>

        <Link 
        to="/photos" 
        className="text-purple-700 hover:text-pink-600 hover:scale-110 transition duration-300">
          Photos
        </Link>

        <Link 
        to="/videos" 
        className="text-purple-700 hover:text-pink-600 hover:scale-110 transition duration-300">
          Videos
        </Link>

        <Link 
        to="/trips" 
        className="text-purple-700 hover:text-pink-600 hover:scale-110 transition duration-300">
          Trips
        </Link>

        <Link 
        to="/traditional" 
        className="text-purple-700 hover:text-pink-600 hover:scale-110 transition duration-300">
          Traditional
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;