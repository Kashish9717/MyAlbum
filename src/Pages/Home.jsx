/*
Landing page of the website
Shows welcome message
*/


import { motion } from "framer-motion";
import AnimatedBackground from "../Component/AnimatedBackground";
import bg_home from "../assets/Photos/bg_home.jpeg";
import Photos from "./Photos";
// import PhotoCircle from "../Component/PhotoCircle";


function Home() {

  return (

    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_home})` }}
    >

      <AnimatedBackground />

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl font-bold text-white drop-shadow-lg"
      >
        ✨ My Cute Memories ✨
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="mt-4 text-xl text-white"
      >
        Welcome to my personal memory world
      </motion.p>


    </motion.div>

  

  );
}

export default Home;