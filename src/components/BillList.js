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

  // Check if WhatsApp is enabled
  const isWhatsAppEnabled =
    localStorage.getItem("useWhatsApp") === "true" ||
    localStorage.getItem("useWhatsApp") === null;

  // Handle sending SMS for a bill
  const handleSendSMS = async (billId) => {
    try {
      // Update state to show loading
      setSmsSending((prev) => ({ ...prev, [billId]: true }));

      // Call the API service to send SMS
      const result = await MockApiService.sendBillSMS(billId);

      // Update results state
      setSmsResults((prev) => ({
        ...prev,
        [billId]: { success: true, message: result.message },
      }));

      // If refresh function is provided, call it to update bills data
      if (typeof refresh === "function") {
        refresh();
      }
    } catch (error) {
      console.error("Failed to send SMS:", error);
      setSmsResults((prev) => ({
        ...prev,
        [billId]: { success: false, message: error.message },
      }));
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

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Bill
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
              Total
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
          {bills.map((bill) => (
            <tr key={bill.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                    <FaFileInvoice />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      #{bill.id}
                    </div>
                    <div className="text-sm text-gray-500">{bill.date}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{bill.customerName}</div>
                <div className="text-sm text-gray-500">{bill.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(bill.total)}
                </div>
                <div className="text-sm text-gray-500">
                  {bill.items} {bill.items === 1 ? "item" : "items"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onViewBill(bill.id)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  View
                </button>
                <button
                  onClick={() => onEditBill(bill.id)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleSendSMS(bill.id)}
                  disabled={smsSending[bill.id]}
                  className={`text-blue-600 hover:text-blue-900 inline-flex items-center ${
                    smsSending[bill.id] ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isWhatsAppEnabled ? (
                    <FaWhatsapp className="mr-1 text-green-600" />
                  ) : (
                    <FaEnvelope className="mr-1" />
                  )}{" "}
                  {isWhatsAppEnabled ? "WhatsApp" : "SMS"}
                  {smsSending[bill.id] && (
                    <svg
                      className="animate-spin ml-2 h-4 w-4 text-blue-500"
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
                  )}
                </button>
                {smsResults[bill.id] && (
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      smsResults[bill.id].success
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {smsResults[bill.id].success && (
                      <FaCheckCircle className="mr-1" />
                    )}
                    {smsResults[bill.id].message}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillList;
