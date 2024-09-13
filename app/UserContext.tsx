import React from "react";
import { createContext,useEffect,useState,useContext } from 'react';
import { getAuth, onAuthStateChanged,User } from "firebase/auth";
import { useRouter, } from 'next/navigation'

interface userContext{
    user:User|null;
    loading: boolean;

}

const UserContext = createContext<userContext>({user:null,loading:true});

export const UserProvider:React.FC<{ children: React.ReactNode }>=({children})=>{
    const [user, setUser] = useState<User | null>(null);
    const[loading,setLoading] =useState(true)
    const router = useRouter();
    const auth = getAuth();

    useEffect(()=>{
        const  unsubscribe = onAuthStateChanged(auth,(currentUser)=>{
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                router.push('/trip');
              }else{
                router.push('/');
              }
            
            
          
        })
        return () => unsubscribe();
      },[auth, router,user])

    return(
        <UserContext.Provider value={{user,loading}}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser =()=> useContext(UserContext)