"use client"
import { useRouter } from 'next/navigation'
import styles from '../styles/plan.module.css';
import { useState } from 'react';
import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import{ generateDateRange } from '../utils/generateDateRange'
import { getCoordinates } from '../utils/getCoordinates';
import { auth ,db} from "../../firebase.js";
import { collection, addDoc} from "firebase/firestore"; 
const { RangePicker } = DatePicker;



interface PlanProps {
    onClose: () => void;
    recordCount:number
}

interface DateRangeItem {
    date: string;
    startTime:string;
    attractions: any[]; 
    
}

export function Plan({onClose, recordCount}:PlanProps){
    const router = useRouter();
    const[name,setName]=useState("")
    const[city,setCity]=useState('')
    const [dateRange, setDateRange] = useState<DateRangeItem[]>([]);
    const [startdate,setstartdate]=useState('')
    const [enddate,setenddate]=useState('')
    const [showNameError, setShowNameError] = useState(false);
    const [showCityError, setShowCityError] = useState("");
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
            setShowCityError("請輸入城市名稱");
            return;
        }
        try {
          const citycoordinates = await getCoordinates(city);
          const user = auth.currentUser;
          if (!user) {
            throw new Error('用戶未登錄');
          }
          const userid = user.uid;
          const backgroundImage = `${(recordCount % 8)+1 }.jpg`;
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
                    <DateInput onChange={onChange} ></DateInput>
                    
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

interface DateInputProps {
    onChange:RangePickerProps['onChange'];
}
const DateInput:React.FC<DateInputProps> = ({ onChange }) => {
    return(
        <>
            <RangePicker onChange={onChange} 
                         className={styles.dateinput} 
                         />
        </>
    )
}