import Button from "../components/LoginButton";

// src/pages/Home.tsx
export default function Home() {
  return (
    <div className="relative z-20 flex items-center overflow-hidden bg-white dark:bg-gray-800">
      <div className="container relative flex flex-col-reverse lg:flex-row px-6 py-16 mx-auto gap-10">
        <div className="relative z-20 flex flex-col lg:w-2/5">
          <span className="w-20 h-2 mb-6 bg-gray-800 dark:bg-white" />
          <h1 className="text-5xl sm:text-6xl font-black leading-none text-gray-800 uppercase dark:text-white">
            Be on
            <br />
            <span className="text-4xl sm:text-5xl">Time</span>
          </h1>
          <p className="mt-4 text-sm text-gray-700 sm:text-base dark:text-white">
            Dimension of reality that makes change possible and understandable.
            An indefinite and homogeneous environment in which natural events
            and human existence take place.
          </p>
          <div className="flex mt-8">
            <a
              href="#"
              className="px-4 py-2 mr-4 text-white uppercase bg-pink-500 border-2 border-transparent rounded-lg text-md hover:bg-pink-400"
            >
              Get started
            </a>

            <Button label="Sign up" className="px-4 py-2 mr-4 text-white uppercase bg-pink-500 border-2 border-transparent rounded-lg text-md hover:bg-pink-400" />

            <Button label="Login" />
          

            
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
