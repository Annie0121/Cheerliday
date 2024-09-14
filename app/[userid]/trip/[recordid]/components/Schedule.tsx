
import React, { useEffect, useState ,useRef} from 'react';
import{getDurationTime} from '../utils/getDurationTime'
import { db, auth } from '@/app/firebase';
import { doc, updateDoc } from "firebase/firestore"; 
import styles from '../recordid.module.css';
import Image from 'next/image';
import {TimeComponent} from '../components/TimeComponent'
import{ DurationComponent  } from '../components/DurationComponent';
import carImage from '../car.png'
import style from "../styles/schedule.module.css"



const colors=['#d05b6eff ',"#45818eff","#c1683cff","#a64d79ff","#a28c37ff","#8075b5ff","#6aa84fff"]



interface Attraction {
    coordinates: Coordinates;
    name: string;
    address:string,
    picture:string,
    stayDuration: number
}

interface Schedule{
    record:Record,
    setSelectedDay:React.Dispatch<React.SetStateAction<string>>,
    travelTimes: { [key: string]: string };
    setRecord:React.Dispatch<any>
}

interface DateRangeItem {
    date: string;
    startTime:string;
    attractions: Attraction[];
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

interface Coordinates {
    lat: number;
    lng: number;
}

export function Schedule({record,setSelectedDay,travelTimes,setRecord,}:Schedule){
    const [name, setname] = useState(record ? record.name : "");
    const[startdate,setstartdate]=useState(record ? record.startdate : "");
    const[enddate,setenddate]=useState(record ? record.enddate : "");
    const [dateRange, setDateRange] = useState(record ? record.dateRange :[]);
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
                    let endTime = getDurationTime(startTime, attraction.stayDuration);
                    if (index < date.attractions.length - 1) {
                      if(travelTimes[currentDate] && travelTimes[currentDate][index]){
                          let drivetime = getTotalTime(travelTimes[currentDate][index])
                          currentTime = getDurationTime(endTime, drivetime); 
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
        <div >
            <div style={{width:'100%'}}>
              <div className={style.schedule_info} style={{ backgroundImage: `url('/background/${record.backgroundImage}')` }}>
                <div className={style.schedule_info_background} ></div>
                <div className={style.schedule_info_name} >{name}</div>
                <div className={style.schedule_info_date} >{startdate} ~ {enddate}</div>
              </div>
                <div style={{display:'flex',width:'100%',justifyContent:'space-between',height:'50px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'}}>
                    <div style={{width:'40px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',fontSize:'30px',textAlign:'center',paddingTop:'5PX',color:'#ff4757',cursor:'pointer'}} onClick={listLeft}>&lt;</div>
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
                    <div style={{width:'40px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',fontSize:'30px',textAlign:'center',paddingTop:'5PX',color:'#ff4757',cursor:'pointer'}} onClick={listRight}>&gt;</div>
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
                            
                            <p style={{height:'30px',display: 'flex', alignItems:'center',justifyItems:'center',margin:'5px',marginLeft: 'auto' }}>
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
                                                  <div onClick={()=>{setAttractionIndex(attractionindex);setSelectedDateIndex(dateindex)}} style={{ alignSelf: 'flex-end',fontSize:'13px',textDecoration:'underline',fontWeight:'800',textUnderlineOffset: '3px',cursor:'pointer',color:'#7ab5d9ff'}}>
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
                                            <span style={{cursor:'pointer'}} onClick={()=>handleDel(attractionindex,dateindex)}>×</span>
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
                            <div style={{width: '50px',height: '50px',lineHeight:'50px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',borderRadius:' 50%',display: 'flex',alignItems: 'center',justifyContent: 'center',backgroundColor: 'white',cursor:'pointer',fontSize:'35px'}}
                                 onClick={() => addplace(date.date)}>
                                    ＋
                            </div> 
                          <div style={{marginTop:'10PX',fontWeight:'600',color:'#666666ff'}}>加入景點</div>
                        </div>
                    </React.Fragment>)
                })} 
            </div>
        </div>
    )
}



function getTotalTime(results:string){
 
    const timeUnit = results.split(" ")
    let totaltime = 0
    let minute 
    let hour 
    for(let i =0;i<timeUnit.length;i++){
  
      if(timeUnit[i]=='小時'){
        hour = parseInt(timeUnit[i-1])
        totaltime += hour*60;
      }else if(timeUnit[i] == "分鐘"){
        minute = parseInt(timeUnit[i-1])
        totaltime += minute
      }
    }
  
    return totaltime
    
  }