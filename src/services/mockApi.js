// Declare mock data in the global scope so it persists between module reloads
// Try to load bills from localStorage first, or use default data if not available
import TwilioService from "./twilio";

// Always start with an empty array (no default bills)
let mockBills = [];

// Try to load from localStorage if available
try {
  const storedBills = localStorage.getItem("mockBills");
  if (storedBills) {
    mockBills = JSON.parse(storedBills);
  } else {
    // If no bills in localStorage, create a default bill
    const defaultBill = {
      id: 1,
      date: new Date().toISOString(),
      customerName: "Sample Customer",
      phone: "+919999999999",
      items: 2,
      itemsDetail: "Sample Item 1 - ₹100 x 1, Sample Item 2 - ₹200 x 1",
      total: 300,
      status: "paid",
      paidDate: new Date().toISOString(),
      payment: {
        method: "upi",
        paidAt: new Date().toISOString(),
      },
    };
    mockBills = [defaultBill];
    localStorage.setItem("mockBills", JSON.stringify(mockBills));
    localStorage.setItem("lastBillId", "1");
  }
} catch (error) {
  console.error("Error loading bills from storage:", error);
  // Create default bill if there's an error
  const defaultBill = {
    id: 1,
    date: new Date().toISOString(),
    customerName: "Sample Customer",
    phone: "+919999999999",
    items: 2,
    itemsDetail: "Sample Item 1 - ₹100 x 1, Sample Item 2 - ₹200 x 1",
    total: 300,
    status: "paid",
    paidDate: new Date().toISOString(),
    payment: {
      method: "upi",
      paidAt: new Date().toISOString(),
    },
  };
  mockBills = [defaultBill];
  localStorage.setItem("mockBills", JSON.stringify(mockBills));
  localStorage.setItem("lastBillId", "1");
}

// Global variables for SMS retry mechanism
let pendingSmsRetries = [];
const MAX_RETRY_ATTEMPTS = 3;

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// Helper function to save all data to localStorage
const saveAllDataToStorage = () => {
  try {
    // Save bills
    localStorage.setItem("mockBills", JSON.stringify(mockBills));

    // Calculate and save dashboard stats
    const stats = {
      totalBills: mockBills.length,
      totalAmount: mockBills
        .filter((bill) => bill.status === "paid")
        .reduce((sum, bill) => sum + bill.total, 0),
      pendingBills: mockBills.filter((bill) => bill.status === "pending")
        .length,
      paidBills: mockBills.filter((bill) => bill.status === "paid").length,
      cancelledBills: mockBills.filter((bill) => bill.status === "cancelled")
        .length,
      pendingAmount: mockBills
        .filter((bill) => bill.status === "pending")
        .reduce((sum, bill) => sum + bill.total, 0),
    };
    localStorage.setItem("dashboardStats", JSON.stringify(stats));

    // Save order history (all bills)
    localStorage.setItem("orderHistory", JSON.stringify(mockBills));

    // Save receipts (paid bills)
    const receipts = mockBills.filter((bill) => bill.status === "paid");
    localStorage.setItem("receipts", JSON.stringify(receipts));

    // Save pending SMS retries
    localStorage.setItem(
      "pendingSmsRetries",
      JSON.stringify(pendingSmsRetries)
    );

    // Save last bill ID
    const lastBillId =
      mockBills.length > 0 ? Math.max(...mockBills.map((bill) => bill.id)) : 0;
    localStorage.setItem("lastBillId", lastBillId.toString());

    // Save WhatsApp messages
    const whatsappMessages = JSON.parse(
      localStorage.getItem("whatsappMessages") || "[]"
    );
    localStorage.setItem("whatsappMessages", JSON.stringify(whatsappMessages));

    // Save products
    const products = JSON.parse(localStorage.getItem("mockProducts") || "[]");
    localStorage.setItem("mockProducts", JSON.stringify(products));

    console.log("All data saved to localStorage successfully");
  } catch (error) {
    console.error("Error saving data to storage:", error);
  }
};

// Helper function to load all data from localStorage
const loadAllDataFromStorage = () => {
  try {
    // Load bills
    const storedBills = localStorage.getItem("mockBills");
    if (storedBills) {
      mockBills = JSON.parse(storedBills);
      console.log("Loaded bills from storage:", mockBills.length);
    }

    // Load dashboard stats
    const storedStats = localStorage.getItem("dashboardStats");
    if (storedStats) {
      console.log("Loaded dashboard stats from storage");
    }

    // Load order history
    const storedOrderHistory = localStorage.getItem("orderHistory");
    if (storedOrderHistory) {
      console.log("Loaded order history from storage");
    }

    // Load receipts
    const storedReceipts = localStorage.getItem("receipts");
    if (storedReceipts) {
      console.log("Loaded receipts from storage");
    }

    // Load pending SMS retries
    const storedRetries = localStorage.getItem("pendingSmsRetries");
    if (storedRetries) {
      pendingSmsRetries = JSON.parse(storedRetries);
      console.log("Loaded pending SMS retries:", pendingSmsRetries.length);
    }

    // Load last bill ID
    const storedLastId = localStorage.getItem("lastBillId");
    if (storedLastId) {
      console.log("Loaded last bill ID:", storedLastId);
    }

    // Load WhatsApp messages
    const storedWhatsAppMessages = localStorage.getItem("whatsappMessages");
    if (storedWhatsAppMessages) {
      console.log("Loaded WhatsApp messages from storage");
    }

    // Load products
    const storedProducts = localStorage.getItem("mockProducts");
    if (storedProducts) {
      console.log("Loaded products from storage");
    }

    console.log("All data loaded from localStorage successfully");
  } catch (error) {
    console.error("Error loading data from storage:", error);
  }
};

// Load all data when the module is initialized
loadAllDataFromStorage();

// Save data to localStorage whenever it changes
const originalPush = Array.prototype.push;
Array.prototype.push = function (...items) {
  const result = originalPush.apply(this, items);
  saveAllDataToStorage();
  return result;
};

// Override array methods to ensure data persistence
const arrayMethods = ["pop", "shift", "splice", "unshift"];
arrayMethods.forEach((method) => {
  const originalMethod = Array.prototype[method];
  Array.prototype[method] = function (...args) {
    const result = originalMethod.apply(this, args);
    saveAllDataToStorage();
    return result;
  };
});

// Helper function to simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to simulate an async response with delay
const asyncResponse = (callback) => {
  return new Promise(async (resolve, reject) => {
    try {
      await delay(800); // Simulate network delay
      const result = callback();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// Generate a unique ID for bills
const generateId = () => {
  try {
    // Try to get the last used ID from localStorage
    const lastId = localStorage.getItem("lastBillId");
    const nextId = lastId ? parseInt(lastId) + 1 : 1;

    // Save the new ID
    localStorage.setItem("lastBillId", nextId.toString());

    return nextId;
  } catch (error) {
    console.error("Error generating bill ID:", error);
    // Fallback to the old method if there's an error
    return mockBills.length > 0
      ? Math.max(...mockBills.map((bill) => bill.id)) + 1
      : 1;
  }
};

// Helper function to load SMS retries from localStorage
const loadSmsRetries = () => {
  try {
    const savedRetries = localStorage.getItem("pendingSmsRetries");
    if (savedRetries) {
      pendingSmsRetries = JSON.parse(savedRetries);
      console.log("Loaded pending SMS retries:", pendingSmsRetries.length);
    }
  } catch (error) {
    console.error("Error loading SMS retries:", error);
  }
};

// Load SMS retries when the module is initialized
loadSmsRetries();

// Process any pending SMS retries
const processPendingSmsRetries = async () => {
  if (pendingSmsRetries.length === 0) return;

  console.log(`Processing ${pendingSmsRetries.length} pending SMS retries...`);

  // Take the first retry from the queue
  const retryItem = pendingSmsRetries.shift();

  try {
    console.log(
      `Retrying SMS for bill #${retryItem.billId} (Attempt ${retryItem.attempts}/${MAX_RETRY_ATTEMPTS})`
    );

    // Find the bill
    const bill = mockBills.find((b) => b.id === retryItem.billId);
    if (!bill) {
      console.error(`Cannot retry SMS: Bill #${retryItem.billId} not found`);
      return;
    }

    // Attempt to send the SMS
    await MockApiService.sendBillSMS(retryItem.billId, retryItem.phone);
    console.log(`Retry successful for bill #${retryItem.billId}`);

    // Save updated retry queue
    saveAllDataToStorage();
  } catch (error) {
    console.error(`SMS retry failed for bill #${retryItem.billId}:`, error);

    // If we haven't reached max attempts, add it back to the queue
    if (retryItem.attempts < MAX_RETRY_ATTEMPTS) {
      pendingSmsRetries.push({
        ...retryItem,
        attempts: retryItem.attempts + 1,
        lastAttempt: new Date().toISOString(),
      });

      // Save updated retry queue
      saveAllDataToStorage();
    } else {
      console.error(
        `Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached for bill #${retryItem.billId}`
      );
    }
  }
};

// Run the retry processor periodically (every 5 seconds)
setInterval(processPendingSmsRetries, 5000);

// Generate a receipt URL for a bill
const generateReceiptUrl = (billId, forCustomer = true) => {
  const baseUrl = window.location.origin;

  // Use the public receipt URL for customer-facing communications
  if (forCustomer) {
    return `${baseUrl}/p/receipt/${billId}`;
  }

  // Use the internal receipt URL for dashboard use
  return `${baseUrl}/receipt/${billId}`;
};

// Format the bill details for SMS with better formatting
// eslint-disable-next-line no-unused-vars
const formatSmsContent = (bill, billId, paymentLink) => {
  // Generate a properly formatted date string
  const formattedDate = new Date(bill.date).toLocaleDateString();

  // Format the currency properly
  const formattedAmount = `₹${bill.total.toFixed(2)}`;

  // Create receipt link - always use customer-facing URL for SMS
  const receiptLink = generateReceiptUrl(billId, true);

  // Generate different content based on payment status
  let statusSpecificContent = "";
  let statusEmoji = "⏳";
  let statusText = "PENDING";

  if (bill.status === "pending") {
    statusEmoji = "⏳";
    statusText = "PAYMENT PENDING";
    statusSpecificContent = `Your payment is pending.\n\n💳 Pay via UPI: 9309908454@ybl\n🔗 Pay online: ${paymentLink}\n\n📱 Payment updates via SMS`;
  } else if (bill.status === "paid") {
    statusEmoji = "✅";
    statusText = "PAYMENT COMPLETED";
    statusSpecificContent = `Thank you for your payment!\n\n🧾 View receipt: ${receiptLink}\n\nKeep this message to access your receipt anytime.`;
  } else if (bill.status === "cancelled") {
    statusEmoji = "❌";
    statusText = "CANCELLED";
    statusSpecificContent = `This bill has been cancelled. Please contact us if you have any questions.`;
  }

  // Create the full message with better emoji spacing and formatting
  return `📋 *BILL NOTIFICATION*\n\nDear ${bill.customerName},\n\nYour bill from Mammta's Food is ready!\n\n📌 Bill #${billId}\n📅 Date: ${formattedDate}\n💰 Amount: ${formattedAmount}\n🛍️ Items: ${bill.items}\n\n${statusEmoji} Status: ${statusText}\n\n${statusSpecificContent}\n\n📞 For assistance: +91 XXXXXXXXXX\n🏪 Mammta's Food`;
};

// Mock API service
const MockApiService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    console.log("MockApiService.getDashboardStats called");
    try {
      await delay(800);

      // Calculate stats from bills
      const totalBills = mockBills.length;
      const totalAmount = mockBills
        .filter((bill) => bill.status === "paid")
        .reduce((sum, bill) => sum + bill.total, 0);
      const pendingBills = mockBills.filter(
        (bill) => bill.status === "pending"
      ).length;
      const paidBills = mockBills.filter(
        (bill) => bill.status === "paid"
      ).length;
      const cancelledBills = mockBills.filter(
        (bill) => bill.status === "cancelled"
      ).length;
      const pendingAmount = mockBills
        .filter((bill) => bill.status === "pending")
        .reduce((sum, bill) => sum + bill.total, 0);

      const stats = {
        totalBills,
        totalAmount,
        pendingBills,
        paidBills,
        cancelledBills,
        pendingAmount,
      };

      // Save stats to localStorage
      localStorage.setItem("dashboardStats", JSON.stringify(stats));

      return stats;
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      throw error;
    }
  },

  // Get a bill by ID
  getBillById: async (billId) => {
    console.log(`[MOCK-API] Getting bill #${billId}`);
    try {
      await delay(300);

      // Parse the billId to ensure it's a number
      const parsedBillId = parseInt(billId);
      if (isNaN(parsedBillId)) {
        throw new Error(`Invalid bill ID: ${billId}`);
      }

      // Find the bill
      const bill = mockBills.find((b) => b.id === parsedBillId);

      if (!bill) {
        console.error(
          `[MOCK-API] Bill #${parsedBillId} not found in mockBills`
        );
        console.log(
          `[MOCK-API] Current bills in system:`,
          mockBills.map((b) => b.id)
        );
        throw new Error(`Bill #${parsedBillId} not found`);
      }

      // Log successful bill retrieval
      console.log(`[MOCK-API] Successfully retrieved bill #${parsedBillId}`);
      return bill;
    } catch (error) {
      console.error(`[MOCK-API] Error getting bill #${billId}:`, error);
      throw error;
    }
  },

  // Get all bills (order history)
  getAllBills: async () => {
    console.log("MockApiService.getAllBills called");
    try {
      await delay(800);
      return mockBills;
    } catch (error) {
      console.error("Error in getAllBills:", error);
      throw error;
    }
  },

  // Get all receipts (paid bills)
  getAllReceipts: async () => {
    console.log("MockApiService.getAllReceipts called");
    try {
      await delay(800);
      const receipts = mockBills.filter((bill) => bill.status === "paid");
      localStorage.setItem("receipts", JSON.stringify(receipts));
      return receipts;
    } catch (error) {
      console.error("Error in getAllReceipts:", error);
      throw error;
    }
  },

  // Create a new bill
  createBill: async (customer, items) => {
    console.log("MockApiService.createBill called");
    try {
      await delay(800);

      const newBill = {
        id: generateId(),
        date: new Date().toISOString(),
        customerName: customer.name,
        phone: customer.phone,
        items: items.length,
        itemsDetail: items
          .map((item) => `${item.name} - ₹${item.price} x ${item.quantity}`)
          .join(", "),
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: "pending",
        itemsList: items,
      };

      mockBills.push(newBill);
      saveAllDataToStorage();

      return newBill;
    } catch (error) {
      console.error("Error in createBill:", error);
      throw error;
    }
  },

  // Update bill status
  updateBillStatus: async (billId, status) => {
    console.log("MockApiService.updateBillStatus called");
    try {
      await delay(800);

      const bill = mockBills.find((b) => b.id === billId);
      if (!bill) {
        throw new Error("Bill not found");
      }

      bill.status = status;
      if (status === "paid") {
        bill.paidDate = new Date().toISOString();
        bill.payment = {
          method: "upi",
          paidAt: new Date().toISOString(),
        };
      }

      saveAllDataToStorage();
      return bill;
    } catch (error) {
      console.error("Error in updateBillStatus:", error);
      throw error;
    }
  },

  // Delete a bill
  deleteBill: async (billId) => {
    console.log("MockApiService.deleteBill called");
    try {
      await delay(800);

      const index = mockBills.findIndex((bill) => bill.id === billId);
      if (index === -1) {
        throw new Error("Bill not found");
      }

      mockBills.splice(index, 1);
      saveAllDataToStorage();

      return { success: true, message: "Bill deleted successfully" };
    } catch (error) {
      console.error("Error in deleteBill:", error);
      throw error;
    }
  },

  // Send SMS for a bill
  sendBillSMS: async (billId, phone) => {
    console.log("MockApiService.sendBillSMS called", { billId, phone });
    try {
      // Validate phone number
      if (!phone || phone.trim() === "") {
        throw new Error("Cannot send SMS: Phone number is required");
      }

      console.log(
        `[MOCK-API] Processing SMS request for bill #${billId} to phone ${phone}`
      );

      // Make sure the phone is in international format
      const formattedPhone = phone.replace(/\s+/g, "");
      // Remove any non-numeric characters except for the + sign
      // eslint-disable-next-line no-useless-escape
      const cleanedPhone = formattedPhone.replace(/[^\d\+]/g, "");

      // Simple phone validation (can be expanded based on your requirements)
      // eslint-disable-next-line no-useless-escape
      const phoneRegex = /^[0-9\+\-\(\) ]{6,20}$/;
      if (!phoneRegex.test(cleanedPhone)) {
        console.warn(
          `[MOCK-API] Phone number format may be invalid: ${cleanedPhone}`
        );
        // We'll still proceed but log a warning
      }

      // Find the bill by ID to include its details in the SMS
      const bill = mockBills.find((b) => b.id === billId);
      if (!bill) {
        throw new Error(`Bill #${billId} not found`);
      }

      console.log(`[MOCK-API] Found bill:`, JSON.stringify(bill, null, 2));

      // Ensure the bill has the phone number for Twilio service
      // The phone param is the one we want to send to, not necessarily what's stored in the bill
      const originalPhone = bill.phone;
      bill.phone = cleanedPhone;

      console.log(
        `[MOCK-API] Updated bill phone from [${originalPhone}] to [${bill.phone}]`
      );

      // Try to send WhatsApp message first if whatsAppEnabled flag is set
      try {
        // Check if WhatsApp is enabled (default to true)
        const whatsAppEnabled =
          localStorage.getItem("useWhatsApp") === null
            ? true
            : localStorage.getItem("useWhatsApp") === "true";

        if (whatsAppEnabled) {
          console.log(
            `[MOCK-API] WhatsApp messaging is enabled. Trying WhatsApp first.`
          );
          // Try to send via WhatsApp
          await MockApiService.sendWhatsAppNotification(bill, billId);

          // If we got here, WhatsApp was successful
          console.log(
            `[MOCK-API] WhatsApp notification successful for bill #${billId}`
          );

          // Update the bill to mark WhatsApp as sent
          const billIndex = mockBills.findIndex((b) => b.id === billId);
          if (billIndex >= 0) {
            mockBills[billIndex] = {
              ...mockBills[billIndex],
              whatsAppSent: true,
              whatsAppTimestamp: new Date().toISOString(),
              messageCount: (mockBills[billIndex].messageCount || 0) + 1,
            };
            // Save to localStorage for persistence
            saveAllDataToStorage();
            console.log(
              `[MOCK-API] Updated bill record to reflect WhatsApp sent`
            );
          }

          // Return WhatsApp success response
          return {
            success: true,
            method: "whatsapp",
            timestamp: new Date().toISOString(),
            recipient: bill.phone,
            billId: billId,
          };
        }
      } catch (whatsAppError) {
        console.error(
          `[MOCK-API] WhatsApp notification failed: ${whatsAppError.message}. Falling back to SMS.`
        );
        // Continue to SMS method as fallback
      }

      // Send SMS using Twilio service as fallback
      console.log(
        `[MOCK-API] Sending SMS via Twilio to ${cleanedPhone} for bill #${billId}`
      );
      const twilioResponse = await TwilioService.sendBillNotification(
        bill,
        billId
      );
      console.log("[MOCK-API] Twilio response:", twilioResponse);

      // Update the bill to mark SMS as sent
      const billIndex = mockBills.findIndex((b) => b.id === billId);
      if (billIndex >= 0) {
        mockBills[billIndex] = {
          ...mockBills[billIndex],
          smsSent: true,
          smsTimestamp: new Date().toISOString(),
          smsCount: (mockBills[billIndex].smsCount || 0) + 1,
          lastMessageContent: twilioResponse.smsContent, // Store the last message sent
          twilioSid: twilioResponse.twilioResponse.sid, // Store Twilio message SID
        };
        // Save to localStorage for persistence
        saveAllDataToStorage();
        console.log(`[MOCK-API] Updated bill record to reflect SMS sent`);
      }

      return twilioResponse;
    } catch (error) {
      console.error("Error in sendBillSMS:", error);

      // Even if there's an error, try to mark the SMS as needing retry
      try {
        pendingSmsRetries.push({
          billId,
          phone,
          attempts: 1,
          lastAttempt: new Date().toISOString(),
          errorDetails: error.message,
        });
        saveAllDataToStorage();
      } catch (storageError) {
        console.error("Failed to save retry information:", storageError);
      }

      throw error;
    }
  },

  // Send bill notification via WhatsApp
  sendWhatsAppNotification: async (bill, billId) => {
    console.log(`[MOCK-API] Sending WhatsApp notification for bill #${billId}`);

    try {
      // Validate phone number
      if (!bill.phone) {
        throw new Error("No phone number provided for sending WhatsApp");
      }

      // Format phone number properly
      let formattedPhone = bill.phone.replace(/\s+/g, ""); // Remove all whitespace
      formattedPhone = formattedPhone.replace(/[^\d\+]/g, ""); // Remove non-numeric except +

      // If number doesn't start with +, assume it's a local number and add +91 (India)
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = `+91${formattedPhone}`;
      }

      // Validate phone number format
      if (!/^\+91[6-9]\d{9}$/.test(formattedPhone)) {
        throw new Error(
          "Invalid Indian phone number format. Must be +91 followed by 10 digits starting with 6-9"
        );
      }

      // Create a more modern and interactive bill message
      const formattedMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏪 *MAMMTAS FOOD - BILL RECEIPT* 🏪
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 *Date:* ${new Date().toLocaleDateString("en-IN")}
⏰ *Time:* ${new Date().toLocaleTimeString("en-IN")}
📋 *Bill No:* ${billId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Name: ${bill.customerName}
   • Phone: ${bill.phone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 *ORDER SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${bill.itemsDetail
  .split(", ")
  .map(
    (item) =>
      `   • ${item.split(" - ")[0]} x ${
        item.split(" - ")[1].split(" x ")[0]
      } = ${item.split(" - ")[1].split(" x ")[1]}`
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 *PAYMENT DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Subtotal: ${formatCurrency(bill.total * 0.95)}
   • GST (5%): ${formatCurrency(bill.total * 0.05)}
   • Total Amount: ${formatCurrency(bill.total)}
   • Status: ${bill.status === "paid" ? "✅ Paid" : "⏳ Pending"}

${
  bill.status === "paid"
    ? "🎉 Thank you for your payment!"
    : "⚠️ Please complete the payment at your earliest convenience."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 *PAYMENT OPTIONS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • UPI: mammtas@upi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *NEED HELP?*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Call: +91 9876543210
   • WhatsApp: +91 9876543210

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for choosing Mammtas Food! 🍗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      // In a production environment, you would use the WhatsApp Business API here
      // For now, we'll simulate the API call
      console.log(`[MOCK-API] Sending WhatsApp message to ${formattedPhone}`);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save the message to localStorage for persistence
      const messages = JSON.parse(
        localStorage.getItem("whatsappMessages") || "[]"
      );
      messages.push({
        phone: formattedPhone,
        message: formattedMessage,
        timestamp: new Date().toISOString(),
        status: "sent",
        billId: billId,
      });
      localStorage.setItem("whatsappMessages", JSON.stringify(messages));

      // Return success response
      return {
        success: true,
        method: "whatsapp",
        message: "WhatsApp message sent successfully",
        timestamp: new Date().toISOString(),
        recipient: formattedPhone,
        billId: billId,
      };
    } catch (error) {
      console.error(`[MOCK-API] WhatsApp notification error:`, error);
      throw new Error(`Failed to send WhatsApp notification: ${error.message}`);
    }
  },

  // Clear all bills
  clearAllBills: async () => {
    console.log("MockApiService.clearAllBills called");
    try {
      await delay(800);

      mockBills = [];
      pendingSmsRetries = [];
      saveAllDataToStorage();

      return { success: true, message: "All bills cleared successfully" };
    } catch (error) {
      console.error("Error in clearAllBills:", error);
      throw error;
    }
  },

  // Reset the system - force clear all bills and localStorage
  resetSystem: () => {
    console.log("MockApiService.resetSystem called - forcing system reset");

    // Clear bills arrays
    mockBills = [];
    pendingSmsRetries = [];

    // Clear localStorage
    localStorage.removeItem("mockBills");
    localStorage.removeItem("pendingSmsRetries");

    console.log("System reset completed - all bills and data cleared");
    return { success: true, message: "System reset completed" };
  },

  // Mark a bill as paid (for UPI or QR code payments)
  markBillAsPaid: async (billId) => {
    console.log(`MockApiService.markBillAsPaid called for bill #${billId}`);
    try {
      await delay(500);

      // Find the bill index
      const billIndex = mockBills.findIndex((bill) => bill.id === billId);

      if (billIndex === -1) {
        throw new Error(`Bill #${billId} not found`);
      }

      // Check if bill is already paid
      if (mockBills[billIndex].status === "paid") {
        return {
          success: false,
          message: "Bill is already marked as paid",
        };
      }

      // Check if bill is cancelled
      if (mockBills[billIndex].status === "cancelled") {
        return {
          success: false,
          message: "Cannot mark a cancelled bill as paid",
        };
      }

      // Get the current date
      const paidDate = new Date().toISOString();

      // Update the bill status to paid and add receipt details
      mockBills[billIndex] = {
        ...mockBills[billIndex],
        status: "paid",
        paidDate: paidDate,
        payment: {
          method: "upi",
          paidAt: paidDate,
        },
        receipt: {
          generatedAt: paidDate,
          receiptNumber: `R-${billId}-${Math.floor(Math.random() * 1000)}`,
          storedInSystem: true,
        },
      };

      // Save to localStorage for persistence
      saveAllDataToStorage();

      console.log(
        `Bill #${billId} marked as paid and receipt stored in system`
      );

      return {
        success: true,
        message: `Bill #${billId} has been marked as paid and receipt stored in system`,
        bill: mockBills[billIndex],
      };
    } catch (error) {
      console.error(`Error marking bill #${billId} as paid:`, error);
      throw error;
    }
  },

  // Get receipt data for a bill
  getReceiptData: async (billId) => {
    console.log(`MockApiService.getReceiptData called for bill #${billId}`);
    try {
      await delay(300);

      // Find the bill
      const bill = mockBills.find((bill) => bill.id === billId);

      if (!bill) {
        throw new Error(`Bill #${billId} not found`);
      }

      // Check if bill is paid
      if (bill.status !== "paid") {
        return {
          success: false,
          message: "Cannot generate receipt for unpaid bill",
          bill: bill,
        };
      }

      // Return receipt data
      return {
        success: true,
        receiptData: {
          id: billId,
          customerName: bill.customerName,
          date: bill.date,
          paidDate: bill.paidDate || new Date().toISOString(),
          items: bill.itemsDetail,
          total: bill.total,
          paymentMethod: bill.paymentMethod || "upi",
          receiptNumber: `R-${billId}-${Math.floor(Math.random() * 1000)}`,
        },
      };
    } catch (error) {
      console.error(`Error getting receipt data for bill #${billId}:`, error);
      throw error;
    }
  },

  // Get all products
  getAllProducts: async () => {
    console.log("MockApiService.getAllProducts called");
    try {
      await delay(800);

      // Try to load products from localStorage
      let products = [];
      try {
        const storedProducts = localStorage.getItem("mockProducts");
        if (storedProducts) {
          products = JSON.parse(storedProducts);
        } else {
          // Default products if none exist
          products = [
            {
              id: 1,
              name: "Veg Biryani",
              price: 150,
              category: "Main Course",
              description: "Delicious vegetable biryani with aromatic spices",
            },
            {
              id: 2,
              name: "Paneer Tikka",
              price: 200,
              category: "Starters",
              description: "Grilled cottage cheese with spices",
            },
            {
              id: 3,
              name: "Gulab Jamun",
              price: 50,
              category: "Desserts",
              description: "Sweet milk-based dessert",
            },
          ];
          localStorage.setItem("mockProducts", JSON.stringify(products));
        }
      } catch (error) {
        console.error("Error loading products from storage:", error);
      }

      return products;
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      throw error;
    }
  },

  async sendWhatsAppMessage(phone, message) {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Check if phone number is valid
      if (!phone || !phone.startsWith("+91")) {
        throw new Error("Invalid phone number format. Must start with +91");
      }

      // Create a more modern and interactive bill message
      const formattedMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏪 *MAMMTAS FOOD - BILL RECEIPT* 🏪
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 *Date:* ${new Date().toLocaleDateString("en-IN")}
⏰ *Time:* ${new Date().toLocaleTimeString("en-IN")}
📋 *Bill No:* ${message.billId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Name: ${message.customerName}
   • Phone: ${message.customerPhone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 *ORDER SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${message.items
  .map(
    (item) =>
      `   • ${item.name} x ${item.quantity} = ${formatCurrency(
        item.price * item.quantity
      )}`
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 *PAYMENT DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Subtotal: ${formatCurrency(message.subtotal)}
   • GST (5%): ${formatCurrency(message.gst)}
   • Total Amount: ${formatCurrency(message.total)}
   • Status: ${message.status === "paid" ? "✅ Paid" : "⏳ Pending"}

${
  message.status === "paid"
    ? "🎉 Thank you for your payment!"
    : "⚠️ Please complete the payment at your earliest convenience."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 *PAYMENT OPTIONS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • UPI: mammtas@upi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *NEED HELP?*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Call: +91 9876543210
   • WhatsApp: +91 9876543210

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for choosing Mammtas Food! 🍗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      // Save the message to localStorage for persistence
      const messages = JSON.parse(
        localStorage.getItem("whatsappMessages") || "[]"
      );
      messages.push({
        phone,
        message: formattedMessage,
        timestamp: new Date().toISOString(),
        status: "sent",
      });
      localStorage.setItem("whatsappMessages", JSON.stringify(messages));

      return { success: true, message: "WhatsApp message sent successfully" };
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  },
};

// Log that the mockApi module has been loaded
console.log("MockApiService module loaded, bills:", mockBills.length);

// Add a test function for sending SMS
MockApiService.testSendSMS = async (phoneNumber) => {
  console.log("[TEST] Testing message sending to:", phoneNumber);

  // Create a test bill
  const testBill = {
    id: 9999,
    customerName: "Test Customer",
    phone: phoneNumber,
    date: new Date().toISOString().split("T")[0],
    total: 199.99,
    items: 2,
    itemsDetail: "Test Item 1 x1 - ₹99.99, Test Item 2 x1 - ₹100.00",
    status: "pending",
  };

  console.log("[TEST] Created test bill:", testBill);

  // Check if WhatsApp is enabled
  const useWhatsApp =
    localStorage.getItem("useWhatsApp") === null
      ? true
      : localStorage.getItem("useWhatsApp") === "true";

  try {
    let result;

    if (useWhatsApp) {
      // Try WhatsApp first
      console.log("[TEST] Using WhatsApp for message delivery");
      result = await MockApiService.sendWhatsAppNotification(
        testBill,
        testBill.id
      );
      console.log("[TEST] WhatsApp notification sent successfully:", result);
    } else {
      // Fall back to SMS
      console.log("[TEST] Using SMS for message delivery");
      result = await TwilioService.sendBillNotification(testBill, testBill.id);
      console.log("[TEST] SMS sent successfully:", result);
    }

    return {
      success: true,
      message: useWhatsApp
        ? "WhatsApp notification opened"
        : "Test SMS sent successfully",
      details: result,
    };
  } catch (error) {
    console.error("[TEST] Failed to send message:", error);
    return {
      success: false,
      message: "Failed to send message",
      error: error.message,
    };
  }
};

export default MockApiService;
