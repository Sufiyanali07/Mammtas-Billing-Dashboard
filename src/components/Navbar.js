import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSettingsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div
              className="flex-shrink-0 flex items-center relative"
              ref={dropdownRef}
            >
              <div className="relative">
                <img
                  src="/images/mammta-logo.svg"
                  alt="Mammta Logo"
                  className="h-12 w-auto mr-2 rounded-full cursor-pointer border-2 border-transparent hover:border-white transition-all duration-200"
                  onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                />
                {/* Settings indicator dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
              </div>

              {/* Settings Dropdown */}
              {settingsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b">
                      Admin Settings
                    </div>
                    <Link
                      to="/sms-settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setSettingsDropdownOpen(false)}
                    >
                      <svg
                        className="h-4 w-4 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      SMS Settings
                    </Link>
                    <Link
                      to="/sms-test"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setSettingsDropdownOpen(false)}
                    >
                      <svg
                        className="h-4 w-4 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      Test Messages
                    </Link>
                    <Link
                      to="/direct-sms"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setSettingsDropdownOpen(false)}
                    >
                      <svg
                        className="h-4 w-4 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Direct Message
                    </Link>
                  </div>
                </div>
              )}

              <span className="text-xl font-bold text-white font-heading tracking-wide">
                Mammtas Food
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive("/")
                    ? "border-white text-white"
                    : "border-transparent text-blue-100 hover:border-blue-300 hover:text-white"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors font-heading`}
              >
                Dashboard
              </Link>
              <Link
                to="/billing-form"
                className={`${
                  isActive("/billing-form") || isActive("/create-bill")
                    ? "border-white text-white"
                    : "border-transparent text-blue-100 hover:border-blue-300 hover:text-white"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors font-heading`}
              >
                New Order
              </Link>
              <Link
                to="/billing-history"
                className={`${
                  isActive("/billing-history")
                    ? "border-white text-white"
                    : "border-transparent text-blue-100 hover:border-blue-300 hover:text-white"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors font-heading`}
              >
                Order History
              </Link>
              <Link
                to="/receipts"
                className={`${
                  isActive("/receipts")
                    ? "border-white text-white"
                    : "border-transparent text-blue-100 hover:border-blue-300 hover:text-white"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors font-heading`}
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Receipts
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isDarkMode ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`${
              isActive("/")
                ? "bg-blue-700 border-white text-white"
                : "border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-300 hover:text-white"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-heading`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/billing-form"
            className={`${
              isActive("/billing-form") || isActive("/create-bill")
                ? "bg-blue-700 border-white text-white"
                : "border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-300 hover:text-white"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-heading`}
            onClick={() => setMobileMenuOpen(false)}
          >
            New Order
          </Link>
          <Link
            to="/billing-history"
            className={`${
              isActive("/billing-history")
                ? "bg-blue-700 border-white text-white"
                : "border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-300 hover:text-white"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-heading`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Order History
          </Link>
          <Link
            to="/receipts"
            className={`${
              isActive("/receipts")
                ? "bg-blue-700 border-white text-white"
                : "border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-300 hover:text-white"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-heading`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Receipts
          </Link>
          {/* Settings section in mobile menu */}
          <div className="border-t border-blue-700 pt-2 mt-2">
            <div className="px-3 py-1 text-xs text-blue-200">
              Admin Settings
            </div>
            <Link
              to="/sms-settings"
              className={`${
                isActive("/sms-settings")
                  ? "bg-blue-700 border-white text-white"
                  : "border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-300 hover:text-white"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-heading`}
              onClick={() => setMobileMenuOpen(false)}
            >
              SMS Settings
            </Link>
            <Link
              to="/sms-test"
              className={`${
                isActive("/sms-test")
                  ? "bg-blue-700 border-white text-white"
                  : "border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-300 hover:text-white"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-heading`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Message Test
            </Link>
            <Link
              to="/direct-sms"
              className={`${
                isActive("/direct-sms")
                  ? "bg-blue-700 border-white text-white"
                  : "border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-300 hover:text-white"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-heading`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Direct Message
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
