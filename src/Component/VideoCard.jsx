/*
Reusable Video Card

Used in Videos page
Shows video + title + description
*/

import React from "react";

function VideoCard({ video, title, desc }) {
  return (
    <div className="bg-black backdrop-blur-md p-4 rounded-2xl shadow-lg">

      <video
        src={video}
        autoPlay
        muted
        loop
        playsInline
        className="w-full rounded-xl"
      />

      <h3 className="text-lg font-semibold mt-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>

    </div>
  );
}

export default VideoCard;