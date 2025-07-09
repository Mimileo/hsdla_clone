import { useNavigate } from "react-router-dom";
import Button from "../components/LoginButton";

// src/pages/Home.tsx
export default function Home() {

  const navigate = useNavigate();
  
  function handleLogin(): void {
    console.log("Login button clicked");
    navigate("/login");
  }

  function handleRegister(): void {
    console.log("Register button clicked");
    navigate("/register");
  }

  return (
    <div className="relative z-20 flex items-center overflow-hidden bg-white dark:bg-gray-800">
      <div className="container relative flex flex-col-reverse lg:flex-row px-6 py-16 mx-auto gap-10">
        <div className="relative z-20 flex flex-col lg:w-2/5">
          <span className="w-20 h-2 mb-6 bg-gray-800 dark:bg-white" />
          <div className="text-4xl sm:text-6xl font-black leading-none text-gray-800 uppercase dark:text-white">
            <span className="text-4xl sm:text-4xl">Turn every</span>
            <br />
            <span className="text-4xl sm:text-4xl text-sky-500 ">Transcript</span>
            <br />
            <span className="text-4xl sm:text-4xl">into an<span className="text-sky-500"> opportunity</span> </span>
          </div>
          <p className="mt-4 text-sm text-gray-700 sm:text-base dark:text-white">
            Students have many pathways. Schools need to support them no matter where they are going. Parchment makes it simple. From one platform, administrators can securely send and receive student credentials like transcripts, transfer records, and college application documents in a few clicks.
          </p>
          <div className="flex mt-8">
           

            <Button 
              label="Get Started" 
              className="px-4 py-2 mr-4 text-white uppercase bg-pink-500 border-2 
              border-transparent rounded-lg text-md hover:bg-pink-400"
              onClick={handleRegister}
            />

            <Button 
              label="Login"  
              className="px-4 py-2 mr-4 text-white uppercase bg-sky-500 border-2 
              border-transparent rounded-lg text-md hover:bg-pink-400" 
              onClick={handleLogin}
            />
          

            
          </div>
        </div>

        <div className="lg:w-3/5">
          <img
            alt="hero"
            src="https://picsum.photos/400/300"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
