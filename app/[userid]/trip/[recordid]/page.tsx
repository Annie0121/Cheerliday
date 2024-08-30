"use client"
import { db, auth } from '@/app/firebase';
import {onAuthStateChanged, User} from "firebase/auth"
import {APIProvider, Map,Marker,useMap, useMapsLibrary,AdvancedMarker,Pin } from '@vis.gl/react-google-maps';
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
import { Select, Button, Modal } from 'antd';


const { Option } = Select;
import dayjs from 'dayjs';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const colors=['#d05b6eff ',"#45818eff","#c1683cff","#a64d79ff","#a28c37ff","#8075b5ff","#6aa84fff"]
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
            :<Schedule setSelectedDay={setSelectedDay} record={record} travelTimes={travelTimes} setRecord={setRecord}></Schedule>}
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
  statrTime:string
}

interface Schedule{
  record:Record,
  setSelectedDay:React.Dispatch<React.SetStateAction<string>>,
  travelTimes: { [key: string]: string };
  setRecord:React.Dispatch<any>
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

function Schedule({record,setSelectedDay,travelTimes,setRecord}:Schedule){
    const [name, setname] = useState(record ? record.name : "");
    const[startdate,setstartdate]=useState(record ? record.startdate : "");
    const[enddate,setenddate]=useState(record ? record.enddate : "");
    const [dateRange, setDateRange] = useState(record ? record.dateRange :[]);
    //const [selectedDay, setSelectedDay] = useState("");
    const [showModal,setshowModal]=useState(false)
    const [currentDateIndex,setCurrentDateIndex]=useState<number | null>(null);
    const [AttractionIndex, setAttractionIndex] = useState<number| null>(null);
    const [selectedDateIndex, setSelectedDateIndex] = useState<number| null>(null);
    const [calculatedTimes, setCalculatedTimes] = useState<{ [key: string]: { startTime: string, endTime: string }[] }>({});
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


    useEffect(()=>{
      if(Object.keys(travelTimes).length >0){
          const newCalculatedTimes: { [key: string]: { startTime: string, endTime: string }[] } = {};
          dateRange.forEach((date) => {
            newCalculatedTimes[date.date] = calculateTimes(date);
          });
          setCalculatedTimes(newCalculatedTimes);
      }
    },[travelTimes])

  
        const calculateTimes = (date: DateRangeItem) => {
          if (Object.keys(travelTimes).length === 0) {
            return [];
          }
        let currentTime = date.startTime;
        const times :{ startTime: string, endTime: string }[] = [];
        let currentDate=date.date
        date.attractions.forEach((attraction:Attraction, index:number) => {
                let startTime = currentTime; 
                let endTime = addMinutes(startTime, attraction.stayDuration);
                if (index < date.attractions.length - 1) {
                  if(travelTimes[currentDate] && travelTimes[currentDate][index]){
                      let drivetime = parseInt(travelTimes[currentDate][index].split(" ")[0]);
                      currentTime = addMinutes(endTime, drivetime); 
                  }
                    
                }
                times.push({ startTime, endTime }); 
              
            });
        return(times);
        
      };
   



    



    
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
      
      setRecord((preRecord:any)=>({
        ...preRecord,
        dateRange:updatedDateRange
      }))


    }

    return(
        <div style={{flex: 2,overflowY: 'auto',height:"calc(100vh - 66.5px)" }}>
            <div style={{width:'100%'}}>
                <div style={{fontSize:'35px',fontWeight:700,margin:'20PX'}}>{name}</div>
                <div style={{fontSize:'20px',fontWeight:700,margin:'20PX'}}>{startdate} ~ {enddate}</div>
                <div style={{display:'flex',marginTop:'20PX',width:'100%',justifyContent:'space-between',height:'50px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'}}>
                    <div style={{width:'40px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',fontSize:'30px',textAlign:'center',paddingTop:'5PX',color:'#ea9999ff'}} onClick={listLeft}>&lt;</div>
                    <div style={{ width: 'calc(100% - 80px)',display: 'flex',overflow: 'hidden'}} ref={myRef}>
                        {dateRange.map((date, index:number) => (
                        <div key={index} 
                            className={styles.date_bar}
                            onClick={()=>getdate(index)}>
                            {date.date}
                            <div style={{color:'#666666ff',fontWeight:'400',fontSize:'14PX'}} >第{index+1}天</div>
                        </div>
                        ))}
                    </div>
                    <div style={{width:'40px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',fontSize:'30px',textAlign:'center',paddingTop:'5PX',color:'#ea9999ff'}} onClick={listRight}>&gt;</div>
                </div>
            </div>
            <div style={{backgroundColor:'#efefefff',paddingTop:'20PX',paddingBottom:'40px'}}> 
                {dateRange.map((date,dateindex)=>{
                   const times = calculateTimes(date);
                    return(
                    <React.Fragment key={dateindex} >
                        
                        <div style={{display:'flex',margin:'35px 10px'}}>
                            <div 
                                style={{width:'65px',backgroundColor:colors[dateindex % colors.length],marginLeft:'10px',height:'30px',fontSize:'20px',padding:'5px',borderRadius:'6px',fontWeight:'600',color:'white', alignItems:'center',textAlign:'center'}}
                                ref={el => {dateRef.current[dateindex] = el}}>  
                                第{dateindex+1}天
                            </div>

                            <div style={{height:'30px',display: 'flex', alignItems:'center',justifyItems:'center',margin:'5px',width:'130px'}}>
                              <span>出發時間：</span>
                              <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={()=>{setshowModal(true),setCurrentDateIndex(dateindex)}}>{dateRange[dateindex].startTime}</span>
                              {
                                showModal && <TimeComponent dateRange={dateRange} currentDateIndex={currentDateIndex} setDateRange={setDateRange} setshowModal={setshowModal} ></TimeComponent>
                              }
                            </div>
                            
                            <p style={{height:'30px',display: 'flex', alignItems:'center',justifyItems:'center',margin:'5px',marginLeft:'45%'}}>
                              {date.date}
                            </p>
                        </div>
                        
                        {date.attractions && date.attractions.length > 0 && (
                            date.attractions.map((attraction, attractionindex) => {
                              
                                return(
                                  <React.Fragment key={attractionindex}>
                                      <div  style={{width:'100%',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 -4px 6px rgba(0, 0, 0, 0.1)',backgroundColor:'white',height:'130px', display:'flex',justifyContent:'center',alignItems:'center'}}>
                                          <div style={{display:'flex',height:'80px',width:'95%'}}>
                                            <img style={{height:'80px',width:'80px',overflow:'hidden'}} src={attraction.picture}></img>

                                            <div style={{marginLeft:'10px',flexGrow: 1}}>
                                              <div style={{display:'flex',height:'20px',width:'180px'}}>
                                                  <div onClick={()=>{setAttractionIndex(attractionindex);setSelectedDateIndex(dateindex)}} style={{ alignSelf: 'flex-end',fontSize:'13px',textDecoration:'underline',fontWeight:'800',textUnderlineOffset: '3px',cursor:'pointer',color:'#d05b6eff'}}>
                                                    {Math.floor(attraction.stayDuration / 60)} 小時 {attraction.stayDuration % 60} 分鐘
                                                  </div>

                                                  <div style={{fontSize:'13px',marginLeft:'5PX', alignSelf: 'flex-end',color:'#666666ff'}}>|</div>

                                                  <div style={{fontSize:'13px',marginLeft:'5PX', alignSelf: 'flex-end',color:'#666666ff',fontWeight:'600'}}>
                                                  {times && times[attractionindex] ? `${times[attractionindex].startTime} - ${times[attractionindex].endTime}` : ""}
                                                  </div>
                                              </div>
                                              {
                                                AttractionIndex !== null && selectedDateIndex !== null && 
                                                (<DurationComponent  
                                                  selectedDateIndex={selectedDateIndex} 
                                                  dateRange={dateRange} 
                                                  setDateRange={setDateRange} 
                                                  AttractionIndex={AttractionIndex} 
                                                  setAttractionIndex={setAttractionIndex} 
                                                />) 
                                              }
                                              <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                                <div style={{fontSize:'17PX',fontWeight:'900',marginTop:'8PX',}}>
                                                  {attraction.name}
                                                </div>
                                              </div>
                                              <div style={{fontSize:'13px',marginTop:'3PX',color:'#6a6969ff',fontWeight:'500'}}>{attraction.address}</div>
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
                                  )
                            })  
                        )}
                        <div style={{margin:'30px 100px',width:'70px',height:'80px',display: 'grid', placeItems: 'center'}}>
                            <div style={{width: '50px',height: '50px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',borderRadius:' 50%',display: 'flex',alignItems: 'center',justifyContent: 'center',backgroundColor: 'white',cursor:'pointer',fontSize:'35px'}}
                          onClick={() => addplace(date.date)}>
                              +
                          </div> 
                          <div style={{marginTop:'10PX',fontWeight:'600',color:'#666666ff'}}>加入景點</div>
                        </div>
                    </React.Fragment>)
                })} 
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
            <APIProvider apiKey={`${apiKey}`} >
              <Map
                  style={{flex: 3,height:"calc(100vh - 66.5px)" }}
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
  
interface calculateTravelTimes{
  dateRange: DateRangeItem[];
  setTravelTimes:React.Dispatch<React.SetStateAction<{}>>
}

//交通時間
function useCalculateTravelTimes({dateRange,setTravelTimes}:calculateTravelTimes) {
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
  
  interface timecomponent{
    setshowModal:React.Dispatch<React.SetStateAction<boolean>>,
    dateRange:DateRangeItem[],
    setDateRange:React.Dispatch<React.SetStateAction<DateRangeItem[]>>,
    currentDateIndex:number|null
  }



  /* 出發時間輸入框*/
 const TimeComponent = ({setshowModal,dateRange,setDateRange,currentDateIndex}:timecomponent) => {
  const [period, setPeriod] = useState('AM');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);

  const handleSubmit = async() => {
    let adjustedHour = hour;
    let time
    if(period == 'PM'  && hour !== 12){
      adjustedHour+=12;
    }else if (period === 'PM' && hour === 12){
      adjustedHour-=12
    }
    time=`${adjustedHour === 0 ? '00' : adjustedHour}:${minute < 10 ? `0${minute}` : minute}`
    
    setshowModal(false)
    const url=window.location.href.split("/")
    let recordId=url[5];
    const recordRef = doc(db, "record", recordId); 
    let updatedDateRange = [...dateRange];
    
    setDateRange(updatedDateRange);
    if(currentDateIndex!==null){
        updatedDateRange[currentDateIndex].startTime = time;
        try {
          await updateDoc(recordRef, {
            dateRange: updatedDateRange
          });
      } catch (error) {
          console.error( error);
      }
    }
     



  };

  return (
    <div className={styles.dialog_background}>
        <div className={styles.dialog}>
          <div style={{marginBottom:'30PX'}}>出發時間：</div>

          <Select value={period} onChange={(value)=>{setPeriod(value)}} style={{ width: 80, marginRight: 8 }}>
            <Option value="AM">AM</Option>
            <Option value="PM">PM</Option>
          </Select>

          <Select value={hour} onChange={(value)=>{setHour(value);}} style={{ width: 80, marginRight: 8 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={i + 1}>{i + 1}</Option>
            ))}
          </Select>

          <Select value={minute} onChange={(value)=>{setMinute(value);}} style={{ width: 80, marginRight: 8 }}>
            {Array.from({ length: 60 }, (_, i) => (
              <Option key={i} value={i}>{i < 10 ? `0${i}` : i}</Option>
            ))}
          </Select>

          <div style={{marginTop:'40px',width:'250px',textAlign:'end'}}>
                    <button onClick={()=>{setshowModal(false)}} style={{ all: 'unset',color:'#666666',marginRight:'25px',fontSize:'17px',cursor:'pointer',}} >取消</button>
                    <button  onClick={ handleSubmit} style={{width:'50px',height:'30px',fontWeight:'500',fontSize:'17px',backgroundColor:'#ea9999ff',border:'0px',color:'white',borderRadius:'4px',cursor:'pointer'}}>完成</button>
          </div>
        </div>
    </div>
    
  );
  };

  interface durationcomponent{
    AttractionIndex:number,
    setAttractionIndex:React.Dispatch<React.SetStateAction<number | null>>,
    dateRange:DateRangeItem[],
    setDateRange:React.Dispatch<React.SetStateAction<DateRangeItem[]>>,
    selectedDateIndex: number 
  }


 const DurationComponent =({AttractionIndex,setAttractionIndex,dateRange,setDateRange,selectedDateIndex}:durationcomponent)=>{
  const [hour, setHour] = useState(1); 
  const [minute, setMinute] = useState(0);

  const handleDuration=async()=>{
   
    let Duration = hour*60+minute
    const url=window.location.href.split("/")
    let recordId=url[5];
    const recordRef = doc(db, "record", recordId); 
    let updatedDateRange = [...dateRange];
    dateRange[selectedDateIndex].attractions[AttractionIndex].stayDuration = Duration;
    setDateRange(updatedDateRange);
      try {
          await updateDoc(recordRef, {
            dateRange: updatedDateRange
          });
          setAttractionIndex(null)
      } catch (error) {
          console.error( error);
      }
      




  }
  
  return(
    <div className={styles.dialog_background}>
      <div className={styles.duration_dialog}>
        <div style={{ marginBottom: '30PX' }}>停留時間：</div>
        <Select value={hour} onChange={(value)=>setHour(value)} style={{ width: 150, marginRight: 8 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <Option key={i} value={i}>{i} 小時</Option>
          ))}
        </Select>

        <Select value={minute} onChange={(value)=>{setMinute(value);}} style={{ width: 150 }}>
          {Array.from({ length: 60 }, (_, i) => (
            <Option key={i} value={i}>{i} 分鐘</Option>
          ))}
        </Select>

        <div style={{ marginTop: '30px', width: '300px', textAlign: 'end' }}>
          <button onClick={()=>setAttractionIndex(null)} style={{ all: 'unset', color: '#666666', marginRight: '20px', fontSize: '17px', cursor: 'pointer' }}>取消</button>
          <button onClick={handleDuration} style={{ width: '50px', height: '30px', fontWeight: '500', fontSize: '17px', backgroundColor: '#ea9999ff', border: '0px', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>完成</button>
        </div>
      </div>
    </div>
  )
 }


 //計算景點時間
 const addMinutes = (time:string, minutes:number) => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};