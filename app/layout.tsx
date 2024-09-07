"use client"; 
//import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useRouter,usePathname } from 'next/navigation'
import { signOut,signInWithPopup,GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase.js"
const inter = Inter({ subsets: ["latin"] });
import Image from 'next/image';
import { useUser,UserProvider, } from './UserContext';



function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();
  const specialRoute = /^\/trip+$/.test(pathname);

  function handleSignOut() {
    signOut(auth).catch((error) => {
      console.log(error);
    });
  }

  function handleSignin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.log(error);
    });
  }

  if (loading) return null;

  return (
    <div className="header">
      <div className={`header_name ${specialRoute ? 'specialRoute' : ''}`} onClick={() => { router.push('/trip'); }}>
        Cheerliday
      </div>
      <div>
        {user ? (
          <div className="header_info">
            <div className="header_userpic" style={{ backgroundImage: `url(${user.photoURL})` }}></div>
            <div className="header_username">{user.displayName}，你好！</div>
            <div className="header_pic" onClick={handleSignOut}>
              <Image src="/logout.png" alt="登出" width={20} height={20} className="header_img" />
              <div>登出</div>
            </div>
          </div>
        ) : (
          <div className="header_member" onClick={handleSignin}>登入</div>
        )}
      </div>
    </div>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <UserProvider>
        <body className={inter.className}>
          <Header />
          <main>{children}</main>
        </body>
      </UserProvider>
    </html>
  );
}