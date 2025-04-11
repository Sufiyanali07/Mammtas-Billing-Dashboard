import React, { useState, useEffect } from "react";
import {
  FaFileInvoice,
  FaEnvelope,
  FaCheckCircle,
  FaWhatsapp,
} from "react-icons/fa";
import MockApiService from "../services/mockApi";
import { formatCurrency } from "../utils/formatting";

const BillList = ({ bills, onEditBill, onViewBill, refresh }) => {
  const [smsSending, setSmsSending] = useState({});
  const [smsResults, setSmsResults] = useState({});
  const [whatsAppStatus, setWhatsAppStatus] = useState({});

  // Check if WhatsApp is enabled
  const isWhatsAppEnabled =
    localStorage.getItem("useWhatsApp") === "true" ||
    localStorage.getItem("useWhatsApp") === null;

  // Handle sending WhatsApp message for a bill
  const handleSendWhatsApp = async (billId) => {
    try {
      // Update state to show loading
      setSmsSending((prev) => ({ ...prev, [billId]: true }));
      setWhatsAppStatus((prev) => ({ ...prev, [billId]: "sending" }));

      // Call the API service to send WhatsApp message
      const result = await MockApiService.sendBillSMS(billId);

      // Update results state
      setSmsResults((prev) => ({
        ...prev,
        [billId]: { success: true, message: result.message },
      }));
      setWhatsAppStatus((prev) => ({ ...prev, [billId]: "sent" }));

      // If refresh function is provided, call it to update bills data
      if (typeof refresh === "function") {
        refresh();
      }
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      setSmsResults((prev) => ({
        ...prev,
        [billId]: { success: false, message: error.message },
      }));
      setWhatsAppStatus((prev) => ({ ...prev, [billId]: "failed" }));
    } finally {
      // Clear loading state
      setTimeout(() => {
        setSmsSending((prev) => ({ ...prev, [billId]: false }));
      }, 500);

      // Clear result message after 5 seconds
      setTimeout(() => {
        setSmsResults((prev) => {
          const newResults = { ...prev };
          delete newResults[billId];
          return newResults;
        });
      }, 5000);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {isWhatsAppEnabled && (
        <div className="bg-green-50 p-3 border-l-4 border-green-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaWhatsapp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                WhatsApp messaging is enabled. Bill notifications will be sent
                via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bill ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {bill.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {bill.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(bill.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(bill.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bill.status === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : bill.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onViewBill(bill.id)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEditBill(bill.id)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(bill.id)}
                    disabled={smsSending[bill.id]}
                    className={`inline-flex items-center ${
                      smsSending[bill.id]
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:text-blue-900 dark:hover:text-blue-300"
                    } ${
                      whatsAppStatus[bill.id] === "sent"
                        ? "text-green-600 dark:text-green-400"
                        : whatsAppStatus[bill.id] === "failed"
                        ? "text-red-600 dark:text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {isWhatsAppEnabled ? (
                      <FaWhatsapp className="mr-1" />
                    ) : (
                      <FaEnvelope className="mr-1" />
                    )}
                    {smsSending[bill.id]
                      ? "Sending..."
                      : whatsAppStatus[bill.id] === "sent"
                      ? "Sent"
                      : whatsAppStatus[bill.id] === "failed"
                      ? "Failed"
                      : isWhatsAppEnabled
                      ? "WhatsApp"
                      : "SMS"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillList;
