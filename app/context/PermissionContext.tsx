import React, { createContext,useState } from "react";

interface permissionContext{
    hasEditPermission:boolean;
    setHasEditPermission: React.Dispatch<React.SetStateAction<boolean>>;
    checkEditPermission: (recordId: string) => Promise<void>;
}

const PermissionContext= createContext<permissionContext|undefined>(undefined)

export const PremissionProvider:React.FC<{children:React.ReactNode}>=({children})=>{
    const [hasEditPermission, setHasEditPermission] = useState(false);
    const checkEditPermission=async(recordId: string)=>{

    }

    return(
        <div></div>
    )
}
