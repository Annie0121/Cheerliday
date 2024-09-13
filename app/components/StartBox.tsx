"use client";
import styles from "../page.module.css";
import React, {  useState } from 'react'
import { auth } from "../firebase.js";
import Image from 'next/image';
import google from '../google.png'
import { signInWithPopup,GoogleAuthProvider } from "firebase/auth";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth";
import style from "../startbox.module.css"




interface setSignin{
    setSigninModel:React.Dispatch<React.SetStateAction<boolean>>
}
  
export default function StartBox({setSigninModel}:setSignin){
const [active,setactive]=useState('signin')
return(
    <div style={{width:'100%',height:'100%',position:'fixed',zIndex:1000,left:0,top:0}}>
        <div style={{height:'400px',width:'390px',backgroundColor:'#f3f3f3d5',zIndex:8, margin: '115px auto',borderRadius:'10px', display: 'flex', justifyContent: 'center', backdropFilter: 'blur(5px)'}}>
        
        <div style={{width:'80%',height:'70%'}}>
            <div style={{width:'100%',textAlign:'end',marginTop:'20px'}}>
            <span style={{fontSize:'25px',color:'#525252ff',cursor:'pointer'}} onClick={()=>{setSigninModel(false)}}>×</span>
            </div>
            <div style={{height:'60px',margin:'10px 0',width:'100%',display:'flex',textAlign:'center',alignContent:'center'}}>
            <div style={{fontSize:'30px',
                        fontWeight:'600',
                        color:active=="signin"?('#ff4757'):('#666666ff'),
                        width:'50%',
                        borderBottom:active=="signin"?('2px solid #ff4757'):('2px solid #aaaaaaff'),
                        cursor:'pointer',
                    }}
                    onClick={()=>setactive("signin")}
                    >登入
            </div>
            <div style={{fontSize:'30px',
                        fontWeight:'600',
                        color:active=="signup"?('#ff4757'):('#666666ff'),
                        width:'50%',
                        cursor:'pointer',
                        borderBottom:active=="signup"?('2px solid #ff4757'):('2px solid #aaaaaaff'),
                        }}
                        onClick={()=>setactive("signup")}
                        >註冊
            </div>

            </div>
            { active == "signin" ?(<Signin/>):(<Signup/>)}

            <div style={{width:'100%', display: 'flex',marginTop:'20px',justifyContent:'center',alignItems:'center'}}>
            <div style={{width:'45%',height:'0.5px',backgroundColor:'black'}}></div>
            <div style={{margin:'0 10%',fontSize:'18px'}}>或</div>
            <div style={{width:'45%',height:'0.5px',backgroundColor:'black'}} ></div>
            </div>
            
            <div style={{width:'100%',display: 'flex',justifyContent:'center',marginTop:'10px'}}>
                <Image src={google} alt="google" className={styles.google_image}  priority onClick={googleSignin} />
            </div>

        </div>
        
        </div>
    </div>
)
}

function Signin(){
const[email,setEmail]=useState('test@gmail.com')
const[password,setPassword]=useState('12345678')
const [user, setUser] = useState<string | null>(null);
const[errorMessage,setErrorMessage]=useState('')

const handelsignin=()=>{
        signInWithEmailAndPassword(auth,email,password)
        .catch((error) => {
        switch(error.code){
            case"auth/invalid-email" :
            setErrorMessage("信箱格式錯誤");
            break
            case "auth/missing-password":
            setErrorMessage("未輸入密碼");
            break
            case "auth/invalid-credential":
            setErrorMessage("信箱未註冊/密碼錯誤");
            break
        }
        setEmail('');
        setPassword('');  
    });
}


return(
    <>
        <input  className={style.signin_email}
                placeholder="請輸入電子信箱"
                value={email}
                onChange={(e)=>{setEmail(e.target.value)}}/>
            
            
        <input className={style.signin_password}
                placeholder="請輸入密碼"
                value={password}
                onChange={(e)=>{setPassword(e.target.value)}}
                type="password"
                />

        <div className={style.signin_button} 
             onClick={handelsignin}>登入</div>
            
    </>
)
}

function Signup(){
const[signUpemail,setsignUpEmail]=useState('')
const[password,setPassword]=useState('')
const[Message,setMessage]=useState('')

const handleSignUp=()=>{
    createUserWithEmailAndPassword(auth,signUpemail,password).then((res)=>{
        console.log(res);
        setsignUpEmail('');
        setPassword('');         
    })
    .catch((error)=>{
        switch(error.code){
            case"auth/missing-password" :
            setMessage("未輸入密碼");
            break
            case "auth/invalid-email":
            setMessage("信箱格式錯誤");
            break
            case "auth/missing-email":
            setMessage("未輸入信箱");
            break
            case "auth/weak-password":
            setMessage("密碼太弱");
            break
            case "auth/email-already-in-use":
            setMessage("信箱已註冊");
            break
        }
    setsignUpEmail('');
    setPassword('');        
    })
}





    return(
        <>
            <input  className={style.signup_email}
                    placeholder="請輸入電子信箱"
                    value={signUpemail}
                    onChange={(e)=>{setsignUpEmail(e.target.value)}}>
            </input>

            <input className={style.signup_password}
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e)=>{setPassword(e.target.value)}}>
            </input>

            <div className={style.signup_button} 
                 onClick={handleSignUp}>註冊
            </div>
            
        </>
    )
}


function googleSignin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
        console.log(error);
    });
}


