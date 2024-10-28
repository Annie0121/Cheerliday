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
