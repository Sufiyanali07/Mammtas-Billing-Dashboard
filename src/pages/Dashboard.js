import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import MockApiService from "../services/mockApi";
import { formatCurrency } from "../utils/formatting";
import "./Dashboard.css";

// Create a test button component to verify the API service
const TestApiButton = ({ onTest }) => {
  return (
    <button
      onClick={onTest}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Test API Connection
    </button>
  );
};

const DashboardCard = ({
  title,
  value,
  footer,
  icon,
  color,
  isLoading,
  className,
}) => {
  return (
    <div
      className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${color} ${className}`}
    >
      <div className="px-4 py-5 sm:p-6 flex justify-between items-center">
        <div>
          <dt className="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
            ) : (
              value
            )}
          </dd>
        </div>
        <div className={`text-${color.replace("border-", "")} text-opacity-80`}>
          {icon}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">{footer}</div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(() => {
    // Try to load stats from localStorage
    const savedStats = localStorage.getItem("dashboardStats");
    return savedStats
      ? JSON.parse(savedStats)
      : {
          totalBills: 0,
          totalRevenue: 0,
          pendingBills: 0,
          paidBills: 0,
        };
  });
  const [recentBills, setRecentBills] = useState(() => {
    // Try to load recent bills from localStorage
    const savedBills = localStorage.getItem("recentBills");
    return savedBills ? JSON.parse(savedBills) : [];
  });
  const [products, setProducts] = useState(() => {
    // Try to load products from localStorage
    const savedProducts = localStorage.getItem("products");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all required data in parallel
      const [bills, productsData] = await Promise.all([
        MockApiService.getAllBills(),
        MockApiService.getAllProducts(),
      ]);

      // Use our mock API service
      const data = await MockApiService.getDashboardStats();
      console.log("Dashboard: Received stats data:", data);

      if (!data) {
        throw new Error("No data received from API");
      }

      const newStats = {
        totalBills: data.totalBills,
        totalAmount: data.totalAmount,
        paidBills: data.paidBills,
        pendingBills: data.pendingBills,
        pendingAmount: data.pendingAmount,
      };

      // Update state
      setStats(newStats);
      setProducts(productsData);
      setRecentBills(bills.slice(0, 5)); // Get 5 most recent bills

      // Save to localStorage
      localStorage.setItem("dashboardStats", JSON.stringify(newStats));
      localStorage.setItem("products", JSON.stringify(productsData));
      localStorage.setItem("recentBills", JSON.stringify(bills.slice(0, 5)));

      setError("");
    } catch (err) {
      console.error("Dashboard error details:", err);
      setError(
        `Failed to fetch dashboard data: ${err.message || "Please try again."}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load initial data from localStorage
    const loadInitialData = async () => {
      try {
        const savedStats = localStorage.getItem("dashboardStats");
        const savedProducts = localStorage.getItem("products");
        const savedBills = localStorage.getItem("recentBills");

        if (savedStats) setStats(JSON.parse(savedStats));
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedBills) setRecentBills(JSON.parse(savedBills));

        // Then fetch fresh data
        await fetchDashboardData();
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError("Error loading saved data. Fetching fresh data...");
        await fetchDashboardData();
      }
    };

    loadInitialData();

    // Create a focus event listener to refresh data when returning to this page
    const handleFocus = () => {
      console.log("Window focused, refreshing dashboard data");
      fetchDashboardData();
    };

    // Add event listener for focus
    window.addEventListener("focus", handleFocus);

    // Clean up on component unmount
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Handle test button click
  const handleTestApi = async () => {
    await fetchDashboardData();
  };

  // Function to add a product to bill and navigate to billing form
  const addProductAndNavigate = (productName, productPrice) => {
    // Store the product in localStorage so the billing form can access it
    const selectedProduct = {
      name: productName,
      price: productPrice,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));

    // Navigate to the billing form
    navigate("/billing-form");
  };

  // Update all references to fetchStats to fetchDashboardData
  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-blue-800 mb-1 sm:mb-0 font-heading"
              style={{ letterSpacing: "-0.5px" }}
            >
              Mammtas Food
            </h1>
            <p className="text-sm text-gray-600">
              Premium Frozen Chicken Products
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center mt-4 sm:mt-0"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <TestApiButton onTest={handleTestApi} />
              </div>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-700 to-blue-600 shadow rounded-lg text-white relative overflow-hidden hero-banner">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg
              className="h-full w-full"
              viewBox="0 0 800 800"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="25" cy="25" r="2" fill="white" />
                </pattern>
                <pattern
                  id="dots"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M0 0h40v40H0z" fill="url(#grid)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-white font-heading tracking-wide">
                Welcome to Mammtas Food Dashboard
              </h2>
              <p className="text-sm text-blue-100">
                Manage your frozen food inventory and billing
              </p>
            </div>
            <Link
              to="/billing-form"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Bill
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Orders"
            value={stats.totalBills}
            footer={
              <Link
                to="/billing-history"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                View all orders
              </Link>
            }
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            color="border-blue-500"
            isLoading={loading}
            className="dashboard-card"
          />

          <DashboardCard
            title="Total Revenue"
            value={loading ? null : formatCurrency(stats.totalAmount)}
            footer={
              <span className="font-medium text-gray-500">
                From completed orders
              </span>
            }
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="border-blue-500"
            isLoading={loading}
            className="dashboard-card"
          />

          <DashboardCard
            title="Pending Revenue"
            value={loading ? null : formatCurrency(stats.pendingAmount)}
            footer={
              <span className="font-medium text-yellow-600">
                Awaiting payment
              </span>
            }
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="border-yellow-500"
            isLoading={loading}
            className="dashboard-card"
          />

          <DashboardCard
            title="Completed Orders"
            value={stats.paidBills}
            footer={
              <span className="font-medium text-green-600">
                {((stats.paidBills / stats.totalBills) * 100 || 0).toFixed(1)}%
                of total orders
              </span>
            }
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="border-green-500"
            isLoading={loading}
            className="dashboard-card"
          />

          <DashboardCard
            title="Pending Orders"
            value={stats.pendingBills}
            footer={
              <Link
                to="/billing-form"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Create new order
              </Link>
            }
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="border-yellow-500"
            isLoading={loading}
            className="dashboard-card"
          />
        </div>

        {/* Featured Products */}
        <div className="my-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6 font-heading flex items-center">
            <span className="h-8 w-1 bg-blue-600 rounded-full mr-3"></span>
            Hot Picks – Add in a Flash
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="bg-blue-50 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors product-card relative overflow-hidden group cursor-pointer"
              onClick={() =>
                addProductAndNavigate("Frozen Chicken Breast", 299)
              }
            >
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl">
                Premium
              </div>
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform">
                <svg
                  className="w-10 h-10 text-blue-600 frozen-icon"
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
              </div>
              <h3 className="font-medium text-gray-900 font-heading">
                Frozen Chicken Breast
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Premium quality, boneless
              </p>
              <div className="mt-3 text-blue-600 font-medium">
                {formatCurrency(299)}/kg
              </div>
              <button
                className="mt-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-600 transition-colors add-to-bill-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addProductAndNavigate("Frozen Chicken Breast", 299);
                }}
              >
                Add to Bill
              </button>
            </div>

            <div
              className="bg-green-50 rounded-lg p-4 text-center hover:bg-green-100 transition-colors product-card relative overflow-hidden group cursor-pointer"
              onClick={() => addProductAndNavigate("Chicken Nuggets", 249)}
            >
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl">
                Popular
              </div>
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform">
                <svg
                  className="w-10 h-10 text-green-600 frozen-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 font-heading">
                Chicken Nuggets
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Ready to cook, crispy
              </p>
              <div className="mt-3 text-green-600 font-medium">
                {formatCurrency(249)}/pack
              </div>
              <button
                className="mt-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full hover:bg-green-600 transition-colors add-to-bill-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addProductAndNavigate("Chicken Nuggets", 249);
                }}
              >
                Add to Bill
              </button>
            </div>

            <div
              className="bg-purple-50 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors product-card relative overflow-hidden group cursor-pointer"
              onClick={() =>
                addProductAndNavigate("Chicken Wings (Spicy)", 279)
              }
            >
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-bl">
                Spicy
              </div>
              <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform">
                <svg
                  className="w-10 h-10 text-purple-600 frozen-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 font-heading">
                Chicken Wings
              </h3>
              <p className="text-sm text-gray-600 mt-1">Spicy hot wings</p>
              <div className="mt-3 text-purple-600 font-medium">
                {formatCurrency(279)}/pack
              </div>
              <button
                className="mt-3 bg-purple-500 text-white text-xs px-3 py-1 rounded-full hover:bg-purple-600 transition-colors add-to-bill-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addProductAndNavigate("Chicken Wings (Spicy)", 279);
                }}
              >
                Add to Bill
              </button>
            </div>

            <div
              className="bg-yellow-50 rounded-lg p-4 text-center hover:bg-yellow-100 transition-colors product-card relative overflow-hidden group cursor-pointer"
              onClick={() => addProductAndNavigate("Chicken Sausages", 229)}
            >
              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-bl">
                New
              </div>
              <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform">
                <svg
                  className="w-10 h-10 text-yellow-600 frozen-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 font-heading">
                Chicken Sausages
              </h3>
              <p className="text-sm text-gray-600 mt-1">Smoked and flavorful</p>
              <div className="mt-3 text-yellow-600 font-medium">
                {formatCurrency(229)}/pack
              </div>
              <button
                className="mt-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full hover:bg-yellow-600 transition-colors add-to-bill-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addProductAndNavigate("Chicken Sausages", 229);
                }}
              >
                Add to Bill
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              to="/billing-form"
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create New Bill
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Generate a new bill for a customer
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/billing-history"
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                  <svg
                    className="h-6 w-6 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
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
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    View Billing History
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    See all bills and payment status
                  </p>
                </div>
              </div>
            </Link>

            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  const sampleCustomer = {
                    name: "Rajesh Kumar",
                    phone: "+919876543210",
                  };
                  const sampleItems = [
                    { name: "Frozen Chicken Breast", quantity: 2, price: 299 },
                    { name: "Chicken Nuggets", quantity: 1, price: 249 },
                    { name: "Chicken Wings", quantity: 1, price: 279 },
                  ];
                  await MockApiService.createBill(sampleCustomer, sampleItems);
                  fetchDashboardData();
                  setSuccessMessage("Sample bill created successfully!");
                  setTimeout(() => setSuccessMessage(""), 3000);
                } catch (error) {
                  setError(`Failed to create sample bill: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              }}
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create Sample Bill
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Generate a sample bill with chicken products
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  await MockApiService.clearAllBills();
                  fetchDashboardData();
                  setSuccessMessage("All bills cleared successfully!");
                  setTimeout(() => setSuccessMessage(""), 3000);
                } catch (error) {
                  setError(`Failed to clear bills: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              }}
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-red-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                  <svg
                    className="h-6 w-6 text-red-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Clear All Bills
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Reset the dashboard and remove all bills
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Bills */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Bills</h2>
            <Link
              to="/billing-history"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all bills
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {recentBills.map((bill) => (
                <li key={bill.id}>
                  <Link
                    to={`/billing-history/${bill.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          Bill #{bill.id}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              bill.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : bill.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bill.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {bill.customerName}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {bill.items} items
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>{formatCurrency(bill.total)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
