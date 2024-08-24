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



export default function Home() {
    
    const [plan, setPlan] = useState(false);
    const ShowPlan=()=>{
        setPlan(true)
    }
    const ClosePlan = () => {
        setPlan(false);
      };

    return (
        <>
            
                <Title></Title>
                <List ShowPlan={ShowPlan}></List>
                {plan && <Plan onClose={ClosePlan} />}
           
        </>
     
  
    );
  }
  


function Title(){
    return(
        <>
            <div style={{fontSize:'28px',margin:'40px auto',width:'90%',textAlign:'center'}}>我的行程總覽</div>
            <hr style={{width:'90%',margin:"20px auto"}}></hr>
        </>
        
    )
}



interface ListProps {
    ShowPlan: () => void;
}


function List({ShowPlan}:ListProps){
    const [user, setUser] = useState<any>(null);
    const[isLoaded,setIsLoaded]=useState(false)
    const [records, setRecords] = useState<any[]>([]);
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
            <div style={{margin:'20px auto',width:'1080px',textAlign:'end'}}>
                <button style={{width:'100px',height:'40px',marginRight:'10px'}} onClick={ShowPlan}>新增行程</button>     
            </div>
           
            <div style={{width:'1080px',margin:'20px auto',display:'flex',flexWrap:'wrap'}}>
                {records.map((data,index)=>(
                    <div key={data.id} onClick={() => planUrl(user.uid, data.id)} style={{width:'250px',height:'200px',margin: '10px',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'}}>
                        <div style={{height:'120px',backgroundColor:'pink',display:'flex',justifyContent:'space-between'}}>圖片
                            <div style={{backgroundColor:'white',height:'20px',width:'20px',fontSize:'15px',marginTop:'5PX',display: 'flex', alignItems: 'center', justifyContent: 'center',marginRight:'10px',borderRadius:'50%'}} 
                                 onClick={(e) => { e.stopPropagation(); handleDel(data.id); }}>×
                            </div>
                        </div>
                        <div>
                            <div style={{margin:'10px 10px',fontSize:'18px',fontWeight:700}}>{data.name}</div>
                            <div style={{margin:'10px 10px',fontSize:'16px',fontWeight:500}}>{data.startdate} - {data.enddate}</div>
                        </div>
                    </div>
                ))}
                
                

                
            
            </div>
        </>
        
    )
}

interface PlanProps {
    onClose: () => void;
}

function Plan({onClose}:PlanProps){
    
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
           
        } 
        if (!city) {
            setShowCityError(true);
            
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
          
          
          
          const docRef = await addDoc(collection(db, 'record'), {
            userid,
            name,
            coordinates: citycoordinates.coordinates, 
            countryCode: citycoordinates.countryCode,
            startdate,
            enddate,
            dateRange
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
    attractions: any[]; // 根據你的需求，可以更改為具體的類型
}

const generateDateRange = (start: dayjs.Dayjs|null, end: dayjs.Dayjs|null): DateRangeItem[] => {
    const dateRange = [];
    let currentDate = dayjs(start);
    const endDate = dayjs(end);
  
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      dateRange.push({ date: currentDate.format('MM月DD日'), attractions: [] });
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

