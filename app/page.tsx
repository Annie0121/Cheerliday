"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react'
import { auth } from "./firebase.js";
import { onAuthStateChanged} from "firebase/auth";
import Image from 'next/image';

import StartBox from "./components/StartBox";
export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [signinModel,setSigninModel] = useState(false)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        
        // router.push('/trip'); 導向 /trip 頁面
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router,user]);

  return (
    <>
      {signinModel &&(<StartBox setSigninModel={setSigninModel} ></StartBox>)}

      <div className={styles.container}>
          <Image src="/homepage.jpg" alt="封面圖片" className={styles.container_image} width={2800} height={1867} />
          
          <div className={styles.container_text} >
            <div className={styles.name} >Cheerliday</div>
            <div className={styles.animatedText} > 規劃無界，打造您的夢想行程</div>
            <button onClick={()=>{setSigninModel(true)}} className={styles.container_button} >開始旅程</button>
          </div>

      </div>
      
      
        
    
       
    </>
  );
}
