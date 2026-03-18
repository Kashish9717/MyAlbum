import React, { useEffect } from "react";
import "./AnimatedBg.css";

function AnimatedBackground() {

  useEffect(() => {

    const shapes = ["✨", "🌸", "🎀", "⭐", "🍓", "🌙"];

    const createShape = () => {
      const shape = document.createElement("div");

      shape.style.fontSize = Math.random()*20 + 20 + "px";
      shape.style.transform = `rotate(${Math.random()*360}deg)`;
      shape.innerText = shapes[Math.floor(Math.random() * shapes.length)];
      shape.className = "shape";

      shape.style.left = Math.random() * 100 + "vw";
      shape.style.top = Math.random() * 100 + "vh";

      document.body.appendChild(shape);

      setTimeout(() => {
        shape.remove();
      }, 6000);
    };

    // interval create
    const interval = setInterval(createShape, 500);

    // cleanup function
    return () => clearInterval(interval);

  }, []);

  return null;
}

export default AnimatedBackground;

//Logic
// useEffect run hota h, har 500ms me createShape() run hota hai, 
// random emoji shape screen pr aate h
//6sec baad remove
//jab compoennt remove hota h-> clearInterval run hota h