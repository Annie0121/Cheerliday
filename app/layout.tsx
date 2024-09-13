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
 console.log(user.photoURL);
 
  
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



function Signin(){
  return(
    <div style={{width:'100%',height:'100%',position:'fixed',zIndex:1000,left:0,top:0}}>
        <div style={{height:'400px',width:'390px',backgroundColor:'#ffffffdd',zIndex:8, margin: '145px auto',borderRadius:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center',backdropFilter: 'blur(5px)'}}>
          <div style={{width:'80%',height:'70%'}}>
            <input style={{borderRadius:'8px',height:'40px',width:'100%',border: 'none', outline: 'none', boxSizing: 'border-box'}} placeholder="請輸入電子信箱"></input>
            <input style={{borderRadius:'8px',height:'40px',width:'100%',marginTop:'20px',border: 'none', outline: 'none', boxSizing: 'border-box'}} placeholder="請輸入密碼"></input>
            <div style={{borderRadius:'8px',height:'40px',width:'100%',marginTop:'20px',backgroundColor:'#ea9999ff'}}>登入</div>

          </div>
          
        </div>
    </div>
  )
}