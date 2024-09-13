"use client"
import React, {  useState } from 'react';
import { doc, updateDoc } from "firebase/firestore"; 
import { db, } from '@/app/firebase';
import styles from '../recordid.module.css';
import { Select } from 'antd';
const { Option } = Select;

interface Coordinates {
    lat: number;
    lng: number;
}

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

interface timecomponent{
    setshowModal:React.Dispatch<React.SetStateAction<boolean>>,
    dateRange:DateRangeItem[],
    setDateRange:React.Dispatch<React.SetStateAction<DateRangeItem[]>>,
    currentDateIndex:number|null
  }


export const TimeComponent = ({setshowModal,dateRange,setDateRange,currentDateIndex}:timecomponent) => {
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
            <div style={{marginBottom:'30PX',fontSize:'18px',fontWeight:'600',letterSpacing:'2px',color:'#6fb6e1ff'}}>出發時間：</div>
  
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
                      <button  onClick={ handleSubmit} style={{width:'50px',height:'30px',fontWeight:'500',fontSize:'17px',backgroundColor:'#ff4757',border:'0px',color:'white',borderRadius:'4px',cursor:'pointer'}}>完成</button>
            </div>
          </div>
      </div>
      
    );
    };