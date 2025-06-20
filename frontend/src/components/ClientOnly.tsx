"use client";

import { useEffect, useState } from "react";

interface ClientOnlyProps {
   children: React.ReactNode;
}

export function ClientOnly({ children }: ClientOnlyProps) {
   const [hasMounted, setHasMounted] = useState(false);

   useEffect(() => {
      setHasMounted(true);
   }, []);

   if (!hasMounted) {
      return null; // Render nothing on the server and during the initial client render
   }

   return <>{children}</>;
}
