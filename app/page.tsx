"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react'
import { auth } from "./firebase.js";
import { onAuthStateChanged} from "firebase/auth";
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
      <div className={styles.container}>
        <Image src={homeImage} alt="封面圖片" className={styles.container_image}  priority >
          
        </Image>
        <div className={styles.container_text} >
          <p className={styles.animatedText} > 規劃無界，打造您的夢想行程</p>
        </div>
        
      </div>
       
    </>
  );
}


