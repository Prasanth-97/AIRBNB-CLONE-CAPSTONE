import PhotosUploader from "../PhotosUploader.jsx";
import Perks from "../Perks.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../AccountNav.jsx";
import { Navigate, useParams } from "react-router-dom";

export default function PlacesFormPage(){
    const {id} = useParams();
    const[title,setTitle] = useState("");
    const[address,setAddress] = useState("");
    const[addedPhotos,setAddedPhotos] = useState([]);    
    const[description,setDescription] = useState("");
    const[perks,setPerks] = useState([]);
    const[extraInfo,setExtraInfo] = useState("");
    const[checkIn,setCheckIn] = useState("");
    const[checkOut,setCheckOut] = useState("");
    const [maxGuests,setMaxGuests] = useState(1);
    const[price,setPrice] = useState(100);
    const [redirect,setRedirect] = useState(false);
   useEffect(() => {
     if(!id){
        return;
     }
     axios.get("/places/"+id)
     .then(response => {
        const {data} = response;
        setTitle(data.title);
        setAddress(data.address);
        setAddedPhotos(data.photos);
        setDescription(data.description);
        setPerks(data.perks);
        setExtraInfo(data.extraInfo);
        setCheckIn(data.checkIn);
        setCheckOut(data.checkOut);
        setMaxGuests(data.maxGuests);
        setPrice(data.price);
     })
   },[id]);

async function savePlace(ev){
    ev.preventDefault();
    const placeData = {
        title, address,addedPhotos,description,perks,extraInfo,checkIn,
        checkOut,maxGuests,price,
    }

    if(id){
     // update
     await axios.put("/places",{
       id,...placeData
    });
     setRedirect(true);
    }
    else{
    // new place 
        await axios.post("/places",placeData);
         setRedirect(true);
        }
    }
  

if(redirect){
    return <Navigate to={"/account/places"} />
}
    return(
        <div>
            <AccountNav />
        <form onSubmit={savePlace}>
            <h2 className="text-2xl mt-4">Title</h2>
            <p className="text-gray-500 text-sm">Title for your place</p>
            <input value={title} onChange={ev => setTitle(ev.target.value)} type="text" placeholder="title" />
            <h2 className="text-2xl mt-4">Address</h2>
            <p className="text-gray-500 text-sm">Address to this place</p>
            <input value={address} onChange={ev => setAddress(ev.target.value)}type="text" placeholder="address" />
            <h2 className="text-2xl mt-4">Photos</h2>
            <p className="text-gray-500 text-sm">more = Better</p>
            <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos}/>
            <h2 className="text-2xl mt-4">Description</h2>
            <p className="text-gray-500 text-sm">Description of the place</p>
            <textarea value={description} onChange={ev => setDescription(ev.target.value)} />
            <h2 className="text-2xl mt-4">Perks</h2>
            <p className="text-gray-500 text-sm">select all the perks of your place</p>
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                   <Perks selected={perks} onChange={setPerks}/> 
                </div>  
                <h2 className="text-2xl mt-4">Extra info</h2>
                <p className="text-gray-500 text-sm">house rules,etc</p>  
                <textarea value={extraInfo} onChange={ev => setExtraInfo(ev.target.value)}/> 
                <h2 className="text-2xl mt-4">Check in & out time & max-guests</h2>
                <p className="text-gray-500 text-sm">add check in and out time ,remember to have some time to clean the window between guests</p>         
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                  <div>
                    <h3 className="mt-2 mb-1">Check in time</h3>
                    <input value={checkIn} onChange={ev => setCheckIn(ev.target.value)} type="text" placeholder="23.00" />
                  </div>
                  <div>
                    <h3 className="mt-2 mb-1">Check out time</h3>
                    <input value={checkOut} onChange={ev => setCheckOut(ev.target.value)} type="text" placeholder="11.00" />
                  </div>
                  <div>
                    <h3 className="mt-2 mb-1">Max no of guests</h3>
                    <input value={maxGuests} onChange={ev => setMaxGuests(ev.target.value)} type="number"/>
                  </div>
                  <div>
                    <h3 className="mt-2 mb-1">Price Per night</h3>
                    <input value={price} onChange={ev => setPrice(ev.target.value)} type="number"/>
                  </div>
                </div>
                <button className="primary my-4 text-xl">save</button>
        </form>
    </div>    
    )
}