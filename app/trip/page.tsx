"use client"
import styles from './trip.module.css';
import { useState,useEffect } from 'react';
import { DatePicker } from 'antd';
import { auth ,db} from "../firebase.js";
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs ,{ Dayjs } from 'dayjs';
import {onAuthStateChanged, User} from "firebase/auth"
import { doc, setDoc,collection, addDoc,getDoc, onSnapshot , query, where,getDocs,deleteDoc } from "firebase/firestore"; 
import { log } from 'console';
const { RangePicker } = DatePicker;
import { useRouter } from 'next/navigation'

import Image from 'next/image';

type ShowPlanFunction = (count: number) => void;
export default function Home() {
    const [recordCount, setRecordCount] = useState(0);
    const [plan, setPlan] = useState(false);
    const ShowPlan: ShowPlanFunction = (count: number)=>{
        setRecordCount(count);
        setPlan(true)
    }
    const ClosePlan = () => {
        setPlan(false);
      };

    return (
        <div style={{ backgroundColor: '#eeeeeeff',boxSizing: 'border-box',overflowY:'auto',height:'100vh',paddingTop:'60PX' }}>
            
                <Title></Title>
                <List ShowPlan={ShowPlan}></List>
                {plan && <Plan onClose={ClosePlan} recordCount={recordCount} />}
           
        </div>
     
  
    );
  }
  


function Title(){
    return(
        <>
            <div style={{fontSize:'28px',margin:'40px auto 10px auto',width:'1080px',color:'#525151ff',fontWeight:'600'}}>我的行程</div>
            <hr style={{width:'1080px',margin:"0 auto",border: '1px solid #a7a6a6ff'}}></hr>
        </>
        
    )
}


interface ListProps {
    ShowPlan: (count: number) => void;
}

function List({ShowPlan}:ListProps){
    const [user, setUser] = useState<any>(null);
    const[isLoaded,setIsLoaded]=useState(false)
    const [records, setRecords] = useState<any[]>([]);
    console.log(records);
    
    const fetchUserData = async(userId: string) => {
        const q = query(collection(db, "record"), where("userid", "==", userId))
        try {
          //抓取數據
          const querySnapshot = await getDocs(q);
          const userRecords: any[] = [];
          querySnapshot.forEach((doc) => {
            userRecords.push({ id: doc.id, ...doc.data() });
          });
          setRecords(userRecords)
          
          
        } catch (error) {
          console.error( error);
        }   
    }
    
    const router = useRouter();
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                
                fetchUserData(user.uid)
                setUser(user);
            } else {
                setUser(null);
                router.push('/')

            }
            setIsLoaded(true);
        });
        return () => unsubscribe();
    }, [user,isLoaded]);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }
    
    
    const planUrl= (userid: string, recordid: string)=>{
        window.location.href = `/${userid}/trip/${recordid}`;
        router.push(`/${userid}/trip/${recordid}`)

    }
    const handleDel=(id:string)=>{
        console.log(id);
        try {
            deleteDoc(doc(db, "record", id));
            setRecords(records.filter((item) => item.id !== id));
          } catch (error) {
            console.error(error);
          }
    
        
    }

    return(
        <>
            <div style={{margin:'20px auto 0 auto',width:'1080px',textAlign:'end'}}>
                <button style={{width:'120px',height:'45px',marginRight:'10px',borderRadius:'5px',backgroundColor:'#ea9999ff',border: '2px solid #ea9999ff',fontSize:'18px',fontWeight:'600',color:'white',cursor:'pointer'}} onClick={() => ShowPlan(records.length)}>+ 新增行程</button>     
            </div>
           
            <div style={{width:'1080px',margin:'20px auto',display:'flex',flexWrap:'wrap'}}>
                {records.map((data,index)=>(
                    <div key={data.id} onClick={() => planUrl(user.uid, data.id)} style={{width:'250px',height:'200px',margin: '10px',boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)',borderRadius:'10px',cursor:'pointer'}}>
                        {/*
                        <div style={{height:'120px', display:'flex',justifyContent:'flex-end', backgroundImage: `url('/background/${records[index].backgroundImage}')`,backgroundSize: 'cover',borderTopLeftRadius: '10px', borderTopRightRadius: '10px',backgroundPosition: 'center '}}>
                            <div style={{backgroundColor:'white',height:'20px',width:'20px',fontSize:'16px',marginTop:'5PX',display: 'flex', alignItems: 'center', justifyContent: 'center',marginRight:'10px',borderRadius:'50%'}} 
                                 onClick={(e) => { e.stopPropagation(); handleDel(data.id); }}>×
                            </div>
                        </div>
                            
                         */}
                        <div style={{height:'120px',display:'flex',justifyContent:'flex-end', position: 'relative'}}>
                            <Image 
                                src={`/background/${records[index].backgroundImage}`}
                                alt="行程圖片"
                                layout='fill'
                                style={{objectFit:'cover',zIndex:'0',borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} 
                                priority
                                />
                            <div style={{backgroundColor:'white',height:'20px',width:'20px',lineHeight:'20px', fontSize:'18px',marginTop:'5PX',display: 'flex', alignItems: 'center', justifyContent: 'center',marginRight:'10px',borderRadius:'50%',zIndex:1}} 
                                 onClick={(e) => { e.stopPropagation(); handleDel(data.id); }}>×
                            </div>
                        </div>

                        <div style={{backgroundColor:'white',paddingTop:'5PX',paddingBottom:'5px',borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px'}} >
                            <div style={{margin:'10px 10px',fontSize:'19px',fontWeight:'900',color:'#4d4d4dff'}}>{data.name}</div>
                            <div style={{margin:'10px 10px',fontSize:'14px',fontWeight:'400',color:'#767474ff'}}>{data.startdate} - {data.enddate}</div>
                        </div>
                    </div>
                ))}
                
            </div>
           
        </>
        
    )
}

interface PlanProps {
    onClose: () => void;
    recordCount:number
}

function Plan({onClose, recordCount}:PlanProps){
    
    const[name,setName]=useState("")
    const[city,setCity]=useState('')
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [ countryCode,setCountryCode] =useState('')
    const [dateRange, setDateRange] = useState<DateRangeItem[]>([]);
    const [startdate,setstartdate]=useState('')
    const [enddate,setenddate]=useState('')
    const [showNameError, setShowNameError] = useState(false);
    const [showCityError, setShowCityError] = useState(false);
    const onChange:RangePickerProps['onChange'] = (dates, dateStrings) => {
      if (dates) {
        
        
        setstartdate(dateStrings[0])
        setenddate(dateStrings[1])
        const [start, end] = dates;
        const allDates = generateDateRange(start, end);
        setDateRange(allDates);
        
      } else {
        setDateRange([]);
        
      }
    };




    async function getPlan() {
        if (!name) {
            setShowNameError(true);
            return;
        } 
        if (!city) {
            setShowCityError(true);
            return;
        }
        try {
          const citycoordinates = await getCoordinates(city);
          console.log(citycoordinates.coordinates);
          console.log(citycoordinates.countryCode);
          
          const user = auth.currentUser;
          if (!user) {
            throw new Error('用戶未登錄');
          }
          const userid = user.uid;
          
          const backgroundImage = `${(recordCount % 8)+1 }.jpg`;
          console.log(backgroundImage);
          
          const docRef = await addDoc(collection(db, 'record'), {
            userid,
            name,
            coordinates: citycoordinates.coordinates, 
            countryCode: citycoordinates.countryCode,
            startdate,
            enddate,
            dateRange,
            backgroundImage 
          });
          
          const recordid =docRef.id
          window.location.href = `/${userid}/trip/${recordid}`;
          
        }catch(error) {
          console.error(error);
        }
    }


    return(
        <div className={styles.dialog_background}>
            <div className={styles.dialog}>
                <div>
                    <div style={{color:'#ea9999ff',fontSize:'18px'}}>旅遊名稱：</div>
                    <input 
                        style={{width:'300px',height:'25px',marginTop:'5px', border: '2px solid #cccccc'}}
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        placeholder="新的行程"
                    ></input>
                    {showNameError &&(<div style={{fontSize:'12px',marginLeft:'2px',color:'red'}}>請輸入行程名稱</div>)}
                    
                </div>

                <div>
                    <div style={{color:'#ea9999ff',marginTop:'20px',fontSize:'18px'}}>日期：</div>
                    <DateInput onChange={onChange} ></DateInput>
                    
                </div>

                <div>
                    <div style={{color:'#ea9999ff',marginTop:'20px',fontSize:'18px'}}>目的地：</div>
                    <input 
                        style={{width:'300px',height:'25px',marginTop:'5px', border: '2px solid #cccccc'}}
                        value={city}
                        placeholder="輸入城市"
                        onChange={(e)=>setCity(e.target.value)}
                    ></input>
                    {showCityError&&(<div style={{fontSize:'12px',marginLeft:'2px',color:'red'}}>請輸入目的地</div>)}
                    
                </div>
                <div style={{marginTop:'40px',width:'307px',textAlign:'end'}}>
                    <button style={{all: 'unset',color:'#666666',marginRight:'25px',fontSize:'17px'}} onClick={onClose}>取消</button>
                    <button onClick={getPlan} style={{fontSize:'17px',backgroundColor:'#ea9999ff',border:'0px',color:'white',borderRadius:'2px'}}>完成</button>
                </div>
            </div>
        </div>
        
    )
}

interface DateRangeItem {
    date: string;
    startTime:string;
    attractions: any[]; 
    
}

const generateDateRange = (start: dayjs.Dayjs|null, end: dayjs.Dayjs|null): DateRangeItem[] => {
    const dateRange = [];
    let currentDate = dayjs(start);
    const endDate = dayjs(end);
  
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      dateRange.push({ date: currentDate.format('M月D日'),startTime:"8:00", attractions: [] });
      currentDate = currentDate.add(1, 'day');
    }
  
    return dateRange;
};
  
interface DateInputProps {
    onChange:RangePickerProps['onChange'];
}
const DateInput:React.FC<DateInputProps> = ({ onChange }) => {
    return(
        <>
            <RangePicker onChange={onChange} className={styles.dateinput}/>
        </>
    )
}

//獲取城市經緯度
async function  getCoordinates(address:string) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
   
    const encodedCity = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedCity}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    const addressComponents = data.results[0].address_components;
    const location = data.results[0].geometry.location;
    
    let countryCode = "";
    for (let component of addressComponents) {
        if (component.types.includes("country")) {
        countryCode = component.short_name; 
        break;
        }
    }

    return {
        coordinates:{
            lat: location.lat,
            lng: location.lng,
        },
        countryCode: countryCode
    };
  }

