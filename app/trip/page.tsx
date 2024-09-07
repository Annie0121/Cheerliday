"use client"
import styles from './trip.module.css';
import { useState} from 'react';
import{ Plan }from "./components/Plan"
import List  from './components/List';

type ShowPlanFunction = (count: number) => void;
export default function Home() {
    const [recordCount, setRecordCount] = useState(0);
    const [plan, setPlan] = useState(false);
    const ShowPlan: ShowPlanFunction = (count: number)=>{
        setRecordCount(count);
        setPlan(true)
    }
    const ClosePlan = () => {
        setPlan(false);
      };

    return (
        <div className={styles.container} >
            
                <Title></Title>
                <List ShowPlan={ShowPlan}></List>
                {plan && <Plan onClose={ClosePlan} recordCount={recordCount} />}
           
        </div>
     
  
    );
  }
  


function Title(){
    return(
        <>
            <div className={styles.title}  >我的行程</div>
            <hr className={styles.title_hr} ></hr>
        </>
        
    )
}
