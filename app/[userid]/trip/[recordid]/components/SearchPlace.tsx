import React, {  useEffect, useRef, useState } from 'react';
import{getCoordinates} from '../utils/getCoordinates'
import {APIProvider,useMap,useMapsLibrary } from '@vis.gl/react-google-maps';
import Image from 'next/image';
import { Placeinformation} from '../components/Placeinformation'
import searchImg from '../search.png'
import style from "../styles/searchplace.module.css"
import { createRoot } from 'react-dom/client';
import { log } from 'console';
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;



interface Coordinates {
    lat: number;
    lng: number;
}

interface DateRangeItem {
date: string;
startTime:string;
attractions: Attraction[];
}  

interface Attraction {
    coordinates: Coordinates;
    name: string;
    address:string,
    picture:string,
    stayDuration: number
}

interface Record {
    coordinates: Coordinates;
    dateRange: DateRangeItem[];
    enddate: string;
    name: string;
    startdate: string;
    userid: string;
    countryCode:string;
    statrTime:string;
    backgroundImage:string
}


interface searchPlace{
    record:Record;
    setSelectedDay:React.Dispatch<React.SetStateAction<string>>;
    selectedDay:string;
    setSearchMarker: React.Dispatch<React.SetStateAction<{
      lat: number;
      lng: number;
  } | null>>}

export function SearchPlace({record,setSelectedDay,selectedDay,setSearchMarker}:searchPlace){
    
    const [placeCoordinates, setPlaceCoordinates] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });
    const [countryCode,setCountryCode]= useState(record?record.countryCode:'')
    const[placeId,setPlaceId]=useState('')
    const[error,seterror]=useState('')
    const[place,setPlace]=useState('')
  
    //回上一頁
    function back(){
        setPlace("");
        setPlaceCoordinates({ lat: null, lng: null });
        setSelectedDay("");
        setSearchMarker(null)

    }

  

    return(
      <APIProvider apiKey={`${apiKey}`}>
          <div className={style.searchplace}>
            <div style={{margin:'40px auto',width:'90%'}} >
                <div className={style.searchplace_back}  onClick={back}>←  回上頁</div>

                <Placeinput 
                            setPlaceId={setPlaceId} 
                            setPlaceCoordinates={setPlaceCoordinates}
                            setSearchMarker={setSearchMarker}
                            seterror={seterror}
                            countryCode={countryCode}
                            place={place}
                            setPlace={setPlace}
                            

                ></Placeinput>
                {error&&(<div className={style.error} >{error}</div>)}
                
                {placeId && (
                  <Placeinformation 
                      placeId={placeId} 
                      selectedDay={selectedDay} 
                      placeCoordinates={placeCoordinates} 
                      setPlaceCoordinates={setPlaceCoordinates}  
                      setSearchMarker={ setSearchMarker} 
                      setSelectedDay={setSelectedDay} 
                    />
                 
                 )}
            </div>
                 
        </div>
      </APIProvider>
        
    )
}



interface placeinput{
  setPlaceId:React.Dispatch<React.SetStateAction<string>>,
  setPlaceCoordinates:React.Dispatch<React.SetStateAction<{
    lat: number | null;
    lng: number | null;
  }>>
  setSearchMarker: React.Dispatch<React.SetStateAction<{
    lat: number;
    lng: number;
  } | null>>,
  seterror:React.Dispatch<React.SetStateAction<string>>,
  countryCode: string,
  place:string,
  setPlace: React.Dispatch<React.SetStateAction<string>>
}

export function Placeinput({setPlaceId,setPlaceCoordinates,setSearchMarker,seterror,countryCode,place,setPlace}:placeinput){
  
    //獲取景點座標及PlaceId
    const inputRef =useRef<HTMLInputElement >(null); 
    const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const map = useMap();
    const places = useMapsLibrary("places") ;
    const [isAutocompleteSelected, setIsAutocompleteSelected] = useState(false);
    

     //搜尋按紐，獲取景點座標及PlaceId
    const handleSearchPlace =async () => {
      try {
        
        if(isAutocompleteSelected){
          const info=placeAutocomplete?.getPlace()
          const placeId = info?.place_id ?? "";
          setPlaceId(placeId); 
          
          if (info?.geometry && info.geometry.location) {
            const lat = info.geometry.location.lat();
            const lng = info.geometry.location.lng();
            console.log({ lat, lng });
            setPlaceCoordinates({ lat, lng });
            setSearchMarker({ lat, lng });
            //清空資料
            seterror("")
            setIsAutocompleteSelected(false)
            setPlace("")
            
          }
        
        }else{
          
          const placeinfo = await getCoordinates(place,countryCode);
          const coordinates=placeinfo.coordinates
          const placeId=  placeinfo.placeId
          setPlaceId(placeId)
          setPlaceCoordinates(coordinates);
          setSearchMarker(coordinates);
          seterror("")
          setPlace("")
          
        }
      
     } catch (error) {
        console.error(error);
        seterror("查無景點")
        
    }};

    //處理autocomplete
    useEffect(()=>{
    if (!places || !inputRef.current)return;
   
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current));
    
  },[places])  

  useEffect(()=>{
    if (!placeAutocomplete) return;
    placeAutocomplete.addListener('place_changed', () => {
      setIsAutocompleteSelected(true)
    });
  },[placeAutocomplete])






  return(
    <div style={{display:'flex',margin:'0 auto'}}>
                    <input 
                      type="text" 
                      placeholder="輸入景點"  
                      onChange={(e)=>{setPlace(e.target.value)}}
                      className={style.search_input}
                      ref={inputRef}
                      
                    />
                    <div className={style.search_input_button}
                         onClick={()=>{handleSearchPlace(),setPlace("")}}>

                         <Image  width={22} height={22} src={searchImg} alt="search" />
                    </div>
  </div>
  )
}