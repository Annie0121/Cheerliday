"use client"
import styles from './trip.module.css';
import { useState} from 'react';
import{ Plan }from "./components/Plan"
import List  from './components/List';
import { useUser } from '../UserContext';
import Collection from "./components/Collection"

type ShowPlanFunction = (count: number) => void;

export default function Home() {
    const [recordCount, setRecordCount] = useState(0);
    const [plan, setPlan] = useState(false);
    const [showList,setShowList]=useState(true)
    const { user} = useUser();
    const ShowPlan: ShowPlanFunction = (count: number)=>{
        setRecordCount(count);
        setPlan(true)
    }
    const ClosePlan = () => {
        setPlan(false);
      };

    return (
        <div className={styles.container} >
            
                <Title setShowList={setShowList} showList={showList}></Title>
                {showList?( <List ShowPlan={ShowPlan}></List>):(<Collection ></Collection>)}
               
                {plan && <Plan  user={user} onClose={ClosePlan} recordCount={recordCount} />}
           
        </div>
     
  
    );
  }
  
 
function Title({ setShowList ,showList}: { setShowList: React.Dispatch<React.SetStateAction<boolean>>,showList:boolean }){
    return(
        <>
            <div className={styles.title}  >
                <span onClick={()=>{setShowList(true)}} 
                      style={{cursor:'pointer',fontWeight:showList?800:600,fontSize:showList?"30px":"28px",color:showList?"#525151ff":"#6f6e6eff"}}>我的行程
                </span>
                <span onClick={()=>{setShowList(false)}} 
                      style={{marginLeft:'30px',cursor:'pointer' ,fontWeight:showList?600:800,fontSize:showList?"28px":"30px",color:showList?"#6f6e6eff":"#525151ff"}}>探索
                </span>
            </div>
            <hr className={styles.title_hr} ></hr>
        </>
        
    )
}

/*
function Collection(){
    const [records, setRecords] = useState<any[]>([]);
    const router = useRouter();
    useEffect(() => {
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

    const geturl =(userid:string,recordid:string)=>{
        router.push(`/${userid}/trip/${recordid}`)
        
        
    }

    return (
       
        <div className='' style={{ width: '1080px', margin: '20px auto' }}>
            <Row gutter={[20, 20]}>   
             {
                records && records.map((record,index)=>(
                    <Col xs={24} md={12} lg={12}  >
                        <div 
                             style={{  height: '150px', display: 'flex' ,backgroundColor:'white', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)',borderRadius:'5px',cursor:'pointer'}}
                             onClick={()=>{geturl(record.userid,record.id)}}>
                            
                            <Col xs={8} >
                                <Image 
                                    src={`/background/${record.backgroundImage}`} 
                                    alt="行程圖片"
                                    fill
                                    style={{ objectFit: 'cover',borderTopLeftRadius:'5px',borderBottomLeftRadius:'5px'}}
                                    
                                />
                            </Col>
                            
                            <Col xs={16} >
                                <div style={{margin:'20px 15px'}}>
                                    <div style={{fontSize:'25px',fontWeight:'700'}}>{record.name}</div>
                                    <div style={{fontSize:'18px',color:'#767474ff',marginTop:'10px'}}>{record.startdate} - {record.enddate}</div>
                                    <div style={{display:'flex',justifyContent:"space-between",marginTop:'20px'}} >
                                        <div style={{display:'flex',alignItems:'center'}} >
                                            <Image alt='城市' src={'/location.png'} height={18} width={14}></Image>
                                            <span style={{fontSize:'18px',marginLeft:'5px',fontWeight:'500',color:'#5f6666ff'}}>{record.cityname}</span>
                                        </div>
                                        <div style={{fontSize:'15px',marginRight:'15px',color:'#5f6666ff',fontWeight:'400'}}>作者: {record.authorName}</div>
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
}*/