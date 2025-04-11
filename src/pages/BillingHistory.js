import React, { useState, useEffect, useMemo } from "react";
import MockApiService from "../services/mockApi";
import { Link } from "react-router-dom";

const SmsStatusBadge = ({ bill }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!bill.phone) {
    return null;
  }

  let smsStatus = null;

  // Check if WhatsApp is enabled
  const isWhatsAppEnabled =
    localStorage.getItem("useWhatsApp") === "true" ||
    localStorage.getItem("useWhatsApp") === null;

  // Check if the bill is in the retry queue
  const isRetrying =
    window.pendingSmsRetries &&
    window.pendingSmsRetries.some((retry) => retry.billId === bill.id);

  if (bill.whatsAppSent) {
    // WhatsApp message was sent
    const timeAgo =
      new Date().getTime() - new Date(bill.whatsAppTimestamp).getTime();
    const minutesAgo = Math.floor(timeAgo / (1000 * 60));
    const hoursAgo = Math.floor(minutesAgo / 60);

    let timeString =
      hoursAgo > 0
        ? `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`
        : `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;

    if (minutesAgo < 1) {
      timeString = "just now";
    }

    smsStatus = (
      <span
        className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 cursor-pointer relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
        </svg>
        WhatsApp
        {showTooltip && (
          <div className="absolute z-10 bg-gray-800 text-white text-xs rounded py-2 px-3 mt-1 -ml-1 w-60 shadow-lg">
            <p className="font-normal">Sent {timeString}</p>
            {bill.messageCount > 1 && (
              <p className="font-normal mt-1">
                Sent {bill.messageCount}{" "}
                {bill.messageCount === 1 ? "time" : "times"}
              </p>
            )}
            <p className="font-normal mt-1 text-gray-300">To: {bill.phone}</p>
          </div>
        )}
      </span>
    );
  } else if (bill.smsSent) {
    // SMS was sent
    const timeAgo =
      new Date().getTime() - new Date(bill.smsTimestamp).getTime();
    const minutesAgo = Math.floor(timeAgo / (1000 * 60));
    const hoursAgo = Math.floor(minutesAgo / 60);

    let timeString =
      hoursAgo > 0
        ? `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`
        : `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;

    if (minutesAgo < 1) {
      timeString = "just now";
    }

    smsStatus = (
      <span
        className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          className="h-3 w-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21.15 8.751c.34.15.85.15 1.2 0M10.7 2.451a17.92 17.92 0 012.6 0M12.85 19.151c-.34.15-.85.15-1.2 0"
          />
        </svg>
        SMS Sent
        {showTooltip && (
          <div className="absolute z-10 bg-gray-800 text-white text-xs rounded py-2 px-3 mt-1 -ml-1 w-60 shadow-lg">
            <p className="font-normal">Sent {timeString}</p>
            {bill.smsCount > 1 && (
              <p className="font-normal mt-1">
                Sent {bill.smsCount} {bill.smsCount === 1 ? "time" : "times"}
              </p>
            )}
            <p className="font-normal mt-1 text-gray-300">To: {bill.phone}</p>
            {bill.lastMessageContent && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <p className="font-normal text-gray-300 text-xs">
                  Message Preview:
                </p>
                <p className="font-normal text-gray-300 text-xs mt-1 line-clamp-2">
                  {bill.lastMessageContent.substring(0, 60)}...
                </p>
              </div>
            )}
          </div>
        )}
      </span>
    );
  } else if (isRetrying) {
    // Show a pending status for bills in retry queue
    smsStatus = (
      <span
        className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 cursor-pointer relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Pending
        {showTooltip && (
          <div className="absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 mt-1 -ml-1 w-48">
            <p className="font-normal">
              Message delivery being retried automatically
            </p>
            <p className="font-normal mt-1 text-gray-300">To: {bill.phone}</p>
          </div>
        )}
      </span>
    );
  } else {
    // SMS has never been sent but phone number exists
    smsStatus = (
      <span
        className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 cursor-pointer relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          className="h-3 w-3 mr-1"
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
        {isWhatsAppEnabled ? "Not Sent" : "No SMS"}
        {showTooltip && (
          <div className="absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 mt-1 -ml-1 w-48">
            <p className="font-normal">
              This bill has not been sent to the customer yet
            </p>
            <p className="font-normal mt-1 text-gray-300">To: {bill.phone}</p>
          </div>
        )}
      </span>
    );
  }

  return smsStatus;
};

const BillingHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [smsSending, setSmsSending] = useState(null);
  const [smsSuccess, setSmsSuccess] = useState(null);
  const [bulkSmsSending, setBulkSmsSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentProcessing, setPaymentProcessing] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await MockApiService.getAllBills();
      setBills(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch billing history. Please try again later.");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Handle sending SMS for a bill
  const handleSendSMS = async (billId) => {
    try {
      setSmsSending(billId);
      setSmsSuccess(null);
      setError("");

      // Find the bill to get the phone number
      const bill = bills.find((b) => b.id === billId);
      if (!bill || !bill.phone) {
        throw new Error("Cannot send SMS: No phone number found for this bill");
      }

      // Try to send SMS multiple times if needed
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!success && attempts < maxAttempts) {
        attempts++;
        try {
          console.log(`Sending SMS attempt ${attempts}/${maxAttempts}...`);

          // Add small delay between retries
          if (attempts > 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          // Send the SMS via MockApiService
          await MockApiService.sendBillSMS(billId, bill.phone);
          success = true;
        } catch (err) {
          console.error(`SMS attempt ${attempts} failed:`, err);

          // On final attempt, throw the error
          if (attempts >= maxAttempts) {
            throw err;
          }
        }
      }

      // Refresh bills to show updated SMS status
      await fetchBills();

      // Show success message
      setSmsSuccess({
        billId,
        message: `SMS successfully sent to ${bill.phone}`,
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSmsSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to send SMS: ${err.message}`);
      console.error("SMS send error:", err);
    } finally {
      setSmsSending(null);
    }
  };

  // Handle resending all pending SMS
  const handleResendAllPendingSMS = async () => {
    try {
      setBulkSmsSending(true);
      setError("");

      // Find all bills that need SMS
      const pendingSmsBills = bills.filter(
        (bill) =>
          (!bill.smsSent || // Never sent
            (window.pendingSmsRetries &&
              window.pendingSmsRetries.some(
                (retry) => retry.billId === bill.id
              ))) && // In retry queue
          bill.phone // Has phone number
      );

      if (pendingSmsBills.length === 0) {
        setSmsSuccess({
          message: "No pending SMS found that need to be resent.",
        });
        return;
      }

      console.log(
        `Found ${pendingSmsBills.length} bills requiring SMS to be sent/resent`
      );

      // Process each bill sequentially
      let successCount = 0;
      let failCount = 0;

      for (const bill of pendingSmsBills) {
        try {
          // Try to send SMS with retry mechanism
          let success = false;
          let attempts = 0;
          const maxAttempts = 2; // Fewer attempts for bulk sending

          while (!success && attempts < maxAttempts) {
            attempts++;
            try {
              console.log(
                `Sending SMS for bill #${bill.id}, attempt ${attempts}/${maxAttempts}...`
              );

              if (attempts > 1) {
                await new Promise((resolve) => setTimeout(resolve, 300));
              }

              await MockApiService.sendBillSMS(bill.id, bill.phone);
              success = true;
              successCount++;
            } catch (err) {
              console.error(
                `SMS attempt ${attempts} failed for bill #${bill.id}:`,
                err
              );

              if (attempts >= maxAttempts) {
                failCount++;
                // Don't throw, just log and continue with next bill
                console.error(
                  `Failed to send SMS for bill #${bill.id} after ${maxAttempts} attempts`
                );
              }
            }
          }
        } catch (err) {
          failCount++;
          console.error(`Error processing bill #${bill.id}:`, err);
        }
      }

      // Refresh bills to show updated SMS status
      await fetchBills();

      // Show appropriate success/failure message
      if (successCount > 0) {
        setSmsSuccess({
          message: `Successfully sent ${successCount} SMS${
            failCount > 0 ? `, but ${failCount} failed` : ""
          }`,
        });
      } else if (failCount > 0) {
        setError(
          `Failed to send all ${failCount} SMS messages. Please try again later.`
        );
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSmsSuccess(null), 5000);
    } catch (err) {
      setError(`Bulk SMS operation failed: ${err.message}`);
      console.error("Bulk SMS error:", err);
    } finally {
      setBulkSmsSending(false);
    }
  };

  // Handle marking a bill as paid
  const handleMarkAsPaid = async (billId) => {
    try {
      setPaymentProcessing(billId);
      setPaymentSuccess(null);
      setError("");

      // Find the bill to get its phone number
      const billToUpdate = bills.find((bill) => bill.id === billId);

      // Call the API to mark the bill as paid
      const result = await MockApiService.markBillAsPaid(billId);

      if (result.success) {
        // Refresh bills to show updated status
        await fetchBills();

        // If there's a receipt URL and the bill has a phone number, send the notification
        if (result.receiptUrl && billToUpdate && billToUpdate.phone) {
          try {
            // Update the bill status to paid in memory before sending SMS
            // This ensures the SMS contains the correct "paid" status message
            const updatedBill = {
              ...billToUpdate,
              status: "paid",
            };

            // Attempt to send receipt notification
            await MockApiService.sendBillSMS(billId, billToUpdate.phone);
            console.log(
              "Receipt notification sent successfully with URL:",
              result.receiptUrl
            );
          } catch (smsError) {
            console.error("Failed to send receipt notification:", smsError);
            // We don't show this error to the user to avoid confusion
          }
        }

        // Show success message
        setPaymentSuccess({
          billId,
          message: result.message,
          receiptUrl: result.receiptUrl,
        });

        // Clear success message after 5 seconds
        setTimeout(() => setPaymentSuccess(null), 5000);
      } else {
        // Show error message
        setError(result.message);
      }
    } catch (err) {
      setError(`Failed to mark bill as paid: ${err.message}`);
      console.error("Payment processing error:", err);
    } finally {
      setPaymentProcessing(null);
    }
  };

  // Get filtered bills based on search term and status filter
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      // Apply search filter
      const matchesSearch = bill.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Apply status filter
      const matchesStatus =
        statusFilter === "all" || bill.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, searchTerm, statusFilter]);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (id) => {
    try {
      // Use the MockApiService to delete the bill
      await MockApiService.deleteBill(id);
      // Then update the UI
      setBills(bills.filter((bill) => bill.id !== id));
    } catch (err) {
      setError("Failed to delete bill. Please try again later.");
      console.error(err);
    }
  };

  // Add function to expose retry queue for SmsStatusBadge to access
  useEffect(() => {
    // Load pending SMS retries from localStorage to make them accessible
    try {
      const pendingSmsRetries =
        JSON.parse(localStorage.getItem("pendingSmsRetries")) || [];
      window.pendingSmsRetries = pendingSmsRetries;
    } catch (error) {
      console.error("Error loading SMS retries:", error);
      window.pendingSmsRetries = [];
    }
  }, [bills]); // Update when bills change

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
          Billing History
        </h2>

        <div className="flex items-center space-x-2">
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded mb-2 sm:mb-0 mr-2">
              {error}
            </div>
          )}

          {smsSuccess && (
            <div className="text-green-500 text-sm bg-green-50 p-2 rounded mb-2 sm:mb-0 mr-2">
              {smsSuccess.message}
            </div>
          )}

          {paymentSuccess && (
            <div className="text-green-500 text-sm bg-green-50 p-2 rounded mb-2 sm:mb-0 mr-2 flex items-center">
              <span>{paymentSuccess.message}</span>
              {paymentSuccess.receiptUrl && (
                <a
                  href={paymentSuccess.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center px-2 py-1 border border-green-300 text-xs rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    ></path>
                  </svg>
                  View Receipt
                </a>
              )}
            </div>
          )}

          <div className="flex items-center">
            <button
              onClick={handleResendAllPendingSMS}
              disabled={bulkSmsSending}
              className={`flex items-center px-3 py-1 text-sm font-medium rounded ${
                bulkSmsSending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {bulkSmsSending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Resend All Pending SMS
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search bills by customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200">
        {loading ? (
          <div className="text-center py-6">
            <svg
              className="animate-spin h-8 w-8 text-indigo-500 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-2 text-gray-600">Loading bills...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-6">
            <svg
              className="h-12 w-12 text-gray-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "No bills match your filters. Try adjusting your search or filter criteria."
                : "No bills found. Create your first bill to get started!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile view - Card layout */}
            <div className="md:hidden">
              {filteredBills.map((bill) => (
                <div
                  key={bill.id}
                  className="border-b border-gray-200 py-4 px-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-medium">
                        #{bill.id} - {bill.customerName}
                        <SmsStatusBadge bill={bill} />
                      </h4>
                      <p className="text-sm text-gray-500">{bill.phone}</p>
                    </div>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                        bill.status
                      )}`}
                    >
                      {bill.status.charAt(0).toUpperCase() +
                        bill.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span>{" "}
                      {new Date(bill.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-gray-500">Items:</span> {bill.items}
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span> ₹
                      {bill.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button className="px-3 py-1 text-indigo-600 hover:text-indigo-900 border border-indigo-200 rounded hover:bg-indigo-50">
                      View
                    </button>
                    <button className="px-3 py-1 text-indigo-600 hover:text-indigo-900 border border-indigo-200 rounded hover:bg-indigo-50">
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-red-600 hover:text-red-900 border border-red-200 rounded hover:bg-red-50"
                      onClick={() => handleDelete(bill.id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`px-3 py-1 text-blue-600 hover:text-blue-900 border border-blue-200 rounded hover:bg-blue-50 flex items-center ${
                        smsSending === bill.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleSendSMS(bill.id)}
                      disabled={smsSending === bill.id}
                    >
                      {smsSending === bill.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>{bill.smsSent ? "Resend SMS" : "Send SMS"}</>
                      )}
                    </button>

                    {/* Add mark as paid button for pending bills in mobile view */}
                    {bill.status === "pending" && (
                      <button
                        className={`px-3 py-1 text-green-600 hover:text-green-900 border border-green-200 rounded hover:bg-green-50 flex items-center ${
                          paymentProcessing === bill.id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => handleMarkAsPaid(bill.id)}
                        disabled={paymentProcessing === bill.id}
                      >
                        {paymentProcessing === bill.id
                          ? "Processing..."
                          : "Mark as Paid"}
                      </button>
                    )}

                    {/* Add payment link button for pending bills in mobile view */}
                    {bill.status === "pending" && (
                      <a
                        href={`${window.location.origin}/p/pay/${bill.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-indigo-600 hover:text-indigo-900 border border-indigo-200 rounded hover:bg-indigo-50 flex items-center"
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        Payment Link
                      </a>
                    )}

                    {/* Add receipt button for paid bills in mobile view */}
                    {bill.status === "paid" && (
                      <Link
                        to={`/receipt/${bill.id}`}
                        className="px-3 py-1 text-blue-600 hover:text-blue-900 border border-blue-200 rounded hover:bg-blue-50 flex items-center"
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        View Receipt
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view - Table layout */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Bill ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{bill.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bill.customerName}
                        <SmsStatusBadge bill={bill} />
                      </div>
                      <div className="text-sm text-gray-500">{bill.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{bill.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          bill.status
                        )}`}
                      >
                        {bill.status.charAt(0).toUpperCase() +
                          bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        View
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 mr-3"
                        onClick={() => handleDelete(bill.id)}
                      >
                        Delete
                      </button>
                      <button
                        className={`text-blue-600 hover:text-blue-900 flex items-center inline-flex ${
                          smsSending === bill.id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => handleSendSMS(bill.id)}
                        disabled={smsSending === bill.id}
                      >
                        {smsSending === bill.id ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>{bill.smsSent ? "Resend SMS" : "Send SMS"}</>
                        )}
                      </button>

                      {/* Mark as Paid button for pending bills */}
                      {bill.status === "pending" && (
                        <button
                          className={`text-green-600 hover:text-green-900 flex items-center inline-flex ml-3 ${
                            paymentProcessing === bill.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleMarkAsPaid(bill.id)}
                          disabled={paymentProcessing === bill.id}
                        >
                          {paymentProcessing === bill.id ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>Mark as Paid</>
                          )}
                        </button>
                      )}

                      {/* Payment Link button for pending bills */}
                      {bill.status === "pending" && (
                        <a
                          href={`${window.location.origin}/p/pay/${bill.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 flex items-center inline-flex ml-3"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          Payment Link
                        </a>
                      )}

                      {/* View Receipt button for paid bills */}
                      {bill.status === "paid" && (
                        <Link
                          to={`/receipt/${bill.id}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center inline-flex ml-3"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          View Receipt
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredBills.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredBills.length}</span> of{" "}
                <span className="font-medium">{filteredBills.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
