"use client"; 
//import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useRouter,usePathname, } from 'next/navigation'
import { signOut} from "firebase/auth";
import { auth } from "./firebase.js"
const inter = Inter({ subsets: ["latin"] });
import Image from 'next/image';
import { useUser,UserProvider, } from './UserContext';
import { useState,useEffect} from "react";

interface signinmodel{
  setSigninModel:(value:boolean)=>void
}

function Header({setSigninModel}:signinmodel ) {
  const router = useRouter();
  const pathname = usePathname();
 
  const { user, loading } = useUser();
  const specialRoute = /^\/trip+$/.test(pathname);
 const [provider,setProvider]=useState("")
 const[useremail,setUserEmail]=useState('')

  
  useEffect(() => {
    if (user) {
      setProvider(user.providerData[0]?.providerId || '');
      setUserEmail(user.email || '');
    }
  }, [user]);
  
  function handleSignOut() {
    signOut(auth).catch((error) => {
      //console.log(error);
    });
  }



  function handleSignin() {
    setSigninModel(true)
 
 
  }

  if (loading ||!user) return;

 
  
  return (
    <>
 

      
      <div className="header">
            <div className={`header_name ${specialRoute ? 'specialRoute' : ''}`} onClick={() => { router.push('/trip'); }}>
              Cheerliday
            </div>
  
            <div className="header_info">
              {
                provider == 'google.com' ?(
                  <>
                    <div className="header_userpic"  style={{ backgroundImage: `url(${user.photoURL})` }}></div>
                    <div className="header_username">{user.displayName}，你好！</div>
                  </>
                  
                ):(
                  <>
                    <div  className="header_userpic" style={{ backgroundImage: `url(/user.png)` }}></div>
                    <div className="header_username">{useremail.split('@')[0]}，你好！</div>
                  </>
                  
                  
                ) 
              }
              

              <div className="header_pic" onClick={handleSignOut}>
                <Image src="/logout.png" alt="登出" width={20} height={20} className="header_img" />
                <div>登出</div>
              </div>
            </div>
            
            
          </div>
    </>
   
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  const pathname = usePathname(); // 取得當前路徑
  const isHomePage = pathname === '/'; 
  const [signinModel,setSigninModel] = useState(false)
  return (
    <html lang="en">
      <UserProvider>
        <body className={inter.className}>
        {!isHomePage && <Header setSigninModel={setSigninModel} />}
        <main>{children}</main>
        </body>
      </UserProvider>
    </html>
  );
}



