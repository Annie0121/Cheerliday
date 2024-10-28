"use client"
import { db,  } from '@/app/firebase';
import React, { useEffect, useState } from 'react';
import {collection,  onSnapshot , query, where, } from "firebase/firestore"; 
import styles from './recordid.module.css';
import Image from 'next/image';
import { SearchPlace} from './components/SearchPlace'
import { Mymap}from "./components/Mymap"
import{ Schedule} from "./components/Schedule"
import mapimg from "./map.png"
import { useUser } from '@/app/UserContext';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const colors=['#d05b6eff ',"#45818eff","#c1683cff","#a64d79ff","#a28c37ff","#8075b5ff","#6aa84fff"]
export default function Home(){
   
    const [record, setRecord] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedDay, setSelectedDay] = useState("");
    const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number } | null>(null);
    const [travelTimes, setTravelTimes] = useState({});
    const [isMobile, setIsMobile] = useState(false)
    const [activeView, setActiveView] = useState(false);
    const { user, loading } = useUser();
    const [isAuthor, setIsAuthor] = useState(false);

    //確認用戶登入狀態
    
    useEffect(()=>{
      if(user){
        const url=window.location.href.split("/")
        const authorId = url[3];
        const recordId=url[5];
        if(!loading){
          setIsAuthor(user.uid === authorId);
          fetchUserData(authorId,recordId);
        }
      }
    },[user,loading])


    useEffect(() => {
      setIsMobile(window.innerWidth <= 1000);
    }, []);

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
        return <Loading></Loading>;
    }
    
   

    return(
      
      <div className={styles.container} >
        {
          !isLoaded && (
            <Loading></Loading>
          )
        }
        

        <div className={styles.content_container}>
              <div className={`${styles.schedule} ${isMobile && activeView  ? styles.hidden:"" } `}>
                  {selectedDay?
                    (< SearchPlace 
                        record={record} 
                        setSelectedDay={setSelectedDay} 
                        selectedDay={selectedDay} 
                        setSearchMarker={setSearchMarker}
                        
                      ></SearchPlace>)

                    :<Schedule 
                        setSelectedDay={setSelectedDay} 
                        record={record} 
                        travelTimes={travelTimes} 
                        setRecord={setRecord}
                        isAuthor={isAuthor}
                      ></Schedule>}
              </div>
                

              <div className={`${styles.map} ${isMobile && !activeView  ? styles.hidden:"" } `} >
                <Mymap 
                    record={record} 
                    searchMarker={searchMarker} 
                    setTravelTimes={setTravelTimes}
                    
                ></Mymap> 
              </div>
        </div>
        <footer className={styles.footer} >
          <div style={{textAlign: 'center',height:'50px',width:'80px',marginRight:'10px'}}>
            <Image style={{marginTop:'5PX'}} src={mapimg} height={30} width={30} alt='地圖'  onClick={()=>{setActiveView(!activeView)}}></Image>
            {activeView==true?(
              <div style={{fontSize:'13px', color:'#666666ff', fontWeight:'600'}}>顯示行程</div>
            ):(<div style={{fontSize:'13px', color:'#666666ff',fontWeight:'600'}}>顯示地圖</div>)}
            
          </div>
          
        </footer>
      </div>
 
    )
}

const Loading =()=>{
return(
            <div style={{height:'100%',width:'100%',backgroundColor:'#000000ad',zIndex:1000, position: 'fixed',color:'white'}} >
              <div className={styles.loading} >
                  <span>L</span>
                  <span>O</span>
                  <span>A</span>
                  <span>D</span>
                  <span>I</span>
                  <span>N</span>
                  <span>G</span>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
              </div>
          </div>
)
}
