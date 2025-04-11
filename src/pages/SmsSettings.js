import React, { useState } from "react";

const SmsSettings = () => {
  // State for WhatsApp setting
  const [useWhatsApp, setUseWhatsApp] = useState(() => {
    return localStorage.getItem("useWhatsApp") === null
      ? true
      : localStorage.getItem("useWhatsApp") === "true";
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Handle WhatsApp toggle change
  const handleWhatsAppChange = (e) => {
    const newValue = e.target.checked;
    setUseWhatsApp(newValue);
    localStorage.setItem("useWhatsApp", newValue);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-semibold mb-4">Notification Settings</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-blue-700">
          Configure your notification settings for bill notifications.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">Settings saved successfully!</p>
        </div>
      )}

      <form>
        {/* WhatsApp toggle */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useWhatsApp"
              checked={useWhatsApp}
              onChange={handleWhatsAppChange}
              className="mr-2 h-5 w-5 text-blue-600"
            />
            <label
              htmlFor="useWhatsApp"
              className="text-yellow-700 font-medium"
            >
              Enable WhatsApp Notifications
            </label>
          </div>
          <p className="text-yellow-600 mt-2 text-sm">
            When enabled, bill notifications will be sent via WhatsApp.
          </p>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Message Preview
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Here's a preview of how messages will look to your customers:
        </p>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 whitespace-pre-line text-sm mb-4">
          <strong>Bill Notification Template:</strong>
          <div className="mt-2 bg-white p-3 rounded border border-gray-200">
            📋 BILL NOTIFICATION
            <br />
            <br />
            Dear [Customer Name],
            <br />
            <br />
            Your bill from Mammtas Food is ready!
            <br />
            <br />
            📌 Bill #123
            <br />
            📆 Date: 2023-05-01
            <br />
            🛒 Items:
            <br />
            Product A x2 - ₹200.00
            <br />
            Product B x1 - ₹150.00
            <br />
            💰 Total Amount: ₹350.00
            <br />
            📊 Status: PENDING
            <br />
            <br />
            Your payment is pending.
            <br />
            <br />
            📱 Pay via UPI: 9309908454@ybl
            <br />
            <br />
            Note: Updates will be sent via WhatsApp
            <br />
            <br />
            📞 For assistance: +91 XXXXXXXXXX
            <br />
            💼 Mammtas Food
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsSettings;
