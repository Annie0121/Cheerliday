"use client"
import { useState,useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { doc,collection, query, where,getDocs,deleteDoc } from "firebase/firestore"; 
import { db} from "../../firebase.js";
import styles from "../styles/list.module.css"
import { useUser } from '../../UserContext';

interface ListProps {
    ShowPlan: (count: number) => void;
}

export default function List({ShowPlan}:ListProps){
    const [records, setRecords] = useState<any[]>([]);
    const { user, loading } = useUser();
    const router = useRouter();
    
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

    useEffect(()=>{
        if(user){
            fetchUserData(user.uid)
        }
    }, [user, loading, router])

    if (loading ||!user) {
        return <div style={{margin:'100px auto',marginLeft:'200px'}} >loading</div>
           
    }
    
    
    const planUrl= (userid: string, recordid: string)=>{
        router.push(`/${userid}/trip/${recordid}`)
    }
    const handleDel=(id:string)=>{
        try {
            deleteDoc(doc(db, "record", id));
            setRecords(records.filter((item) => item.id !== id));
          } catch (error) {
            console.error(error);
          }
    
        
    }

    return(
        <>
            <div className={styles.button_container} >
                <button className={styles.button} 
                        onClick={() => ShowPlan(records.length)}
                >+ 新增行程</button>     
            </div>
           
            <div className={styles.list_container} >
                {records.map((data,index)=>(
                    <div key={data.id} onClick={() => user && planUrl(user.uid, data.id)}  className={styles.list_items} style={{}}>
                      
                        <div className={styles.list_items_pic} >
                            <Image 
                                src={`/background/${records[index].backgroundImage}`}
                                alt="行程圖片"
                                fill
                                className={styles.list_items_img} 
                                priority
                                />
                            <div className={styles.list_items_delete}
                                 onClick={(e) => { e.stopPropagation(); handleDel(data.id); }}>×
                            </div>
                        </div>

                        <div className={styles.list_items_text}  >
                            <div className={styles.list_items_text_name} >{data.name}</div>
                            <div className={styles.list_items_text_date} >{data.startdate} - {data.enddate}</div>
                        </div>
                    </div>
                ))}
                
            </div>
           
        </>
        
    )
}
