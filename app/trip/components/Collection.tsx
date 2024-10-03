

import { useState,useEffect} from 'react';
import { useRouter } from 'next/navigation'
import styles from '../styles/collection.module.css';
import { Row, Col } from 'antd';
import Image from 'next/image';

import {collection, query, where,onSnapshot } from "firebase/firestore"; 
import { db} from "../../firebase";


export default function Collection(){
    const [records, setRecords] = useState<any[]>([]);
    const router = useRouter();
    useEffect(() => {
        //獲取公開行程
        const q = query(collection(db, "record"),where("privacy", "==", "public"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userRecords: any[] = [];
            querySnapshot.forEach((doc) => {
                userRecords.push({ id: doc.id,...doc.data() });
            });
            setRecords(userRecords);
           
            
        });

        
        return () => unsubscribe();
    }, []); 

    //點擊導向該行程
    const geturl =(userid:string,recordid:string)=>{
        router.push(`/${userid}/trip/${recordid}`)
        
        
    }

    return (
       
        <div className={styles.collection_container} >
            <Row gutter={[20, 20]}>   
             {
                records && records.map((record,index)=>(
                    <Col xs={24} md={12} lg={12}  >
                        <div className={styles.collection_container_list}
                             onClick={()=>{geturl(record.userid,record.id)}}>
                            
                            <Col lg={8} md={10} sm={10} xs={24} className={styles.collection_container_info_piccontanier} >
                                <Image 
                                    src={`/background/${record.backgroundImage}`} 
                                    alt="行程圖片"
                                    fill
                                    className={styles.collection_container_info_pic}
                                    
                                    
                                />
                            </Col>
                            
                            <Col lg={16} md={14} sm={14} xs={24} className={styles.collection_container_info_infocontanier}>
                                <div className={styles.collection_container_info} >
                                    <div className={styles.collection_container_info_name} >{record.name}</div>
                                    <div className={styles.collection_container_info_date} >{record.startdate} - {record.enddate}</div>
                                    <div style={{display:'flex',justifyContent:"space-between",marginTop:'20px'}} >
                                        <div style={{display:'flex',alignItems:'center'}} >
                                            <Image className={styles.collection_container_info_citypic} alt='城市' src={'/location.png'}  height={18} width={14}></Image>
                                            <span className={styles.collection_container_info_city}  >{record.cityname}</span>
                                        </div>
                                        <div className={styles.collection_container_info_authorName} >作者: {record.authorName}</div>
                                    </div>

                                </div>
                            </Col>
                            
                            
                        </div>
                    </Col>

                    ))
                }
               

               
            </Row>
        </div>
    );
}