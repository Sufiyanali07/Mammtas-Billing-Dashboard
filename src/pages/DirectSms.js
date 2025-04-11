import React, { useState } from "react";

const DirectSms = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("Test message from billing system");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Function to generate Node.js code for direct implementation
  const generateNodeCode = () => {
    return `// Save this as send-sms.js and run with: node send-sms.js
const accountSid = 'DUMMY_ACCOUNT_SID';
const authToken = 'DUMMY_AUTH_TOKEN';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
    body: '${message}',
    from: '+10000000000',
    to: '${phoneNumber}'
  })
  .then(message => console.log(message.sid))
  .catch(error => console.error(error));`;
  };

  // Function to handle form submission
  const handleSendTwilioCode = (e) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);
    setError("");

    try {
      // Format phone number by removing spaces
      const formattedPhone = phoneNumber.replace(/\s+/g, "");

      // Generate the Node.js code
      const nodeCode = generateNodeCode();

      // Set the result
      setResult({
        success: true,
        code: nodeCode,
        phone: formattedPhone,
        message: message,
      });
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  // Function to handle copying code to clipboard
  const handleCopyCode = () => {
    if (result && result.code) {
      navigator.clipboard
        .writeText(result.code)
        .then(() => {
          alert("Code copied to clipboard!");
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Direct Twilio Implementation
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          This page provides Node.js code that will directly send SMS using
          Twilio.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 font-medium">
                Important Instructions
              </p>
              <p className="mt-1 text-sm text-blue-600">
                The browser cannot directly send SMS due to security
                restrictions. This page generates Node.js code that you can run
                in a terminal or server to send the message directly using
                Twilio's API.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Generate Twilio SMS Code
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Enter a phone number and message to generate Node.js code for
              sending SMS.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSendTwilioCode} className="space-y-6">
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
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isSending}
                >
                  {isSending ? "Generating..." : "Generate Code"}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Node.js Code to Send SMS
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Follow these steps to send the SMS:
                </p>
                <ol className="list-decimal list-inside mb-4 text-sm text-gray-600">
                  <li>Copy the code below</li>
                  <li>
                    Create a new file named{" "}
                    <code className="bg-gray-100 px-1">send-sms.js</code>
                  </li>
                  <li>
                    Install Twilio npm package:{" "}
                    <code className="bg-gray-100 px-1">npm install twilio</code>
                  </li>
                  <li>
                    Run the script:{" "}
                    <code className="bg-gray-100 px-1">node send-sms.js</code>
                  </li>
                </ol>
                <div className="bg-gray-800 rounded-md p-4 mb-4">
                  <pre className="text-gray-100 whitespace-pre-wrap text-sm">
                    {result.code}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Copy Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectSms;
