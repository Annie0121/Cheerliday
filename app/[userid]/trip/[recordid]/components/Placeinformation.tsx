"use client"
import React, { useEffect, useState ,useRef} from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { doc, updateDoc,getDoc } from "firebase/firestore"; 
import { db, auth } from '@/app/firebase';

import openImg from '../open.png'
import webImg from '../web.png'
import phoneImg from '../phone.png'
import Image from 'next/image';


interface Coordinates {
    lat: number;
    lng: number;
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
    

interface placeinformation{
    placeId:string,
    setPlaceCoordinates:React.Dispatch<React.SetStateAction<{
        lat: number | null;
        lng: number | null;
    }>>,
    setSearchMarker:React.Dispatch<React.SetStateAction<{
      lat: number;
      lng: number;
    } | null>>,
    setSelectedDay:React.Dispatch<React.SetStateAction<string>>;
    placeCoordinates:{ lat: number | null, lng: number | null }
    selectedDay:string
  
}



export function Placeinformation({ placeId, placeCoordinates,setPlaceCoordinates,setSearchMarker, selectedDay, setSelectedDay}: placeinformation){
    const [placeDetails, setPlaceDetails] =  useState<google.maps.places.PlaceResult | null>(null);
    const [photoUrl, setPhotoUrl] = useState('');
    const placesLib = useMapsLibrary('places');
  
    useEffect(() => {
     
      if (!placesLib ) {
        console.log(" not available yet");
        return;
      }
  
      const service = new placesLib.PlacesService(document.createElement('div'));
      const request = {
        placeId: placeId,
        fields: [
          'name', 'formatted_address',  'photos','formatted_phone_number',
          'opening_hours', 'website', 'rating', 
        ]
      };
  
      service.getDetails(request, (place, status) => {
        if (status === placesLib.PlacesServiceStatus.OK) {
          
          if(place){
            setPlaceDetails(place)
            const photos = place.photos;
            if (photos && photos.length > 0) {
              const photoUrl = photos[0].getUrl({ maxWidth: 400, maxHeight: 400 });
              setPhotoUrl(photoUrl);
              console.log(photoUrl);
            }
          }
        } else {
          console.error('Details not found');
        }
      });
    }, [placeId,  placesLib]);
  
    const handleAddPlace = async() =>{
  
        if (!placeDetails || !placeDetails.name || !placeDetails.formatted_address || !placeCoordinates.lat || !placeCoordinates.lng || !photoUrl) {
          return; 
        }
        const newPlace: Attraction = {
          name:placeDetails.name,
          coordinates: {
              lat: placeCoordinates.lat, 
              lng: placeCoordinates.lng, 
          },
          address:placeDetails.formatted_address,
          picture:photoUrl,
          stayDuration: 60
      };
        
        
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('用戶未登錄');
            }
            
            const url = window.location.href.split("/");
            const recordid = url[5];
            const docRef = doc(db, 'record', recordid); 
            const docSnap = await getDoc(docRef);//獲取數據
            if(docSnap.exists()){
                const dateRange: DateRangeItem[]  =docSnap.data().dateRange;
                console.log(dateRange);
                console.log(selectedDay);
                
                dateRange.forEach(element => {
                    if(element.date==selectedDay){
                        element.attractions.push(newPlace)   
                    }
                });
                await updateDoc(docRef, { dateRange });
            }
    
            // 清空選擇的景點與日期
            
            setPlaceCoordinates({ lat: null, lng: null });
            setSelectedDay("");
            setSearchMarker(null)
            
        } catch (error) {
            console.error("更新資料失敗：", error);
        }
    }
  
  
  
  
    return(
      <div>
        {placeDetails?(
          <div style={{width:'100%',minHeight:'400px',marginTop:'30px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'}}>
              <div style={{fontSize:'25px',fontWeight:700,padding:'10px', color:'#434343ff'}}>{placeDetails.name}</div>
              <div style={{fontSize:'15px',paddingLeft:'10PX',color:'#999999ff'}}>{placeDetails.formatted_address}</div>
              <div>
                <img style={{width:'100%',height:'330px',overflow:'hidden',paddingTop:'20PX'}} src={photoUrl}></img>
              </div>
  
  
              {
                placeDetails.opening_hours&&(
                  <div style={{ display: 'flex', alignItems: 'flex-start', paddingLeft: '10px', paddingTop: '10px' }}>
                      <Image width={20} height={20} src={openImg} alt="open" style={{marginTop: '5px'}} />
                      <div style={{ whiteSpace: 'pre-line', paddingLeft: '10px' }}>
                          {
                              placeDetails.opening_hours.weekday_text?.map((text, index)=>{
                                const [day, time] = text.split(': ');
                                return(
                                  <div style={{ fontSize: '15px', marginTop: '5px' }} key={index}>
                                    <span style={{ marginRight: '15px', fontSize: '16px', fontWeight: 700, color: '#999999ff' }}>{day}</span>
                                    <span style={{ color: '#666666ff' }}>{time}</span>
                                  </div>
                                )
                              })
                          }
                      </div>
                  </div>
                )
              }
  
              {
                  placeDetails.formatted_phone_number &&(
                    <div style={{paddingTop:'20px',paddingLeft:'10px',display:'flex'}}>
                      <Image width={20} height={20} src={phoneImg} alt="phone"  style={{marginRight:'10px'}} />
                      <span style={{color:'#666666ff'}}>{placeDetails.formatted_phone_number}</span>
                    </div>
                  )
                }
  
              
              {
                placeDetails.website &&(
                <div style={{paddingTop:'20px',paddingLeft:'10px'}}>
                  <div style={{display:'flex',alignItems:'center'}}> 
                    <Image width={20} height={20} src={webImg} alt="web" style={{marginRight:'10px'}} />
                    <a href={placeDetails.website} target="_blank" rel="noopener noreferrer" style={{color:'#ea9999ff',fontSize:'16px',wordBreak: 'break-all', maxWidth: '90%',whiteSpace: 'normal'}}>{placeDetails.website}</a>
                  </div>
                </div>
                )
              }
               <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px' }}>
                  <button onClick={handleAddPlace} style={{ fontWeight: '600', fontSize: '17px', backgroundColor: '#ea9999ff', border: '0px', color: 'white', borderRadius: '3px', height: '35px', cursor: 'pointer' }}>
                    加入行程
                  </button>
                </div>
             
            </div>
        ):(
          <div>loading</div>
        )}
            
          
       
      </div>
      
      
    )
  }
  