"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react'
import { auth } from "./firebase.js";
import { getAuth, signInWithPopup,createUserWithEmailAndPassword,signInWithEmailAndPassword ,onAuthStateChanged,GoogleAuthProvider} from "firebase/auth";

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
      <div>首頁</div>
    </>
  );
}


