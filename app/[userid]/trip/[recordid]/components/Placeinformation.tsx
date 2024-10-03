"use client"
import React, { useEffect, useState ,useRef} from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { doc, updateDoc,getDoc } from "firebase/firestore"; 
import { db, auth } from '@/app/firebase';
import Image from 'next/image';
import style from "../styles/placeinformation.module.css"


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
     

      service.getDetails(request,(place,status)=>{

        if(status !== placesLib.PlacesServiceStatus.OK||!place){
          console.error("not found");
          return
          
        }else{
          setPlaceDetails(place)
          const photos = place.photos;
            if (photos && photos.length > 0) {
              const photoUrl = photos[0].getUrl({ maxWidth: 400, maxHeight: 400 });
              setPhotoUrl(photoUrl);
              
            
            }
        }
      })


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

            //存數據 
            if(docSnap.exists()){
                const dateRange: DateRangeItem[]  =docSnap.data().dateRange;
                
                
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
            
        } 
        catch (error) {
            console.error( error);
        }
    }
  
  
  
  
    return(
      <div>
        {placeDetails?(
          <div className={style.container} >
              <div className={style.container_name} >{placeDetails.name}</div>
              <div className={style.container_address} >{placeDetails.formatted_address}</div>
              <div>
                <img className={style.container_img} 
                     src={photoUrl}/>
              </div>
  
  
              { //營業時間
                placeDetails.opening_hours &&(
                  <div className={style.placeDetails_openinghours} >
                      <Image width={20} height={20}  src="/open.png" alt="open" style={{marginTop: '5px'}} />
                      <div style={{ whiteSpace: 'pre-line', paddingLeft: '10px' }}>
                          {
                              placeDetails.opening_hours.weekday_text?.map((text, index)=>{
                                const [day, time] = text.split(': ');
                                return(
                                  <div  style={{ fontSize: '15px', marginTop: '5px' }} key={index}>
                                    <span className={style.placeDetails_openinghours_week} >{day}</span>
                                    <span style={{ color: '#666666ff' }}>{time}</span>
                                  </div>
                                )
                              })
                          }
                      </div>
                  </div>
                )
              }
  
              {  //店家電話
                  placeDetails.formatted_phone_number &&(
                    <div style={{paddingTop:'20px',paddingLeft:'10px',display:'flex'}}>
                      <Image width={20} height={20} src="/phone.png" alt="phone"  style={{marginRight:'10px'}} />
                      <span style={{color:'#666666ff'}}>{placeDetails.formatted_phone_number}</span>
                    </div>
                  )
                }
  
              
              { //店家網址
                placeDetails.website &&(
                <div style={{paddingTop:'20px',paddingLeft:'10px'}}>
                    <div style={{display:'flex',alignItems:'center'}}> 
                        <Image width={20} height={20} src="/web.png" alt="web" style={{marginRight:'10px'}} />
                        <a href={placeDetails.website} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className={style.placeDetails_website} >{placeDetails.website}
                        </a>
                    </div>
                </div>
                )
              }

              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px' }}>
                <button onClick={handleAddPlace} 
                        className={style.container_button}>
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
  