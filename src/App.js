import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import BillingForm from "./pages/BillingForm";
import BillingHistory from "./pages/BillingHistory";
import SmsStatus from "./pages/SmsStatus";
import SmsSettings from "./pages/SmsSettings";
import SmsTest from "./pages/SmsTest";
import DirectSms from "./pages/DirectSms";
import Receipt from "./pages/Receipt";
import Receipts from "./pages/Receipts";
import Products from "./pages/Products";
import Navbar from "./components/Navbar";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";

// Public Receipt component that doesn't include Navbar
const PublicReceiptWrapper = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/:billId" element={<Receipt />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  // Check if we're in the public receipt route
  const isPublicReceipt = window.location.pathname.startsWith("/p/receipt/");

  if (isPublicReceipt) {
    return (
      <ThemeProvider>
        <Router basename="/p/receipt">
          <Toaster position="top-right" />
          <PublicReceiptWrapper />
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Toaster position="top-right" />
          <Navbar />
          <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/billing-form" element={<BillingForm />} />
              <Route path="/create-bill" element={<BillingForm />} />
              <Route path="/billing-history" element={<BillingHistory />} />
              <Route path="/quick-add" element={<Products />} />
              <Route path="/sms-status" element={<SmsStatus />} />
              <Route path="/sms-settings" element={<SmsSettings />} />
              <Route path="/sms-test" element={<SmsTest />} />
              <Route path="/direct-sms" element={<DirectSms />} />
              <Route path="/receipt/:billId" element={<Receipt />} />
              <Route path="/receipts" element={<Receipts />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
