import {APIProvider, Map } from '@vis.gl/react-google-maps';
import{MapContent} from '../components/MapContent'
import React, { useEffect, useState } from 'react';
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
interface Mymap{
    record:Record;
    searchMarker:Coordinates| null;
    setTravelTimes:React.Dispatch<React.SetStateAction<{}>>
}

interface Attraction {
    coordinates: Coordinates;
    name: string;
    address:string,
    picture:string,
    stayDuration: number
}
  

interface DateRangeItem {
    date: string;
    startTime:string;
    attractions: Attraction[];
}

interface Coordinates {
    lat: number;
    lng: number;
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
  



export  function Mymap({record,searchMarker,setTravelTimes}:Mymap){
    const [center, setcenter] =  useState<Coordinates | null>(null);
    const [dateRange, setDateRange] = useState(record ? record.dateRange :[]);
    const [zoom, setZoom] = useState<number | null>(null);
    
    
    useEffect(() => {
        if (record) {
            setDateRange(record.dateRange);
        }
    }, [record]);

   useEffect(() => {
      if (searchMarker) {
        setcenter(searchMarker);
        setZoom(17); 
      } else {
        setcenter(null);
        setZoom(null); 
      }
    }, [searchMarker]);
    
        return(
          <>
                <APIProvider apiKey={`${apiKey}`} >
                    <Map
                        style={{width: '100%', height: '100%' }}
                        defaultCenter={record ? record.coordinates : { lat:  0, lng:  0 }}
                        defaultZoom={13}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        mapId='842bf081f72c1734'
                        center={center }
                        zoom={zoom }
                        key={searchMarker ? 'focused' : 'default'}
                      
                    >
                          <MapContent  
                            dateRange={dateRange} 
                            searchMarker={searchMarker} 
                            setTravelTimes={setTravelTimes} 
                            
                          />
                    </Map>
                </APIProvider>
          </>
            
        )
           
          
}

