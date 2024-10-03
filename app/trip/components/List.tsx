"use client"
import { useState,useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { doc,collection, query, where,getDocs,deleteDoc, updateDoc } from "firebase/firestore"; 
import { db} from "../../firebase.js";
import styles from "../styles/list.module.css"
import { useUser } from '../../UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
interface ListProps {
    ShowPlan: (count: number) => void;
}

export default function List({ShowPlan}:ListProps){
    const [records, setRecords] = useState<any[]>([]);
    const { user, loading } = useUser();
    const router = useRouter();
    const [privacy, setPrivacy] = useState("");
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

    const changePrivacy=async(id:string,priority:string)=>{
        const newPrivacy = privacy === 'public' ? 'private' : 'public';
       
        setPrivacy(newPrivacy);
        try{
            const recordRef =doc(db,"record",id);
            await updateDoc(recordRef,{
                privacy: newPrivacy
            })
            setRecords(prevRecords => prevRecords.map(record => 
                record.id === id ? {...record, privacy: newPrivacy} : record
            ));
            
        }catch(error){
            console.log(error);
            
        }
    }
    return(
        <>
            <div className={styles.button_container} >
                <button className={styles.button} 
                        onClick={() => ShowPlan(records.length)} //點擊時，獲取當前數據長度
                >新增行程</button>     
            </div>
           
            <div className={styles.list_container} >
                {records.map((data,index)=>(
                    <div key={data.id} 
                         onClick={(e) => user && planUrl(user.uid, data.id)}  
                         className={styles.list_items} >
                      
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
                            
                            <div style={{position:'absolute',top:'5px',left:'10px'}} 
                                 onClick={(e)=>{e.stopPropagation(); 
                                                    e.preventDefault();
                                                    changePrivacy(data.id,data.privacy)}}>
                                <FontAwesomeIcon 
                                    icon={data.privacy === 'public' ? faUnlock : faLock} 
                                    size="sm" 
                                    className={styles.lock}
                                    
                                />
                            </div>

                        </div>

                        <div className={styles.list_items_text}  >
                            <div className={styles.list_items_text_name} >
                                <span>{data.name}</span>
                                
                               
                            </div>
                            <div className={styles.list_items_text_date} >{data.startdate} - {data.enddate}</div>
                        </div>
                    </div>
                ))}
                
            </div>
           
        </>
        
    )
}
