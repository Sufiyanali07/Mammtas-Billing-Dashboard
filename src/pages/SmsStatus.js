import React, { useState, useEffect } from "react";
import MockApiService from "../services/mockApi";
import { FaWhatsapp } from "react-icons/fa";

const SmsStatus = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRetries, setPendingRetries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
  });
  const [selectedSms, setSelectedSms] = useState(null);
  const [bulkResending, setBulkResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // Check if WhatsApp is enabled
  const isWhatsAppEnabled =
    localStorage.getItem("useWhatsApp") === "true" ||
    localStorage.getItem("useWhatsApp") === null;

  // Helper for formatting time
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }
  };

  // Load all bills with SMS statuses
  const fetchSmsStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bills data
      const billsData = await MockApiService.getAllBills();

      // Load pending retries from localStorage
      const retries =
        JSON.parse(localStorage.getItem("pendingSmsRetries")) || [];
      setPendingRetries(retries);

      setBills(billsData);

      // Calculate statistics
      const billsWithPhone = billsData.filter((bill) => bill.phone).length;

      // Count successful sends - either SMS or WhatsApp
      const sentCount = billsData.filter(
        (bill) => bill.smsSent || bill.whatsAppSent
      ).length;

      // Count bills in retry queue
      const pendingCount = retries.length;

      // Calculate failed count
      const failedCount = billsWithPhone - sentCount - pendingCount;

      setStats({
        total: billsWithPhone,
        sent: sentCount,
        pending: pendingCount,
        failed: failedCount,
      });

      setLoading(false);
    } catch (err) {
      setError("Failed to load SMS status information: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmsStatus();
  }, []);

  // Handle resend of a single SMS
  const handleResendSms = async (billId) => {
    try {
      // Get bill data
      const bill = bills.find((b) => b.id === billId);
      if (!bill) {
        throw new Error(`Bill #${billId} not found`);
      }

      // Send SMS
      await MockApiService.sendBillSMS(billId, bill.phone);

      // Show success message
      setResendSuccess(`Message resent to ${bill.customerName} successfully!`);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setResendSuccess("");
      }, 3000);

      // Refresh data
      fetchSmsStatus();
    } catch (err) {
      setError(`Failed to resend message: ${err.message}`);
      console.error(err);
    }
  };

  // Handle bulk resend of all failed SMS
  const handleBulkResend = async () => {
    setBulkResending(true);
    setError(null);
    setResendSuccess("");

    try {
      // Get all bills that have phone numbers but no successful SMS
      const failedBills = bills.filter(
        (bill) => bill.phone && !bill.smsSent && !bill.whatsAppSent
      );

      if (failedBills.length === 0) {
        setResendSuccess("No failed messages found to resend.");
        setBulkResending(false);
        return;
      }

      // Send SMS for each failed bill
      let successCount = 0;
      let failCount = 0;

      for (const bill of failedBills) {
        try {
          await MockApiService.sendBillSMS(bill.id, bill.phone);
          successCount++;
        } catch (error) {
          console.error(`Failed to resend for bill #${bill.id}:`, error);
          failCount++;
        }
      }

      // Show results
      setResendSuccess(
        `Bulk resend complete: ${successCount} successful, ${failCount} failed.`
      );

      // Refresh data
      fetchSmsStatus();
    } catch (err) {
      setError(`Bulk resend operation failed: ${err.message}`);
      console.error("Bulk resend error:", err);
    } finally {
      setBulkResending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {isWhatsAppEnabled
          ? "Messaging Status Dashboard"
          : "SMS Status Dashboard"}
      </h2>

      {/* WhatsApp notification */}
      {isWhatsAppEnabled && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaWhatsapp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                WhatsApp messaging is enabled. Bill notifications are sent via
                WhatsApp instead of SMS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats/Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-blue-800 font-semibold">Total</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          <p className="text-sm text-blue-700">Bills with phone numbers</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <h3 className="text-green-800 font-semibold">Successfully Sent</h3>
          <p className="text-2xl font-bold text-green-900">{stats.sent}</p>
          <p className="text-sm text-green-700">
            {stats.sent > 0
              ? `${Math.round((stats.sent / stats.total) * 100)}% success rate`
              : "No messages sent yet"}
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <h3 className="text-yellow-800 font-semibold">Pending</h3>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          <p className="text-sm text-yellow-700">Waiting to be sent</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <h3 className="text-red-800 font-semibold">Failed</h3>
          <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
          <p className="text-sm text-red-700">Need manual resending</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
            </div>
          </div>
        </div>
      )}

      {resendSuccess && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
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
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{resendSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* SMS Message Viewer Modal */}
      {selectedSms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Message Details</h3>
              <button
                onClick={() => setSelectedSms(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="mb-2">
                <span className="font-semibold">Bill #:</span> {selectedSms.id}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Customer:</span>{" "}
                {selectedSms.customerName}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Phone:</span>{" "}
                {selectedSms.phone}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Status:</span>{" "}
                {selectedSms.whatsAppSent
                  ? "WhatsApp Sent"
                  : selectedSms.smsSent
                  ? "SMS Sent"
                  : "Not Sent"}
              </div>
              {selectedSms.whatsAppTimestamp && (
                <div className="mb-2">
                  <span className="font-semibold">WhatsApp sent:</span>{" "}
                  {formatTimeAgo(selectedSms.whatsAppTimestamp)}
                </div>
              )}
              {selectedSms.smsTimestamp && (
                <div className="mb-2">
                  <span className="font-semibold">SMS sent:</span>{" "}
                  {formatTimeAgo(selectedSms.smsTimestamp)}
                </div>
              )}
              {selectedSms.messageCount > 0 && (
                <div className="mb-2">
                  <span className="font-semibold">WhatsApp count:</span>{" "}
                  {selectedSms.messageCount} times
                </div>
              )}
              {selectedSms.smsCount > 0 && (
                <div className="mb-2">
                  <span className="font-semibold">SMS count:</span>{" "}
                  {selectedSms.smsCount} times
                </div>
              )}
            </div>

            {selectedSms.lastMessageContent && (
              <div>
                <h4 className="font-semibold mb-2">Message Content:</h4>
                <div className="border rounded-lg p-4 bg-blue-50 whitespace-pre-line text-sm">
                  {selectedSms.lastMessageContent}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  handleResendSms(selectedSms.id);
                  setSelectedSms(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Resend Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Table */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {isWhatsAppEnabled ? "Message Status" : "SMS Status"}
        </h3>
        <button
          onClick={handleBulkResend}
          disabled={bulkResending}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {bulkResending ? (
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
            "Resend All Failed"
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
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
                Phone
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
                Last Sent
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Send Count
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
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  <svg
                    className="animate-spin mx-auto h-8 w-8 text-indigo-500"
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
                </td>
              </tr>
            ) : bills.filter((bill) => bill.phone).length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No message data found
                </td>
              </tr>
            ) : (
              bills
                .filter((bill) => bill.phone)
                .map((bill) => {
                  // Check if the bill is in the retry queue
                  const isRetrying = pendingRetries.some(
                    (retry) => retry.billId === bill.id
                  );

                  let statusBadge;
                  if (bill.whatsAppSent) {
                    statusBadge = (
                      <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <FaWhatsapp className="mr-1" />
                        WhatsApp Sent
                      </span>
                    );
                  } else if (bill.smsSent) {
                    statusBadge = (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        SMS Sent
                      </span>
                    );
                  } else if (isRetrying) {
                    statusBadge = (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Failed
                      </span>
                    );
                  }

                  return (
                    <tr key={bill.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{bill.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {statusBadge}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.whatsAppTimestamp
                          ? formatTimeAgo(bill.whatsAppTimestamp)
                          : bill.smsTimestamp
                          ? formatTimeAgo(bill.smsTimestamp)
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(bill.messageCount || 0) + (bill.smsCount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedSms(bill)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleResendSms(bill.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Resend
                        </button>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmsStatus;
