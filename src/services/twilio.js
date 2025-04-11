// Twilio API service for sending SMS
// Note: In a real production app, these API calls would happen on the server side
// For this demo, we're implementing Twilio integration directly in the frontend

// Default Twilio configuration (DUMMY VALUES FOR DEMO PURPOSES ONLY)
const DEFAULT_TWILIO_ACCOUNT_SID = "DUMMY_ACCOUNT_SID";
const DEFAULT_TWILIO_AUTH_TOKEN = "DUMMY_AUTH_TOKEN";
const DEFAULT_TWILIO_PHONE_NUMBER = "+10000000000";

// Helper function to get Twilio settings from localStorage or use defaults
const getTwilioConfig = () => {
  try {
    const saved = localStorage.getItem("twilioSettings");
    if (saved) {
      const settings = JSON.parse(saved);
      return {
        accountSid: settings.accountSid || DEFAULT_TWILIO_ACCOUNT_SID,
        authToken: settings.authToken || DEFAULT_TWILIO_AUTH_TOKEN,
        fromNumber: settings.fromNumber || DEFAULT_TWILIO_PHONE_NUMBER,
        enabled: settings.enabled !== undefined ? settings.enabled : true,
        // Force simulation mode since we don't have real credentials
        simulationMode: true,
      };
    }
  } catch (error) {
    console.error("[TWILIO] Error loading Twilio settings:", error);
  }

  // Return defaults if no settings or error
  return {
    accountSid: DEFAULT_TWILIO_ACCOUNT_SID,
    authToken: DEFAULT_TWILIO_AUTH_TOKEN,
    fromNumber: DEFAULT_TWILIO_PHONE_NUMBER,
    enabled: true,
    // Force simulation mode since we don't have real credentials
    simulationMode: true,
  };
};

// Function to call Twilio API through a proxy service
const callTwilioAPI = async (to, message, from) => {
  try {
    const config = getTwilioConfig();

    // Force simulation mode for GitHub version
    if (config.simulationMode) {
      console.log("[TWILIO] Simulation mode active - skipping real API call");
      // Return a simulated successful response
      return {
        sid: "SIM_" + Math.random().toString(36).substring(2, 15),
        to: to,
        from: from,
        status: "delivered",
        body: message,
        date_created: new Date().toISOString(),
        price: "0.00",
        price_unit: "USD",
      };
    }

    // Code for real API calls - will only run if simulation mode is disabled
    const data = new URLSearchParams();
    data.append("To", to);
    data.append("From", from);
    data.append("Body", message);

    const response = await fetch(
      "https://example.com/api/send-sms", // Replace with your backend URL in production
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer DUMMY_API_KEY", // Replace with real auth in production
        },
        body: JSON.stringify({
          to: to,
          from: from,
          message: message,
          accountSid: config.accountSid,
          authToken: config.authToken,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`SMS API error: ${errorData}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("[TWILIO] API call failed:", error);
    throw error;
  }
};

// Helper function to format SMS content
const formatSmsContent = (bill, billId, paymentLink, receiptUrl) => {
  // Generate a properly formatted date string
  const formattedDate = new Date(bill.date).toLocaleDateString();

  // Format the currency properly
  const formattedAmount = `₹${bill.total.toFixed(2)}`;

  // Format items list
  let itemsSection = "";
  if (bill.itemsDetail && bill.itemsDetail.length > 0) {
    // Use detailed item information
    itemsSection = `🛒 Items:\n${bill.itemsDetail.split(", ").join("\n")}\n`;
  } else {
    // Fallback to simple count
    itemsSection = `🛒 Items: ${bill.items} items\n`;
  }

  // Generate different content based on payment status
  let statusSpecificContent = "";
  if (bill.status === "pending") {
    statusSpecificContent = `Your payment is pending.\n\n📱 Pay via UPI: 9309908454@ybl\n\nNote: Updates will be sent via SMS`;
  } else if (bill.status === "paid") {
    statusSpecificContent = `Thank you for your payment!\n\n🧾 View receipt: ${receiptUrl}\n\nImportant: Save this message to access your receipt anytime.`;
  } else if (bill.status === "cancelled") {
    statusSpecificContent = `This bill has been cancelled. Please contact us if you have any questions.`;
  }

  // Create the full message with proper encoding
  return [
    "📋 BILL NOTIFICATION",
    "",
    `Dear ${bill.customerName},`,
    "",
    "Your bill from Mammtas Food is ready!",
    "",
    `📌 Bill #${billId}`,
    `📆 Date: ${formattedDate}`,
    `${itemsSection}💰 Total Amount: ${formattedAmount}`,
    `📊 Status: ${bill.status.toUpperCase()}`,
    "",
    statusSpecificContent,
    "",
    "📞 For assistance: +91 XXXXXXXXXX",
    "🏪 Mammta's Food",
  ].join("\n");
};

// TwilioService
const TwilioService = {
  // Send SMS via Twilio API
  sendSms: async (to, message) => {
    try {
      // Get Twilio configuration
      const config = getTwilioConfig();

      console.log(`[TWILIO] Sending SMS to ${to}`);
      console.log(`[TWILIO] Message length: ${message.length} characters`);
      console.log(`[TWILIO] Message preview: ${message.substring(0, 50)}...`);
      console.log(
        `[TWILIO] Using Account SID: ${config.accountSid.substring(0, 8)}...`
      );
      console.log(`[TWILIO] Using From Number: ${config.fromNumber}`);

      // Check if SMS is enabled in settings
      if (!config.enabled) {
        console.log(
          "[TWILIO] SMS sending is disabled in settings. Simulating success."
        );
        return {
          success: true,
          sid: "DISABLED_" + Math.random().toString(36).substring(2, 15),
          to: to,
          from: config.fromNumber,
          status: "simulated",
        };
      }

      // Check if phone number is valid
      if (!to || to.trim() === "") {
        throw new Error("Invalid phone number");
      }

      // Basic phone number format validation
      // eslint-disable-next-line no-useless-escape
      if (!/^\+?[0-9\s\-\(\)]{6,20}$/.test(to)) {
        console.warn(`[TWILIO] Phone number format may be invalid: ${to}`);
        // We'll still proceed but log a warning
      }

      // Format the phone number to ensure it's in the correct format for Twilio
      let formattedPhoneNumber = to.replace(/\s+/g, "");
      if (!formattedPhoneNumber.startsWith("+")) {
        // Add international code if missing
        formattedPhoneNumber = `+${formattedPhoneNumber}`;
      }

      try {
        // Attempt to call real Twilio API
        console.log(
          `[TWILIO] Attempting to call Twilio API with phone: ${formattedPhoneNumber}`
        );

        // Try to call Twilio API directly
        const apiResult = await callTwilioAPI(
          formattedPhoneNumber,
          message,
          config.fromNumber
        );

        console.log(`[TWILIO] API call successful:`, apiResult);

        return {
          success: true,
          sid:
            apiResult.sid ||
            "API_" + Math.random().toString(36).substring(2, 15),
          to: formattedPhoneNumber,
          from: config.fromNumber,
          status: apiResult.status || "sent",
        };
      } catch (apiError) {
        console.error(`[TWILIO] API call failed:`, apiError);
        // Fall back to simulation for demo purposes
        console.log(`[TWILIO] Falling back to simulated SMS due to API error`);

        // Simulate successful SMS sending with Twilio
        console.log(
          `[TWILIO] SMS sent successfully to ${formattedPhoneNumber} (SIMULATED)`
        );

        return {
          success: true,
          sid: "SIM_" + Math.random().toString(36).substring(2, 15),
          to: formattedPhoneNumber,
          from: config.fromNumber,
          status: "sent (simulated after API error)",
          error: apiError.message,
        };
      }
    } catch (error) {
      console.error("[TWILIO] Error sending SMS:", error);
      throw new Error(`Twilio SMS sending failed: ${error.message}`);
    }
  },

  // Send bill notification via SMS
  sendBillNotification: async (bill, billId) => {
    try {
      console.log(`[TWILIO] Starting bill notification for bill #${billId}`);
      console.log(`[TWILIO] Bill details:`, JSON.stringify(bill, null, 2));

      // Use the phone number from the bill object
      if (!bill.phone) {
        throw new Error("No phone number provided for sending SMS");
      }

      console.log(`[TWILIO] Using phone number: ${bill.phone}`);

      // Generate public receipt URL with the correct origin for customer-facing use
      const receiptUrl = `${window.location.origin}/p/receipt/${billId}`;

      // For pending bills, don't use a payment link URL, use the UPI ID instead
      // For paid bills, use the receipt URL
      const paymentLink =
        bill.status === "pending" ? "9309908454@ybl" : receiptUrl;

      console.log(`[TWILIO] Payment link: ${paymentLink}`);

      // Format SMS content
      const messageContent = formatSmsContent(
        bill,
        billId,
        paymentLink,
        receiptUrl
      );

      // Send SMS using Twilio
      console.log(
        `[TWILIO] Calling sendSms function with phone: ${bill.phone}`
      );

      // Try to send via server
      try {
        const config = getTwilioConfig();

        // First try to send via a proxy server if available
        const serverResponse = await fetch(
          "https://example.com/api/send-sms",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: bill.phone,
              from: config.fromNumber,
              body: messageContent,
              accountSid: config.accountSid,
              authToken: config.authToken,
            }),
          }
        );

        if (serverResponse.ok) {
          const data = await serverResponse.json();
          console.log("[TWILIO] Server proxy response:", data);

          if (data.success) {
            return {
              success: true,
              twilioResponse: {
                sid:
                  data.sid ||
                  "SVR_" + Math.random().toString(36).substring(2, 15),
                to: bill.phone,
                from: config.fromNumber,
                status: "sent via server",
              },
              smsContent: messageContent,
              timestamp: new Date().toISOString(),
              recipient: bill.phone,
              billId: billId,
              receiptUrl: receiptUrl,
            };
          }
        }
        throw new Error(
          "Server proxy failed, falling back to client-side implementation"
        );
      } catch (serverError) {
        console.log(
          "[TWILIO] Server proxy unavailable, using client-side method:",
          serverError
        );
        // Fall back to the client-side method
        const result = await TwilioService.sendSms(bill.phone, messageContent);

        console.log(`[TWILIO] sendSms result:`, result);

        return {
          success: true,
          twilioResponse: result,
          smsContent: messageContent,
          timestamp: new Date().toISOString(),
          recipient: bill.phone,
          billId: billId,
          receiptUrl: receiptUrl,
        };
      }
    } catch (error) {
      console.error("[TWILIO] Error sending bill notification:", error);
      throw new Error(`Twilio bill notification failed: ${error.message}`);
    }
  },

  // Update Twilio settings
  updateSettings: (settings) => {
    try {
      localStorage.setItem("twilioSettings", JSON.stringify(settings));
      console.log("[TWILIO] Settings updated:", settings);
      return true;
    } catch (error) {
      console.error("[TWILIO] Error updating settings:", error);
      return false;
    }
  },

  // Get current Twilio settings
  getSettings: () => {
    return getTwilioConfig();
  },
};

// Export TwilioService
export default TwilioService;
