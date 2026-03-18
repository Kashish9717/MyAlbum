import VideoCard from "../Component/VideoCard";

// import v1 from "../assets/videos/v1.mp4";
import v1 from "../assets/Videos/v1.mp4";
import v2 from "../assets/Videos/v2.mp4";
import v3 from "../assets/Videos/v3.mp4";
import v4 from "../assets/Videos/v4.mp4";
import v5 from "../assets/Videos/v5.mp4";
import v6 from "../assets/Videos/v6.mp4";
import v7 from "../assets/Videos/v7.mp4";
import v8 from "../assets/Videos/v8.mp4";
import v9 from "../assets/Videos/v9.mp4";
import v10 from "../assets/Videos/v10.mp4";
import v11 from "../assets/Videos/v11.mp4";
import v12 from "../assets/Videos/v12.mp4";
import v13 from "../assets/Videos/v13.mp4";
import v14 from "../assets/Videos/v14.mp4";
import v15 from "../assets/Videos/v15.mp4";
import v16 from "../assets/Videos/v16.mp4";
import v17 from "../assets/Videos/v17.mp4";


function Videos(){

const videos=[
{video:v1,title:"Beach Day",desc:"Beautiful sunset memory"},
{video:v2,title:"Fun Trip",desc:"Best trip ever"},
{video:v3,title:"Memory 3",desc:"Special moment"},
{video:v4,title:"Memory 4",desc:"Good vibes"},
{video:v5,title:"Memory 5",desc:"Fun time"},
{video:v6,title:"Memory 6",desc:"Happy moment"},
{video:v7,title:"Memory 7",desc:"Lovely memory"},
{video:v8,title:"Memory 8",desc:"Amazing day"},
{video:v9,title:"Memory 9",desc:"Best day"},
{video:v10,title:"Memory 10",desc:"Trip vibes"},
{video:v11,title:"Memory 11",desc:"Great memory"},
{video:v12,title:"Memory 12",desc:"Special video"},
{video:v13,title:"Memory 13",desc:"Beautiful time"},
{video:v14,title:"Memory 14",desc:"Fun day"},
{video:v15,title:"Memory 15",desc:"Cute moment"},
{video:v16,title:"Memory 16",desc:"Happy vibes"},
{video:v17,title:"Memory 17",desc:"Adventure time"},

];

return(

<div className="video-page">

<h2>🎬 My Videos</h2>

<div className="video-grid">

{videos.map((v,i)=>(
<VideoCard
key={i}
video={v.video}
title={v.title}
desc={v.desc}
/>
))}

</div>

</div>

)

}

export default Videos;