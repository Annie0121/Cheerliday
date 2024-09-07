"use client"
import React, { useEffect, useRef} from 'react';
import {useMap, useMapsLibrary,AdvancedMarker,Pin } from '@vis.gl/react-google-maps';
import{useCalculateTravelTimes} from "../utils/useCalculateTravelTimes"



const colors=['#d05b6eff ',"#45818eff","#c1683cff","#a64d79ff","#a28c37ff","#8075b5ff","#6aa84fff"]

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

interface Coordinates {
    lat: number;
    lng: number;
}
interface mapcontent{
    dateRange: DateRangeItem[];
    searchMarker:Coordinates| null;
    setTravelTimes:React.Dispatch<React.SetStateAction<{}>>
  }
  
  
  //景點路徑
export  function MapContent({ dateRange,searchMarker,setTravelTimes }:mapcontent) {
    const map = useMap();
    const maps = useMapsLibrary("maps") ;
    
    const flightPathsRef = useRef<google.maps.Polyline[]>([]);
    
    useEffect(() => {
      if (!maps || !map) return;
      
      dateRange.forEach((date, index) => {
        let flightPath = flightPathsRef.current[index];
    
        if (!flightPath) {
          flightPath = new maps.Polyline({
            geodesic: true,
            strokeColor: colors[index % colors.length],
            strokeOpacity: 0.6,
            strokeWeight: 4,
          });
          flightPath.setMap(map);
          flightPathsRef.current[index] = flightPath;
        }
        const coordinates = date.attractions.map(attraction => attraction.coordinates);
        flightPath.setPath(coordinates);
      });
    }, [map, maps, dateRange]);

    useCalculateTravelTimes({dateRange,setTravelTimes})
    return (
      <>
        {dateRange.map((date, index) => (
          date.attractions.map((attraction, i) => (
            <AdvancedMarker
              key={`${index}-${i}`}
              position={attraction.coordinates}
            >
              <Pin
                background={colors[index % colors.length]}
                glyphColor={'#ffffffff'}
                borderColor={'#ffffffff'}
                glyph={`${i + 1}`} 
                
                
              />
            </AdvancedMarker>
          ))
        ))}
        {searchMarker && (
                <AdvancedMarker position={searchMarker}>
                <Pin background={'red'} glyphColor={'#000'} borderColor={'#000'}  />
              </AdvancedMarker>
        )
        }
        
      </>
    );
  }