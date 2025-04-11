import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { useNavigate } from "react-router-dom";
import MockApiService from "../services/mockApi";

// Predefined chicken food items with their prices
const chickenItems = [
  { name: "Frozen Chicken Breast", price: 299 },
  { name: "Chicken Nuggets", price: 249 },
  { name: "Chicken Wings (Spicy)", price: 279 },
  { name: "Chicken Drumsticks", price: 259 },
  { name: "Chicken Sausages", price: 229 },
  { name: "Tandoori Chicken", price: 329 },
  { name: "Butter Chicken", price: 349 },
  { name: "Chicken Tikka", price: 319 },
  { name: "BBQ Chicken", price: 299 },
  { name: "Grilled Chicken", price: 289 },
];

const BillingForm = () => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [items, setItems] = useState([
    { id: 1, name: "", quantity: 1, price: 0 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pending");

  // Check localStorage for a selected product when component mounts
  useEffect(() => {
    const selectedProductString = localStorage.getItem("selectedProduct");
    if (selectedProductString) {
      try {
        const selectedProduct = JSON.parse(selectedProductString);
        if (selectedProduct && selectedProduct.name && selectedProduct.price) {
          // Add the selected product to the items list
          setItems([
            {
              id: 1,
              name: selectedProduct.name,
              quantity: 1,
              price: selectedProduct.price,
            },
          ]);

          // Show a success message
          setSuccessMessage(`Added ${selectedProduct.name} to your bill!`);

          // Clear the localStorage item after using it
          localStorage.removeItem("selectedProduct");

          // Auto-scroll to the items section
          setTimeout(() => {
            const itemsSection = document.querySelector(".items-section");
            if (itemsSection) {
              itemsSection.scrollIntoView({ behavior: "smooth" });
            }
          }, 500);
        }
      } catch (e) {
        console.error("Error parsing selected product:", e);
        localStorage.removeItem("selectedProduct");
      }
    }
  }, []);

  // Generate a base64 QR code image (in a real app, this would be from a real UPI QR API)
  const getQRCodeImage = () => {
    // This is a placeholder. In a real app, you would:
    // 1. Use a QR code generation library or API
    // 2. Generate a UPI link with payee details and amount
    // For now, we'll return a sample QR code as a base64 string
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOPSURBVO3BQY4cSRLAQDLQ//8yV0c/JZCoain2Yma/cPiL4/AP4fAPh38Ih38Ih38Ih38Ih38Ih38Ih38Ih38Ih38I//+PP/7rvwb4CsJXEG6QtxC+gnCDvIXwFYQb5C2Ev0G4Qd5C+ArCDfIWwlcQbpC3EL6C8BbCVxBukLcQvoJwg7yF8BWEryDcIG8hfAXhBnkL4SsIN8hbCF9BuEHeQvgKwg3yFsJXEG6QtxC+gnCDvIXwFYQb5F9C+ArCDfIWwg3yFsJXEG6QtxC+gnCDvIVwg7yF8BWEtxBukLcQvoJwg7yF8BWEryDcIG8hfAXhBnkL4QbhLYSvINwgbyHcIG8h3CBvIdwgbyHcIG8h3CD/EsINwg3CWwg3CDcINwg3CDcINwg3CDcINwg3CDcINwg3CG8h3CDcINwg3CDcINwg3CDcINwg3CD/MoQbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4R/CeEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhD+hxFuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhD+JgQbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEtxBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhD+hxFuEG4QbhBuEG4QbhBuEG4QbhBuEG4QbhBuEP4mCDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcIN8j/MMINwg3CDcJbCDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcIN8hbCDcINwg3CDcINwg3CDcI/zDCDcINwg3CDcINwg3CDcINwg3CDcINwg3CDcINwlsINwg3CDcINwg3CDcINwg3CDcINwg3CDcI//HF4f8Ah38Ih38Ih38Ih38Ih38Ih38Ih38I/wNDXzqf42KP8QAAAABJRU5ErkJggg==";
  };

  // Validate phone number
  const validatePhone = (phone) => {
    if (!phone || phone.trim() === "") {
      return "Phone number is required to send bill details via SMS.";
    }

    // Improved validation with better error messages
    // eslint-disable-next-line no-useless-escape
    const phoneRegex = /^[0-9\+\-\(\) ]{6,20}$/;
    if (!phoneRegex.test(phone)) {
      if (phone.length < 6) {
        return "Phone number is too short. Please enter a valid phone number.";
      } else if (phone.length > 20) {
        return "Phone number is too long. Please enter a valid phone number.";
        // eslint-disable-next-line no-useless-escape
      } else if (!/^[0-9\+\-\(\) ]+$/.test(phone)) {
        return "Phone number contains invalid characters. Use only digits, spaces, and + - ( ).";
      }
      return "Please enter a valid phone number in the format: +91 9876543210";
    }

    return ""; // No error
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    // Clear phone error when phone is being edited
    if (name === "phone") {
      setPhoneError("");
    }

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (id, field, value) => {
    if (field === "name") {
      // If we're changing the name via dropdown, auto-populate the price
      const selectedItem = chickenItems.find((item) => item.name === value);
      if (selectedItem) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, name: value, price: selectedItem.price }
              : item
          )
        );
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          )
        );
      }
    } else if (field === "quantity") {
      // Update the quantity while preserving the original price per unit
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const quantity = parseInt(value) || 1;
            // Make sure quantity is at least 1
            return { ...item, quantity: Math.max(1, quantity) };
          }
          return item;
        })
      );
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    }
  };

  const addItem = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
    setItems((prev) => [
      ...prev,
      { id: newId, name: "", quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const calculateTotal = () => {
    return items
      .reduce((total, item) => {
        return total + item.quantity * item.price;
      }, 0)
      .toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number
    const phoneError = validatePhone(customer.phone);
    if (phoneError) {
      setPhoneError(phoneError);
      return;
    }

    if (items.some((item) => !item.name || !item.price)) {
      setSubmitError("Please fill out all item details");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      // Format detailed items list for display in SMS
      const itemsDetail = items
        .map(
          (item) =>
            `${item.name} x${item.quantity} - ₹${(
              item.price * item.quantity
            ).toFixed(2)}`
        )
        .join(", ");

      // Calculate total
      // eslint-disable-next-line no-unused-vars
      const totalAmount = calculateTotal();

      // Prepare customer data with payment status
      const customerDataWithPayment = {
        ...customer,
        paymentStatus: paymentMethod, // 'pending' or 'paid'
      };

      // Create the bill
      const response = await MockApiService.createBill(
        customerDataWithPayment,
        items,
        itemsDetail
      );

      console.log(
        `Bill created: #${response.id}, Payment Method: ${paymentMethod}`
      );

      // Store receipt URL if the bill is immediately paid
      let receiptUrl = null;

      // If payment is marked as received, update bill status
      if (paymentMethod === "paid") {
        try {
          const paymentResult = await MockApiService.markBillAsPaid(
            response.id
          );
          console.log("Bill marked as paid:", paymentResult);

          // Check if receipt is available
          if (paymentResult.receiptUrl) {
            console.log("Receipt URL:", paymentResult.receiptUrl);
            receiptUrl = paymentResult.receiptUrl;
          }
        } catch (paymentErr) {
          console.error("Failed to mark bill as paid:", paymentErr);
        }
      }

      console.log(
        `Sending message to ${customer.phone} for bill #${response.id}...`
      );

      // Try to send notification
      let messageSuccess = false;
      let messageReceiptUrl = null;
      let attempts = 0;
      const maxAttempts = 2;

      while (!messageSuccess && attempts < maxAttempts) {
        attempts++;
        try {
          console.log(
            `Attempting to send notification (attempt ${attempts}/${maxAttempts})...`
          );
          const messageResult = await MockApiService.sendBillSMS(
            response.id,
            customer.phone
          );
          console.log("Message result:", messageResult);
          messageSuccess = true;

          // Store the receipt URL from the message result if available
          if (messageResult.receiptUrl) {
            messageReceiptUrl = messageResult.receiptUrl;
          }
        } catch (err) {
          console.error(`Message sending attempt ${attempts} failed:`, err);
          if (attempts < maxAttempts) {
            // Wait before retrying
            const delayMs = 1000;
            console.log(`Waiting ${delayMs}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }

      // Reset form state
      resetForm();

      // Use the receipt URL from either the payment or message result
      const finalReceiptUrl = receiptUrl || messageReceiptUrl;

      // Show success message with notification status
      if (messageSuccess) {
        if (paymentMethod === "paid" && finalReceiptUrl) {
          setSuccessMessage(
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-green-800 font-medium">
                    Bill created successfully! Receipt has been sent to
                    customer.
                  </span>
                  <p className="text-sm text-green-700 mt-1">
                    You can also share the receipt directly:
                  </p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={finalReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    View Receipt
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(finalReceiptUrl);
                      alert("Receipt link copied to clipboard!");
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          );
        } else {
          setSuccessMessage(
            <div className="bg-green-50 p-4 rounded-lg">
              <span className="text-green-800 font-medium">
                Bill created successfully!{" "}
                {paymentMethod === "paid"
                  ? "Receipt link has been sent to customer."
                  : "Payment link has been sent to customer."}
              </span>
            </div>
          );
        }
      } else {
        setSuccessMessage(
          <div className="bg-yellow-50 p-4 rounded-lg">
            <span className="text-yellow-800 font-medium">
              Bill created successfully, but could not send notification after{" "}
              {maxAttempts} attempts. The system will automatically retry
              sending in the background.
            </span>
          </div>
        );
      }

      // Clear success message after 8 seconds (increased from 5 seconds to give user more time to click receipt link)
      setTimeout(() => {
        setSuccessMessage("");
      }, 8000);
    } catch (error) {
      console.error("Error creating bill:", error);
      setSubmitError(
        `Failed to submit bill: ${error.message || "Please try again later."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomer({ name: "", phone: "", email: "", address: "" });
    setItems([{ id: 1, name: "", quantity: 1, price: 0 }]);
    setPaymentMethod("pending");
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Bill</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
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
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customer Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Enter the customer's details for billing purposes.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={customer.name}
                      onChange={handleCustomerChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 flex items-center"
                  >
                    Phone number
                    <span className="ml-1 text-red-500">*</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                      Required for SMS
                    </span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={customer.phone}
                      onChange={handleCustomerChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                        phoneError
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      required
                      placeholder="e.g. +91 9876543210"
                    />
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      All bills will automatically send SMS notifications to
                      this number
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={customer.email}
                      onChange={handleCustomerChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={customer.address}
                      onChange={handleCustomerChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg items-section">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Items
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Add items to the bill.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor={`item-name-${item.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Item
                        </label>
                        <select
                          id={`item-name-${item.id}`}
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, "name", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select an item</option>
                          {chickenItems.map((chicken) => (
                            <option key={chicken.name} value={chicken.name}>
                              {chicken.name} (₹{chicken.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`item-quantity-${item.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Quantity
                        </label>
                        <input
                          type="number"
                          id={`item-quantity-${item.id}`}
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              parseInt(e.target.value)
                            )
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`item-price-${item.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Unit Price (₹)
                        </label>
                        <input
                          type="number"
                          id={`item-price-${item.id}`}
                          min="0"
                          step="0.01"
                          value={item.price}
                          readOnly
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`item-total-${item.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Total (₹)
                        </label>
                        <input
                          type="text"
                          id={`item-total-${item.id}`}
                          value={(item.price * item.quantity).toFixed(2)}
                          readOnly
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="flex items-end">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Total Amount
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                The total amount for the bill.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="text-3xl font-bold text-gray-900">
                ₹{calculateTotal()}
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment Options
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Select the payment method for this bill.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-6">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      Select Payment Status:
                    </h4>
                    <div
                      className="flex items-center mb-4 p-3 rounded-lg border-2 border-gray-200 hover:border-yellow-400 transition-colors cursor-pointer"
                      onClick={() => setPaymentMethod("pending")}
                    >
                      <input
                        id="payment-pending"
                        name="payment-method"
                        type="radio"
                        checked={paymentMethod === "pending"}
                        onChange={() => setPaymentMethod("pending")}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <svg
                          className="h-5 w-5 text-yellow-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <span className="block text-sm font-medium text-gray-700">
                            Pending Payment
                          </span>
                          <span className="block text-xs text-gray-500">
                            Mark as unpaid (payment will be collected later)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center mb-4 p-3 rounded-lg border-2 border-gray-200 hover:border-green-400 transition-colors cursor-pointer"
                      onClick={() => setPaymentMethod("paid")}
                    >
                      <input
                        id="payment-paid"
                        name="payment-method"
                        type="radio"
                        checked={paymentMethod === "paid"}
                        onChange={() => setPaymentMethod("paid")}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <div>
                          <span className="block text-sm font-medium text-gray-700">
                            Payment Received
                          </span>
                          <span className="block text-xs text-gray-500">
                            Mark as paid (payment has been received)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg text-center">
                      {paymentMethod === "pending" && (
                        <>
                          <div className="mb-4">
                            <svg
                              className="mx-auto h-12 w-12 text-yellow-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="text-gray-900 font-medium">
                            Pending Payment
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Payment will be collected later
                          </p>
                          <p className="text-sm text-gray-700 mt-2 bg-yellow-50 p-2 rounded text-xs">
                            Customer can pay later using the payment link sent
                            via SMS
                          </p>
                        </>
                      )}
                      {paymentMethod === "paid" && (
                        <>
                          <div className="mb-4">
                            <img
                              src={getQRCodeImage()}
                              alt="UPI QR Code"
                              className="w-32 h-32 mx-auto"
                            />
                          </div>
                          <div className="text-gray-900 font-medium">
                            UPI Payment
                          </div>
                          <div className="text-sm text-gray-600 text-center mt-1 font-light">
                            UPI ID: 9309908454@ybl
                          </div>
                          <p className="text-sm text-gray-700 mt-2 bg-green-50 p-2 rounded text-xs">
                            Scan the QR code to confirm payment
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingForm;
