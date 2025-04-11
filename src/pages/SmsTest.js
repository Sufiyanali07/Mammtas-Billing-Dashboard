import React, { useState, useEffect } from "react";
import MockApiService from "../services/mockApi";
import TwilioService from "../services/twilio";
import { FaWhatsapp } from "react-icons/fa";

// eslint-disable-next-line no-unused-vars
function SmsTest() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [directTest, setDirectTest] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [showTwilioForm, setShowTwilioForm] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [settings, setSettings] = useState({
    accountSid: "",
    authToken: "",
    fromNumber: "",
  });

  // eslint-disable-next-line no-unused-vars
  const twilioSettings = JSON.parse(
    localStorage.getItem("twilioSettings") || "{}"
  );

  // Load current Twilio settings
  useEffect(() => {
    const settings = TwilioService.getSettings();
    setSettings(settings);
  }, []);

  // Check if WhatsApp is enabled
  const isWhatsAppEnabled =
    localStorage.getItem("useWhatsApp") === "true" ||
    localStorage.getItem("useWhatsApp") === null;

  // eslint-disable-next-line no-unused-vars
  const handleDirectTwilioTest = async (e) => {
    // Direct Twilio API test implementation
  };

  // Handle send test message (using either WhatsApp or SMS based on settings)
  const handleSendTest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      // Create a test bill with the custom message
      const testResult = await MockApiService.testSendSMS(phone);
      setResult(testResult);
      console.log("Test result:", testResult);
    } catch (err) {
      console.error("Test error:", err);
      setError(err.message || "An error occurred during the message test");
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSmsFallbackTest = async () => {
    // SMS fallback implementation
  };

  // Format phone number for WhatsApp API
  const formatPhoneForWhatsApp = (phone) => {
    // eslint-disable-next-line no-useless-escape
    let formatted = phone.replace(/[\s\-\(\)]/g, "");
    if (!formatted.startsWith("+")) {
      formatted = "+91" + formatted;
    }
    return formatted;
  };

  // Add WhatsApp direct message function
  const handleWhatsAppMessage = () => {
    try {
      const formattedPhone = formatPhoneForWhatsApp(phone);
      // eslint-disable-next-line no-useless-escape
      const whatsappUrl = `https://wa.me/${formattedPhone.replace(
        "+",
        ""
      )}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank");

      // Set success result
      setResult({
        success: true,
        message: "WhatsApp message opened in new window",
        details: {
          to: phone,
          body: message,
          status: "sent",
          sid: "WHATSAPP_DIRECT_" + Date.now(),
        },
      });
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      setResult({
        success: false,
        message: `Failed to open WhatsApp: ${error.message}`,
      });
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Message Test</h1>
        <p className="mt-2 text-sm text-gray-500">
          Use this tool to test message sending functionality
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {isWhatsAppEnabled && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaWhatsapp className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 font-medium">
                  WhatsApp messaging is enabled
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Messages will be sent via WhatsApp for better delivery
                  reliability. You can change this in the{" "}
                  <a href="/sms-settings" className="underline font-medium">
                    SMS Settings
                  </a>{" "}
                  page.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isWhatsAppEnabled ? "WhatsApp Message Test" : "SMS Test"}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {isWhatsAppEnabled
                ? "Test sending a WhatsApp message to your customers"
                : "Test sending an SMS using your configured Twilio settings"}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSendTest} className="space-y-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter a valid phone number with country code
                </p>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <div className="mt-1">
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This message will be sent to the specified phone number
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {isWhatsAppEnabled ? (
                  <>
                    <button
                      type="button"
                      onClick={handleWhatsAppMessage}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      disabled={isLoading}
                    >
                      <FaWhatsapp className="mr-2" />
                      Open in WhatsApp
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send via System"}
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send SMS"}
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {result && (
                <div
                  className={`mt-6 p-4 ${
                    result.success
                      ? "bg-green-50 border-l-4 border-green-400"
                      : "bg-red-50 border-l-4 border-red-400"
                  }`}
                >
                  <h4
                    className={`text-lg font-medium ${
                      result.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {result.success
                      ? "Message Test Successful"
                      : "Message Test Failed"}
                  </h4>
                  <p
                    className={`mt-2 text-sm ${
                      result.success ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.message ||
                      (result.success
                        ? "Message sent successfully!"
                        : "Failed to send message.")}
                  </p>
                  {result.success &&
                    (result.details || result.twilioResponse) && (
                      <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          <li>
                            <div className="px-4 py-3 sm:px-6">
                              <p className="text-sm font-medium text-gray-500">
                                Recipient:
                              </p>
                              <p className="mt-1 text-sm text-gray-900">
                                {phone}
                              </p>
                            </div>
                          </li>
                          <li>
                            <div className="px-4 py-3 sm:px-6">
                              <p className="text-sm font-medium text-gray-500">
                                Message ID:
                              </p>
                              <p className="mt-1 text-sm text-gray-900">
                                {result.details?.sid ||
                                  result.twilioResponse?.sid ||
                                  "N/A"}
                              </p>
                            </div>
                          </li>
                          <li>
                            <div className="px-4 py-3 sm:px-6">
                              <p className="text-sm font-medium text-gray-500">
                                Status:
                              </p>
                              <p className="mt-1 text-sm text-gray-900">
                                {result.details?.status ||
                                  result.twilioResponse?.status ||
                                  "sent"}
                              </p>
                            </div>
                          </li>
                          <li>
                            <div className="px-4 py-3 sm:px-6">
                              <p className="text-sm font-medium text-gray-500">
                                Message:
                              </p>
                              <div className="mt-1 p-2 bg-gray-50 rounded">
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {message}
                                </pre>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmsTest;
