"use client"
import React, { useState } from 'react';
import { doc, updateDoc} from "firebase/firestore"; 
import { db, auth } from '@/app/firebase';
import styles from '../recordid.module.css';
import { Select, Button, Modal } from 'antd';
const { Option } = Select;
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

interface durationcomponent{
    AttractionIndex:number,
    setAttractionIndex:React.Dispatch<React.SetStateAction<number | null>>,
    dateRange:DateRangeItem[],
    setDateRange:React.Dispatch<React.SetStateAction<DateRangeItem[]>>,
    selectedDateIndex: number 
  }

export const DurationComponent =({AttractionIndex,setAttractionIndex,dateRange,setDateRange,selectedDateIndex}:durationcomponent)=>{
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
          <div style={{ marginBottom: '30PX',fontSize:'18px',fontWeight:'600',color:'#6fb6e1ff',letterSpacing:'2px' }}>停留時間：</div>
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
            <button onClick={handleDuration} style={{ width: '50px', height: '30px', fontWeight: '500', fontSize: '17px', backgroundColor: '#ff4757', border: '0px', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>完成</button>
          </div>
        </div>
      </div>
    )
   }
  