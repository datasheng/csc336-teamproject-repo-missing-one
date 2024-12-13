"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/'); // Redirect to home page after logout
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-800">
              SiteSeekers
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            
            {!isLoggedIn ? (
              <>
                <Link 
                  href="/register" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Register
                </Link>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/profile" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="border-b"></div>
    </nav>
  );
}
