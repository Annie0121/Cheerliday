import React, { useEffect, useState ,useRef} from 'react';
import{getCoordinates} from '../utils/getCoordinates'
import {APIProvider } from '@vis.gl/react-google-maps';
import styles from '../recordid.module.css';
import Image from 'next/image';
import { Placeinformation} from '../components/Placeinformation'
import searchImg from '../search.png'
import style from "../styles/searchplace.module.css"
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
    const[place,setPlace]=useState('')
    const [placeCoordinates, setPlaceCoordinates] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });
    const [countryCode,setCountryCode]= useState(record?record.countryCode:'')
    const[placeId,setPlaceId]=useState('')
    const[error,seterror]=useState('')
    const handleSearchPlace =async () => {
      try {
        const placeinfo = await getCoordinates(place,countryCode);
        const coordinates=placeinfo.coordinates
        const placeId= placeinfo.placeId
        setPlaceId(placeId)
       
        setPlaceCoordinates(coordinates);
        setSearchMarker(coordinates);
        seterror("")
    } catch (error) {
        console.error(error);
        seterror("查無景點")
       
    }
         
    };

    function back(){
        setPlace("");
        setPlaceCoordinates({ lat: null, lng: null });
        setSelectedDay("");
        setSearchMarker(null)

    }

    return(
      <APIProvider apiKey={`${apiKey}`}>
          <div className={style.searchplace}>
            <div style={{margin:'40px auto',width:'90%'}}>
                <div style={{marginBottom:'20px',color:'#999999ff',fontSize:'18px',fontWeight:'600',cursor:'pointer'}} onClick={back}>←  回上頁</div>

                <div style={{display:'flex',margin:'0 auto'}}>
                    <input 
                      type="text" 
                      placeholder="輸入景點"  
                      onChange={(e)=>{setPlace(e.target.value)}}
                      value={place}
                      className={styles.search_input}
                    />
                    <div style={{
                          width:'15%',
                          height:'45px',
                          border: '2px solid #ea9999ff',
                          borderRadius:'5px',
                          borderTopRightRadius: '5px',
                          borderBottomRightRadius: '5px',
                          borderTopLeftRadius: '0',
                          borderBottomLeftRadius: '0',
                          display:'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor:'#ea9999ff',
                          cursor:'pointer'
                        }}
                        onClick={()=>{setPlace(''),handleSearchPlace(),setPlaceId('')}}>
                        <Image  width={22} height={22} src={searchImg} alt="search" />
                    </div>
                </div>
                {error&&(<div style={{width:'85%',color:'red',marginLeft:'10PX',marginTop:'10px',fontWeight:'600'}}>{error}</div>)}
                
                {placeId && (
                  <Placeinformation placeId={placeId} selectedDay={selectedDay} placeCoordinates={placeCoordinates} setPlaceCoordinates={setPlaceCoordinates}  setSearchMarker={ setSearchMarker} setSelectedDay={setSelectedDay} ></Placeinformation>
                 )}
            </div>
                 
        </div>
      </APIProvider>
        
    )
}
