/*
Photos.jsx
Pinterest Style Scrapbook Gallery

Features:
- Animated cards using Framer Motion
- Cute scrapbook style UI
- Memory title + description inputs
- Save memory permanently using localStorage
- Hover animations
- Pinterest masonry layout (card size based on photo)
*/

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ---- IMPORT PHOTOS ---- */
import p1 from "../assets/Photos/p1.jpeg";
import p2 from "../assets/Photos/p2.jpeg";
import p3 from "../assets/Photos/p3.jpeg";
import p4 from "../assets/Photos/p4.jpeg";
import p5 from "../assets/Photos/p5.jpeg";
import p6 from "../assets/Photos/p6.jpeg";
import p7 from "../assets/Photos/p7.jpeg";
import p8 from "../assets/Photos/p8.jpeg";
import p9 from "../assets/Photos/p9.jpeg";
import p10 from "../assets/Photos/p10.jpeg";
import p11 from "../assets/Photos/p11.jpeg";
import p12 from "../assets/Photos/p12.jpeg";

function Photos() {

  /* ---------------- PHOTO ARRAY ---------------- */

  const photos = [
    { id:1, img:p1 },
    { id:2, img:p2 },
    { id:3, img:p3 },
    { id:4, img:p4 },
    { id:5, img:p5 },
    { id:6, img:p6 },
    { id:7, img:p7 },
    { id:8, img:p8 },
    { id:9, img:p9 },
    { id:10, img:p10 },
    { id:11, img:p11 },
    { id:12, img:p12 }
  ];

  /*
  memories state structure

  {
    1:{title:"Trip",desc:"Best memory"},
    2:{title:"Beach",desc:"Fun time"}
  }
  */

  const [memories,setMemories] = useState({});



  /* ---------------- LOAD SAVED MEMORIES ---------------- */

  useEffect(()=>{

    const savedMemories = localStorage.getItem("scrapbookMemories");

    if(savedMemories){
      setMemories(JSON.parse(savedMemories));
    }

  },[]);



  /* ---------------- HANDLE INPUT CHANGE ---------------- */

  const handleChange = (id, field, value)=>{

    setMemories((prev)=>({

      ...prev,

      [id]:{
        ...prev[id],
        [field]:value
      }

    }));

  };



  /* ---------------- SAVE MEMORIES ---------------- */

  const saveMemories = ()=>{

    localStorage.setItem(
      "scrapbookMemories",
      JSON.stringify(memories)
    );

    alert("🎀 Memory saved in scrapbook!");

  };



  return(

    <div className="min-h-screen bg-pink-50 p-10 ">

      {/* PAGE HEADING */}

      <motion.h1
      initial={{opacity:0,y:-40}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.8}}
      className="text-center text-4xl font-bold text-pink-500 mb-10"
      >
        🎀 My Photos Memories 🍭
      </motion.h1>



      {/* PINTEREST STYLE GRID */}

      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 max-w-6xl mx-auto">

        {photos.map((photo)=>(

          <motion.div
          key={photo.id}

          initial={{opacity:0,scale:0.9}}
          animate={{opacity:1,scale:1}}
          whileHover={{scale:1.05, rotate:1}}
          transition={{duration:0.3}}

          className="
          break-inside-avoid
          mb-6
          relative
          bg-black text-white
          rounded-2xl
          p-3
          shadow-lg
          border
          border-pink-200
          "
          >

            {/* Cute Sticker */}

            <span className="absolute -top-3 -right-3 text-2xl">
              🎀
            </span>



            {/* PHOTO */}

            <img
            src={photo.img}
            alt="memory"
            className="rounded-xl mb-3 shadow-md w-full object-contain"
            />



            {/* MEMORY TITLE */}

            <input
            type="text"
            placeholder="Memory title 🌸"
            value={memories[photo.id]?.title || ""}
            onChange={(e)=>handleChange(photo.id,"title",e.target.value)}
            className="
            w-full
            p-2
            mb-2
            border
            border-pink-200
            rounded-lg
            text-sm
            focus:outline-pink-300
            "
            />



            {/* MEMORY DESCRIPTION */}

            <textarea
            placeholder="Write about this memory 💭"
            value={memories[photo.id]?.desc || ""}
            onChange={(e)=>handleChange(photo.id,"desc",e.target.value)}
            className="
            w-full
            p-2
            mb-3
            border
            border-pink-200
            rounded-lg
            text-sm
            focus:outline-pink-300
            "
            />



            {/* SAVE BUTTON */}

            <button
            onClick={saveMemories}
            className="
            w-full
            bg-pink-400
            text-white
            py-2
            rounded-full
            text-sm
            hover:bg-pink-500
            transition
            "
            >
              💾 Save Memory
            </button>

          </motion.div>

        ))}

      </div>

    </div>

  );

}

export default Photos;