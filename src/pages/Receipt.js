import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MockApiService from "../services/mockApi";
import { formatCurrency } from "../utils/formatting";

const Receipt = () => {
  const { billId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        setError("");
        const bill = await MockApiService.getBillById(billId);
        setReceipt(bill);

        // Generate QR code URL for the current receipt
        const receiptUrl = window.location.href;
        const encodedUrl = encodeURIComponent(receiptUrl);
        setQrCodeUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUrl}`
        );
      } catch (err) {
        console.error("Error fetching receipt:", err);
        setError(err.message || "Failed to load receipt. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [billId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
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
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Receipt not found. The bill might not exist or has been
                  deleted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse items from itemsDetail if available, otherwise create a default item
  const parseItems = () => {
    if (Array.isArray(receipt.items)) {
      return receipt.items;
    }

    if (receipt.itemsDetail && typeof receipt.itemsDetail === "string") {
      // Try to parse item details from the string format: "Item Name - ₹Price x Quantity, ..."
      return receipt.itemsDetail.split(", ").map((itemStr, index) => {
        const parts = itemStr.split(" - ");
        if (parts.length === 2) {
          const name = parts[0];
          const priceQuantityMatch = parts[1].match(/₹(\d+(?:\.\d+)?) x (\d+)/);
          if (priceQuantityMatch) {
            const price = parseFloat(priceQuantityMatch[1]);
            const quantity = parseInt(priceQuantityMatch[2], 10);
            return { name, price, quantity };
          }
        }
        // Default if parsing fails
        return {
          name: parts[0] || `Item ${index + 1}`,
          price: receipt.total / (receipt.items || 1),
          quantity: 1,
        };
      });
    }

    // If no valid items data, create a single item with the total amount
    return [
      {
        name: "Order Total",
        price: receipt.total,
        quantity: 1,
      },
    ];
  };

  const items = parseItems();

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0">
        {/* Receipt Header */}
        <div className="border border-gray-200 rounded-lg shadow-md overflow-hidden bg-white print:shadow-none print:border-none">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 print:from-gray-800 print:to-gray-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img
                    src="/images/mammta-logo.svg"
                    alt="Mammta Logo"
                    className="h-10 w-10 mr-2 rounded-full"
                  />
                  <h1 className="text-2xl font-bold">Mammtas Food</h1>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white text-blue-800 rounded shadow hover:bg-blue-50 print:hidden"
                >
                  <div className="flex items-center">
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
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      ></path>
                    </svg>
                    Print
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-6">
            <div className="mb-6 flex justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Receipt #{receipt.id}
                </h2>
                <div className="text-sm text-gray-500">
                  {receipt.status === "paid" ? (
                    <span className="text-green-600 font-semibold flex items-center">
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
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      Paid on {formatDate(receipt.paidDate || receipt.date)}
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold flex items-center">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      Payment Pending
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Order Date:</div>
                <div className="font-medium text-gray-900">
                  {formatDate(receipt.date)}
                </div>
              </div>
            </div>

            {/* QR Code for easy receipt sharing */}
            <div className="mb-6 flex justify-center print:block print:text-center">
              <div className="flex flex-col items-center">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="Receipt QR Code"
                    className="h-32 w-32 border border-gray-200 rounded-full"
                  />
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Scan to access this receipt on mobile
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="mb-8 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="col-span-2 border-b border-gray-200 pb-2 mb-2">
                <h3 className="font-bold text-gray-900">Customer Details</h3>
              </div>
              <div>
                <div className="text-gray-500">Name:</div>
                <div className="font-medium text-gray-900">
                  {receipt.customerName}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Phone:</div>
                <div className="font-medium text-gray-900">{receipt.phone}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Address:</div>
                <div className="font-medium text-gray-900">
                  {receipt.address || "Not provided"}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <h3 className="font-bold text-gray-900">Order Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="py-3 pl-0">Item</th>
                      <th className="py-3 text-center">Quantity</th>
                      <th className="py-3 text-center">Price</th>
                      <th className="py-3 pr-0 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-4 pl-0">
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                        </td>
                        <td className="py-4 text-center text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="py-4 text-center text-gray-500">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-4 pr-0 text-right text-gray-900 font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Amount */}
            <div className="mb-8 border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-500">Subtotal:</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(receipt.total)}
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                <div>Total:</div>
                <div>{formatCurrency(receipt.total)}</div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">Payment Method:</div>
                <div className="font-medium text-gray-900 capitalize">
                  {receipt.payment?.method || "Not specified"}
                </div>
              </div>
            </div>

            {/* Share options */}
            <div className="mb-8 print:hidden">
              <div className="border-b border-gray-200 pb-2 mb-4">
                <h3 className="font-bold text-gray-900">Share Receipt</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:?subject=Receipt%20from%20Mammtas%20Food&body=View%20your%20receipt%20at:%20${encodeURIComponent(
                    window.location.href
                  )}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email
                </a>
                <a
                  href={`https://wa.me/?text=View%20your%20receipt%20from%20Mammtas%20Food:%20${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.301-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.265-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.612.136-.132.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.394-.025-.545-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.174 0-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.196-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`sms:?body=View%20your%20receipt%20from%20Mammtas%20Food:%20${encodeURIComponent(
                    window.location.href
                  )}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  SMS
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Receipt link copied to clipboard!");
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Thank you for your order!</p>
              <p className="text-center text-xs text-gray-500 mt-1">
                For any questions, please contact us at +91 XXXXXXXXXX
              </p>
              <p className="mt-2">Mammtas Food - Pune, Maharashtra</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
