// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Shared header/nav can go here if needed */}
      <Navbar />
       <main className="flex-grow">
         <Outlet />
       </main>
     
      {/* Shared footer can go here if needed */}
      <Footer />
    </div>
  );
}
