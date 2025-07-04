// src/pages/Dashboard.tsx

import { useAuthStore } from "../../stores/authStore";


export default function Dashboard() {
  const { user } = useAuthStore();
  return (
    
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome, {user?.firstName}</h1>
        <p>This is your dashboard.</p>
      </div>
   
  );
}
