"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react'
import { auth } from "./firebase.js";
import { getAuth, signInWithPopup,createUserWithEmailAndPassword,signInWithEmailAndPassword ,onAuthStateChanged,GoogleAuthProvider} from "firebase/auth";
import Image from 'next/image';
import homeImage from './homepage.jpg';
export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.push('/trip'); // 導向 /trip 頁面
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <div style={{ position: 'relative',height: '100vh'}}>
        <Image src={homeImage} alt="封面圖片" style={{width:'100%',height:"calc(100vh - 65px)",objectPosition: '50% 65%',objectFit: 'cover',verticalAlign: 'middle',marginTop:'65px'}} priority >
          
        </Image>
        <div style={{position: 'absolute',top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
          <p className={styles.animatedText} style={{fontSize:'30PX',fontWeight:'700',color:'#E4E4E4',textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'}}> 規劃無界，打造您的夢想行程</p>
        </div>
        
      </div>
       
    </>
  );
}


