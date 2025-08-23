import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown, FiHome, FiFileText, FiSearch } from "react-icons/fi";
import {
  selectIsAuthenticated,
  selectCurrentUser,
  logout,
} from "../features/auth/authSlice";
import { useLogoutMutation, useGetProfileQuery } from "../services/authApiSlice";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/fmda.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user profile if authenticated but user data is missing
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || (user && user.name),
  });

  // Update user data if profile data is fetched
  useEffect(() => {
    if (profileData && profileData.user && !user) {
      dispatch({ type: 'auth/restoreUser', payload: profileData.user });
    }
  }, [profileData, dispatch, user]);

  const { refetch } = useLogoutMutation(undefined, {
    skip: !isAuthenticated,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      dispatch(logout());
      setIsProfileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = (e) => {
    e.preventDefault();
    setIsProfileOpen(!isProfileOpen);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user && user.name) {
      return user.name;
    }
    if (profileData && profileData.user && profileData.user.name) {
      return profileData.user.name;
    }
    return 'User';
  };

  return (
    <nav className="bg-[#0066a1] dark:bg-gray-800 text-white sticky top-0 z-50 shadow-md ">
      <div className="w-4/5 mx-auto px-2">
        <div className="flex justify-between items-center py-2">
          <Link to="/" className="flex items-center ">
            <img src={logo} alt="FMDA Logo" className="w-12 h-10 sm:w-20 sm:h-14 mr-2" />
            <div className="flex flex-col ">
              <span className="text-base sm:text-xl font-bold leading-tight truncate max-w-[150px] sm:max-w-full">
                Faridabad Metropolitan
              </span>
              <span className="text-sm font-medium text-blue-100 dark:text-gray-300 hidden sm:block">
                Development Authority
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-blue-100 dark:hover:text-gray-300 font-medium flex items-center px-3 py-2 rounded-md dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <FiHome className="mr-1.5" />
                  <span>Dashboard</span>
                </Link>
                
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    ref={profileButtonRef}
                    className="flex items-center text-white hover:text-blue-100 dark:hover:text-gray-300 px-3 py-2 rounded-md dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <FiUser className="mr-1.5 h-5 w-5" />
                    <span className="mr-1 font-medium truncate max-w-[200px]">{getUserDisplayName()}</span>
                    <FiChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isProfileOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div 
                      ref={profileDropdownRef}
                      className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50 transform origin-top-right transition-all duration-200"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || profileData?.user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 mt-1 text-sm text-gray-700 rounded-md dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-blue-600 dark:text-blue-400" />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <div className="flex items-center">
                          <FiLogOut className="mr-2 text-red-600 dark:text-red-400" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-blue-100 dark:hover:text-gray-300 font-medium px-3 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium shadow-sm transition-colors duration-200"
                >
                  Register
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="text-white hover:text-blue-100 dark:hover:text-gray-300 p-2 rounded-md hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Slide down animation */}
      <div 
        className={`md:hidden bg-white dark:bg-gray-800 shadow-lg border-t border-blue-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="w-4/5 mx-auto py-2 px-2 divide-y divide-gray-100 dark:divide-gray-700">
          {isAuthenticated ? (
            <div className="space-y-1">
              <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-gray-700 rounded-full">
                    <FiUser className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || profileData?.user?.email}</p>
                  </div>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiHome className="mr-3 text-blue-600 dark:text-blue-400" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <Link
                to="/inspections/create"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiFileText className="mr-3 text-blue-600 dark:text-blue-400" />
                  <span>Create Report</span>
                </div>
              </Link>
              <Link
                to="/inspections/search"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiSearch className="mr-3 text-blue-600 dark:text-blue-400" />
                  <span>Search Reports</span>
                </div>
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiUser className="mr-3 text-blue-600 dark:text-blue-400" />
                  <span>Profile</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
              >
                <div className="flex items-center">
                  <FiLogOut className="mr-3 text-red-600 dark:text-red-400" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              <Link
                to="/login"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
