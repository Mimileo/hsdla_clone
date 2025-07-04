import { useState } from "react";

export default function Navbar() {

  const navLinks = ["Home", "About", "Product", "Contact"];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="z-30 flex items-center w-full h-24 sm:h-32">
      <div className="container flex items-center justify-between px-6 mx-auto">
        <div className="text-3xl font-black text-gray-800 uppercase dark:text-white">
          Transcript Service
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center text-lg text-gray-800 uppercase font-sen dark:text-white">
          {navLinks.map((item) => (
            <a key={item} href="#" className="flex px-6 py-2">
              {item}
            </a>
          ))}
        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className="flex flex-col ml-4 lg:hidden"
        >
          <span className="w-6 h-1 mb-1 bg-gray-800 dark:bg-white"></span>
          <span className="w-6 h-1 mb-1 bg-gray-800 dark:bg-white"></span>
          <span className="w-6 h-1 mb-1 bg-gray-800 dark:bg-white"></span>
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="absolute top-24 left-0 w-full bg-white dark:bg-gray-800 lg:hidden z-40 shadow-md">
          <div className="flex flex-col items-center py-4">
            {navLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="block px-6 py-2 text-gray-800 uppercase dark:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
