// Simple test script to verify notification flow
const axios = require("axios");

async function testNotificationFlow() {
  console.log("🧪 Testing Notification Flow...");

  try {
    // Test 1: Get all posts to see available posts
    console.log("\n1. Fetching available posts...");
    const postsResponse = await axios.get("http://localhost:5003/jobposting");
    console.log("✅ Posts fetched:", postsResponse.data.length, "posts found");

    if (postsResponse.data.length > 0) {
      const firstPost = postsResponse.data[0];
      console.log("📝 First post:", {
        postId: firstPost.postId,
        careseekerId: firstPost.careseekerId,
        careType: firstPost.careType,
        district: firstPost.district,
      });

      // Test 2: Send a notification for the first post
      console.log("\n2. Sending notification...");
      const notificationData = {
        postId: firstPost.postId,
        caregiverId: 123,
        careseekerId: firstPost.careseekerId || 456,
      };

      console.log("📤 Sending notification with data:", notificationData);

      const notificationResponse = await axios.post(
        "http://localhost:5003/notifications",
        notificationData
      );

      console.log(
        "✅ Notification sent successfully:",
        notificationResponse.data
      );

      // Test 3: Fetch notifications for the careseeker
      console.log("\n3. Fetching notifications for careseeker...");
      const careseekerId = firstPost.careseekerId || 456;
      const notificationsResponse = await axios.get(
        `http://localhost:5003/notifications/careseeker/${careseekerId}`
      );

      console.log(
        "✅ Notifications fetched:",
        notificationsResponse.data.length,
        "notifications found"
      );
      console.log("📬 Latest notification:", notificationsResponse.data[0]);
    } else {
      console.log("❌ No posts found. Please create a post first.");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
    console.error("Request URL:", error.config?.url);
    console.error("Request data:", error.config?.data);
  }
}

testNotificationFlow();
