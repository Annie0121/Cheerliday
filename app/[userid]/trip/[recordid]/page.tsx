"use client"
import { db, auth } from '@/app/firebase';
import {onAuthStateChanged, User} from "firebase/auth"
import {APIProvider, Map,Marker,useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import React, { useEffect, useState ,useRef} from 'react';
import { doc, updateDoc,collection, setDoc,getDoc, onSnapshot , query, where,getDocs,deleteDoc } from "firebase/firestore"; 
import { useRouter } from "next/navigation";
import styles from './recordid.module.css';
import Image from 'next/image';
import carImage from './car.png'
import searchImg from './search.png'
import openImg from './open.png'
import webImg from './web.png'
import phoneImg from './phone.png'
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function Home(){
    const [user, setUser] = useState<any>(null);
    const [record, setRecord] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedDay, setSelectedDay] = useState("");
    const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number } | null>(null);
    const [travelTimes, setTravelTimes] = useState({});
    const router=useRouter()

    //確認用戶登入狀態
    useEffect(()=>{
        const  unsubscribe=onAuthStateChanged(auth,(currentUser)=>{
          if(currentUser){
            setUser(currentUser)
            
            const url=window.location.href.split("/")
            let recordId=url[5];
            if(!isLoaded){
                fetchUserData(currentUser.uid,recordId);
              }
          }else{
            console.log("沒有");
            router.push("/")

          }
        })
        return () => unsubscribe();
    },[setUser,router])

   
    //抓取用戶資料，渲染行程總攬
    const fetchUserData = async(userId: string,recordid:string) => {
        const q = query(collection(db, "record"), where("userid", "==", userId), where("__name__", "==", recordid));
        try {
          //抓取數據
          const unsubscribe =onSnapshot(q,(snapshot)=>{
            snapshot.forEach((doc)=>{
                setRecord(doc.data());
                setIsLoaded(true)
            })
          })

        } catch (error) {
          console.error( error);
        }   
    }
    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return(
        <div style={{ display: 'flex', width: '100%',alignItems: 'flex-start',height:"calc(100vh - 70px)"   }}>
            {selectedDay?
            (< SearchPlace record={record} setSelectedDay={setSelectedDay} selectedDay={selectedDay} setSearchMarker={setSearchMarker}></SearchPlace>)
            :<Schedule setSelectedDay={setSelectedDay} record={record} travelTimes={travelTimes}></Schedule>}
            <Mymap record={record} searchMarker={searchMarker} setTravelTimes={setTravelTimes}></Mymap> 
        </div>
            
        
    )
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
  countryCode:string
}

interface Schedule{
  record:Record,
  setSelectedDay:React.Dispatch<React.SetStateAction<string>>,
  travelTimes: { [key: string]: string };
}

interface Attraction {
  coordinates: Coordinates;
  name: string;
  address:string,
  picture:string
}
interface DateRangeItem {
  date: string;
  attractions: Attraction[];
}

function Schedule({record,setSelectedDay,travelTimes}:Schedule){
    const [name, setname] = useState(record ? record.name : "");
    const[startdate,setstartdate]=useState(record ? record.startdate : "");
    const[enddate,setenddate]=useState(record ? record.enddate : "");
    const [dateRange, setDateRange] = useState(record ? record.dateRange :[]);
    //const [selectedDay, setSelectedDay] = useState("");
    console.log(travelTimes);
    
    //組件渲染後訪問和操作 DOM 元素
    const myRef = useRef<HTMLDivElement>(null);
    //點擊左右
    const listRight=()=>{
        let screenWidth = window.innerWidth;
        let scrollDistance;
        if (screenWidth <= 360) {
            scrollDistance = 100; 
        } else if (screenWidth <= 1200) {
            scrollDistance = 600; 
        } else {
            scrollDistance = 800; 
        }
        if (myRef.current) {
            myRef.current.scrollLeft += scrollDistance;
        }

    }

    const listLeft=()=>{
        let screenWidth = window.innerWidth;
        let scrollDistance;
        if (screenWidth <= 360) {
            scrollDistance = 100; 
        } else if (screenWidth <= 1200) {
            scrollDistance = 600; 
        } else {
            scrollDistance = 800; 
        }
        if (myRef.current) {
            myRef.current.scrollLeft -= scrollDistance;
        }

    }

    
    function addplace(date:string){
        setSelectedDay(date);      
    }
    const dateRef = useRef<(HTMLDivElement | null)[]>([]);
    const getdate =(index:number)=>{
        const element = dateRef.current[index];
        if(element){
            element.scrollIntoView(
                {behavior:'smooth'}
            );
        }
        
        
    }

    const handleDel= async(attractionindex:number,dateindex:number)=>{
      
      const updatedDateRange = [...record.dateRange];
      updatedDateRange[dateindex].attractions.splice(attractionindex, 1);
      const url=window.location.href.split("/")
      let recordId=url[5];
      const recordRef = doc(db, "record", recordId); 
      try {
          await updateDoc(recordRef, {
              dateRange: updatedDateRange
          });
      } catch (error) {
          console.error( error);
      }
      
      
    }
    return(
        <div style={{flex: 2,overflowY: 'auto',height:"calc(100vh - 66.5px)" }}>
            <div style={{width:'100%'}}>
                <div style={{fontSize:'35px',fontWeight:700,margin:'20PX'}}>{name}</div>
                <div style={{fontSize:'20px',fontWeight:700,margin:'20PX'}}>{startdate} ~ {enddate}</div>
                <div style={{display:'flex',marginTop:'20PX',width:'100%',justifyContent:'space-between',height:'50px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'}}>
                    <div style={{width:'40px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',fontSize:'30px',textAlign:'center',paddingTop:'5PX'}} onClick={listLeft}>&lt;</div>
                    <div style={{ width: 'calc(100% - 80px)',display: 'flex',overflow: 'hidden'}} ref={myRef}>
                        {dateRange.map((date, index:number) => (
                        <div key={index} 
                            style={{ width: '100px', border: '1px solid #efefefff', textAlign: 'center', alignContent: 'center', flexShrink: '0', }}
                            onClick={()=>getdate(index)}>
                            {date.date}
                            <div  >第{index+1}天</div>
                        </div>
                        ))}
                    </div>
                    <div style={{width:'40px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',fontSize:'30px',textAlign:'center',paddingTop:'5PX'}} onClick={listRight}>&gt;</div>
                </div>
            </div>
            <div style={{backgroundColor:'#efefefff',paddingTop:'20PX',paddingBottom:'40px'}}> 
                {dateRange.map((date,dateindex)=>(
                    <React.Fragment key={dateindex} >
                        <div style={{display:'flex',margin:'35px 10px'}}>
                            <div 
                                style={{width:'65px',backgroundColor:'#999999ff',marginLeft:'10px',height:'30px',fontSize:'20px',padding:'5px',borderRadius:'6px',fontWeight:'600',color:'white', alignItems:'center',textAlign:'center'}}
                                ref={el => {dateRef.current[dateindex] = el}}
                                >  
                                第{dateindex+1}天
                            </div>
                            <p style={{height:'30px',display: 'flex', alignItems:'center',justifyItems:'center',margin:'5px',marginLeft:'70%'}}>
                              {date.date}
                            </p>
                        </div>
                        {date.attractions && date.attractions.length > 0 && (
                            date.attractions.map((attraction, attractionindex) => (
                                <React.Fragment key={attractionindex}>
                                    <div  style={{width:'100%',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 -4px 6px rgba(0, 0, 0, 0.1)',backgroundColor:'white',height:'130px', display:'flex',justifyContent:'center',alignItems:'center'}}>
                                        <div style={{display:'flex',height:'80px',width:'95%'}}>
                                          <img style={{height:'80px',width:'80px',overflow:'hidden'}} src={attraction.picture}></img>
                                          <div style={{marginLeft:'10px',flexGrow: 1}}>
                                            <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                              <div style={{fontSize:'20PX',fontWeight:'700'}}>
                                                {attraction.name}
                                              </div>
                                              
                                            </div>
                                            <div style={{fontSize:'13px'}}>{attraction.address}</div>
                                          </div>
                                          <span style={{}} onClick={()=>handleDel(attractionindex,dateindex)}>×</span>
                                          
                                        </div>  
                                    </div>
                                    {attractionindex < date.attractions.length - 1 && (
                                        <div style={{borderLeft: '2px dashed #666666ff',height:'50px',marginLeft:'50px',display:'flex',alignItems:'center'  }}>
                                           {travelTimes[date.date] && travelTimes[date.date][attractionindex] && (
                                                <div style={{ margin: '10px',display:'flex' }}>
                                                  <div style={{marginRight:'10px'}}>約 {travelTimes[date.date][attractionindex]} </div>
                                                  <Image width={20} height={20} src={carImage} alt="Car" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))  
                        )}
                        <div style={{width: '50px',height: '50px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',borderRadius:' 50%',display: 'flex',alignItems: 'center',justifyContent: 'center',backgroundColor: 'white',margin:'30px 100px'}}
                        onClick={() => addplace(date.date)}>
                            <span>+</span>
                        </div> 
                    </React.Fragment>
                ))} 
            </div>
        </div>
    )
}
interface Mymap{
  record:Record;
  searchMarker:Coordinates| null;
  setTravelTimes:React.Dispatch<React.SetStateAction<{}>>
}


function Mymap({record,searchMarker,setTravelTimes}:Mymap){
    const [center, setcenter] = useState(record ? record.coordinates : { lat:  0, lng:  0 });
    const [dateRange, setDateRange] = useState(record ? record.dateRange :[]);
    //const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    useEffect(() => {
        if (record) {
            setDateRange(record.dateRange);
        }
    }, [record]);
    
    
        return(
            <APIProvider apiKey={`${apiKey}`} >
              <Map
                  style={{flex: 3,height:"calc(100vh - 66.5px)" }}
                  defaultCenter={center}
                  defaultZoom={12}
                  gestureHandling={'greedy'}
                  disableDefaultUI={true}
                  mapId='842bf081f72c1734'
              >
                    <MapContent  dateRange={dateRange} searchMarker={searchMarker} setTravelTimes={setTravelTimes} />
              </Map>
            </APIProvider>
            )
           
          
}
interface searchPlace{
  record:Record;
  setSelectedDay:React.Dispatch<React.SetStateAction<string>>;
  selectedDay:string;
  setSearchMarker: React.Dispatch<React.SetStateAction<{
    lat: number;
    lng: number;
} | null>>
}

function SearchPlace({record,setSelectedDay,selectedDay,setSearchMarker}:searchPlace){
    const[place,setPlace]=useState('')
    const [placeCoordinates, setPlaceCoordinates] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });
    const [countryCode,setCountryCode]= useState(record?record.countryCode:'')
    const[placeId,setPlaceId]=useState('')
  


    const handleSearchPlace =async () => {
      try {
        const placeinfo = await getCoordinates(place,countryCode);
        const coordinates=placeinfo.coordinates
        const placeId= placeinfo.placeId
        setPlaceId(placeId)
       
        
        
        if (coordinates.lat === null || coordinates.lng === null) {
          console.log('Latitude or Longitude is null');
            throw new Error("查無景點");
        }
        //const details = await placeDetailInfo(placeId);
        setPlaceCoordinates(coordinates);
        setSearchMarker(coordinates);
    } catch (error) {
        console.error(error);
        alert("查無景點"); 
    }
         
    };

   
/*
    async function placeDetailInfo(placeId:string){
      
      console.log(placeId);
      
    
    }*/


    function back(){
        setPlace("");
        setPlaceCoordinates({ lat: null, lng: null });
        setSelectedDay("");
        setSearchMarker(null)

    }



    return(
      <APIProvider apiKey={`${apiKey}`}>
          <div style={{flex: 2,overflowY: 'auto',height:"calc(100vh - 66.5px)" }}>
            <div style={{margin:'40px auto',width:'90%'}}>
                <div style={{marginBottom:'20px',color:'#999999ff',fontSize:'18px',fontWeight:'600'}} onClick={back}>←  回上頁</div>

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
                        onClick={handleSearchPlace}>
                        <Image  width={22} height={22} src={searchImg} alt="search" />
                    </div>
                
                </div>
                
                {placeId && (
                  <Placeinformation placeId={placeId} selectedDay={selectedDay} placeCoordinates={placeCoordinates} setPlaceCoordinates={setPlaceCoordinates}  setSearchMarker={ setSearchMarker} setSelectedDay={setSelectedDay} ></Placeinformation>
                 )}
            </div>
                 
        </div>
      </APIProvider>
        
    )
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


function Placeinformation({ placeId, placeCoordinates,setPlaceCoordinates,setSearchMarker, selectedDay, setSelectedDay}: placeinformation){
  const [placeDetails, setPlaceDetails] =  useState<google.maps.places.PlaceResult | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  //const map = useMap();
  console.log(selectedDay);
  
  const placesLib = useMapsLibrary('places');
  console.log(placeId);
  //const service = new google.maps.places.PlacesService(document.createElement('div'));
  useEffect(() => {
    
    console.log("placesLib:", placesLib);
    if (!placesLib ) {
      console.log("Maps library or map is not available yet");
      return;
    }
    console.log("有資料");

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
        console.log(place);
        
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
     /* if (placeCoordinates.lat === null || placeCoordinates.lng === null) {
      alert("查無景點");
      return;
    }*/

      if (!placeDetails || !placeDetails.name || !placeDetails.formatted_address || !placeCoordinates.lat || !placeCoordinates.lng || !photoUrl) {
       
        return; // 停止執行，如果有資料為空
      }
      const newPlace: Attraction = {
        name:placeDetails.name,
        coordinates: {
            lat: placeCoordinates.lat, 
            lng: placeCoordinates.lng, 
        },
        address:placeDetails.formatted_address,
        picture:photoUrl
    };
      
      
      try {
          const user = auth.currentUser;
          if (!user) {
              throw new Error('用戶未登錄');
          }
          
          const url = window.location.href.split("/");
          const recordid = url[5];
          const docRef = doc(db, 'record', recordid); //創建文件引用
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
            
            <button onClick={handleAddPlace} style={{fontWeight:'600',fontSize:'17px',backgroundColor:'#ea9999ff',border:'0px',color:'white',borderRadius:'3px',margin:'20px',height:'35px',marginLeft:'400px',cursor:'pointer'}}>加入行程</button>
            
           
          </div>
      ):(
        <div>loading</div>
      )}
          
        
     
    </div>
    
    
  )
}



async function  getCoordinates(address:string,countryCode:string) {
  console.log(countryCode);
  
   
    const encodedCity = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedCity}&region=${countryCode}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
   // console.log(data.results[0].place_id);
    const placeId=data.results[0].place_id
    const location = data.results[0].geometry.location;
    return {
      coordinates:{
        lat: location.lat,
        lng: location.lng
      },
      placeId:placeId
      
    };
  }

interface mapcontent{
  dateRange: DateRangeItem[];
  searchMarker:Coordinates| null;
  setTravelTimes:React.Dispatch<React.SetStateAction<{}>>
}


//景點路徑
function MapContent({ dateRange,searchMarker,setTravelTimes }:mapcontent) {
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
          strokeColor: "#FF0000",
          strokeOpacity: 0.3,
          strokeWeight: 3,
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
          <Marker
            key={`${index}-${i}`}
            position={attraction.coordinates}
            label={`${i+1}`}
          />
        ))
      ))}
      {searchMarker && (
              <Marker
                  position={searchMarker}
              >
              </Marker>
      )
      }
      
    </>
  );
}
  

interface calculateTravelTimes{
  dateRange: DateRangeItem[];
  setTravelTimes:React.Dispatch<React.SetStateAction<{}>>
}

//交通時間
function useCalculateTravelTimes({dateRange,setTravelTimes}:calculateTravelTimes) {
    
    /*const map = useMap();*/
    const routes = useMapsLibrary("routes");
  
    useEffect(() => {
        
        if (!routes) {
            console.log("Routes library is not loaded yet");
            return;
          }
      
        
  
      const service = new routes.DistanceMatrixService();
      const newTravelTimes: { [key: string]: string[] } = {};
  
      const calculateDistances = async () => {
        for (const day of dateRange) {
          newTravelTimes[day.date] = [];
          const { attractions } = day;
          if (attractions.length < 2) continue;
  
          for (let i = 0; i < attractions.length - 1; i++) {
            const origin = attractions[i].coordinates;
            const destination = attractions[i + 1].coordinates;
  
            try {
              const response = await new Promise((resolve, reject) => {
                service.getDistanceMatrix(
                  {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: routes.TravelMode.DRIVING,
                  },
                  (response, status) => {
                    if (status === routes.DistanceMatrixStatus.OK) {
                      if (response) {
                        const results = response.rows[0].elements[0];
                        
                        newTravelTimes[day.date].push(results.duration.text);
                      }resolve(null);
                    } else {
                      reject(status);
                    }
                  }
                );
              });
            } catch (error) {
              console.error('錯誤:', error);
              newTravelTimes[day.date].push('計算錯誤');
            }
          }
  
          
        }
  
        setTravelTimes(newTravelTimes)
      };
  
      // 立即執行異步函式
      calculateDistances();
    }, [routes, dateRange]);
  }
  

