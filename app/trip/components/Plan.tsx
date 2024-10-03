"use client"
import { useRouter } from 'next/navigation'
import styles from '../styles/plan.module.css';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import{ generateDateRange } from '../utils/generateDateRange'
import { getCoordinates } from '../utils/getCoordinates';
import { auth ,db} from "../../firebase.js";
import { collection, addDoc} from "firebase/firestore"; 
import { User } from 'firebase/auth';
import dayjs from 'dayjs';



/*
const { RangePicker } = DatePicker;
import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';*/


interface PlanProps {
    user: User | null;
    onClose: () => void;
    recordCount:number
}

interface DateRangeItem {
    date: string;
    startTime:string;
    attractions: any[]; 
    
}

export function Plan({user,onClose, recordCount}:PlanProps){
    const router = useRouter();
    const[name,setName]=useState("")
    const[city,setCity]=useState('')
    const [dateRange, setDateRange] = useState<DateRangeItem[]>([]);
    const [startdate, setStartDate] = useState<Date | null>(null);
    const [enddate, setEndDate] = useState<Date | null>(null);
    const [showNameError, setShowNameError] = useState(false);
    const [showCityError, setShowCityError] = useState("");
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [ authorName,setauthorName] = useState("")

    const handleChange = (dates: [Date |null, Date |null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
       
        
        if (start && end) {
            console.log(start,end);
            const allDates = generateDateRange(dayjs(start), dayjs(end));
            console.log(allDates);
            setDateRange(allDates);
        }
    }   


    async function getPlan() {
        if (!name) {
            setShowNameError(true);
            return;
        } 
        if (!city) {
            setShowCityError("請輸入城市名稱");
            return;
        }
        try {
          const { coordinates, countryCode, cityname } = await getCoordinates(city);
          const formattedStartDate = startdate ? startdate.toISOString().split('T')[0] : null;
          const formattedEndDate = enddate ? enddate.toISOString().split('T')[0] : null;
          if (!user) {
            throw new Error('用戶未登錄');
          }
          const authorName = user.providerData[0]?.providerId === "google.com"
          ? user.displayName!
          : user.email!.split('@')[0];
          setauthorName(authorName);
       
          const userid = user.uid;
          const backgroundImage = `${(recordCount % 8)+1 }.jpg`;
          const docRef = await addDoc(collection(db, 'record'), {
            userid,
            name,
            coordinates: coordinates, 
            countryCode: countryCode,
            startdate:formattedStartDate,
            enddate:formattedEndDate,
            dateRange,
            backgroundImage,
            cityname:cityname,
            privacy:"private",
            authorName:authorName
            
            
          });
          
          const recordid =docRef.id
          router.push(`/${userid}/trip/${recordid}`)
          
        }catch(error) {
            setShowCityError("請輸入正確城市名稱");
          console.error(error);
          
        }
    }


    return(
        <div className={styles.plan_background}>
            <div className={styles.plan}>
                <div >
                    <div className={styles.plan_name} >旅遊名稱：</div>
                    <input 
                        className={styles.plan_name_input}
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        placeholder="新的行程"
                    ></input>
                    {showNameError &&(<div className={styles.plan_error} >請輸入行程名稱</div>)}
                    
                </div>

                <div>
                    <div className={styles.plan_date}>日期：</div>
                    <DatePicker
                        selectsRange={true}
                        selected={startdate}
                        onChange={handleChange}
                        startDate={startdate ||undefined}
                        endDate={enddate||undefined}
                        className={styles.dateinput }
                        dateFormat="yyyy/MM/dd"
                        placeholderText='出發日期    →     結束日期'
                        withPortal
                        portalId="root-portal"
                        monthsShown={windowWidth >= 800 ? 2 : 1}

                    />
                    
                </div>

                <div>
                    <div className={styles.plan_destination} >目的地：</div>
                    <input 
                        className={styles.plan_destination_input}
                        value={city}
                        placeholder="輸入城市"
                        onChange={(e)=>setCity(e.target.value)}
                    ></input>
                    {showCityError&& (<div className={styles.plan_error} >{showCityError}</div>)}
                    
                </div>
                <div className={styles.plan_button}>
                    <button className={styles.plan_button_cancel} onClick={onClose}>取消</button>
                    <button onClick={getPlan} className={styles.plan_button_confirm} >完成</button>
                </div>
            </div>
        </div>
        
    )
}

