// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// --- Helper Functions for Analysis ---

/**
 * Calculates the average of a specific key from an array of history objects.
 * @param {Array<Object>} history - Array of sensor data snapshots.
 * @param {string} path - The nested path to the value (e.g., 'sensors.pressure.front').
 * @returns {number} The calculated average.
 */
const getAverage = (history, path) => {
  const keys = path.split('.');
  const total = history.reduce((acc, entry) => {
    // Safely access nested keys
    const value = keys.reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : null, entry);
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
  return history.length > 0 ? total / history.length : 0;
};

/**
 * Safely gets a nested value from an object.
 * @param {Object} obj - The object to query.
 * @param {string} path - The path to the value (e.g., 'a.b.c').
 * @returns {*} The value or null if not found.
 */
const getNested = (obj, path) => {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== 'undefined') ? acc[key] : null, obj);
}


// --- Main Realtime AI Analysis Function ---

exports.analyzeSensorDataV2 = functions.database
  .ref("/sensorData/{userId}/history/{timestamp}")
  .onCreate(async (snapshot, context) => {
    const newData = snapshot.val();
    const { userId } = context.params;
    const userSensorRef = admin.database().ref(`/sensorData/${userId}`);

    // 1. Fetch recent history for context (e.g., last 12 points, approx 1 hour)
    const historySnapshot = await userSensorRef.child("history").orderByKey().limitToLast(12).once("value");
    const history = historySnapshot.exists() ? Object.values(historySnapshot.val()) : [];

    // --- ENHANCED AI ANALYSIS LOGIC ---
    let insightMessage = "✅ All readings appear normal and stable.";
    let alertLevel = "normal";

    const pFront = getNested(newData, 'sensors.pressure.front');
    const temp = getNested(newData, 'sensors.environment.temperature');
    const humidity = getNested(newData, 'sensors.environment.humidity');
    const strain1 = getNested(newData, 'sensors.strain.gauge1');
    const activity = getNested(newData, 'sensors.movement.activity');

    // Calculate historical averages for trend analysis
    const avgPressure = getAverage(history, 'sensors.pressure.front');
    const avgStrain = getAverage(history, 'sensors.strain.gauge1');

    // RULE 1: Critical pressure check
    if (pFront > 800) {
      insightMessage = "🚨 CRITICAL: Pressure is dangerously high. Possible Compartment Syndrome. Immediate medical attention is required.";
      alertLevel = "critical";
    }
    // RULE 2: Trend-based Infection Risk (more reliable than a single reading)
    else if (temp > 37.8 && history.length > 5 && getAverage(history, 'sensors.environment.temperature') < temp - 0.5) {
      insightMessage = "⚠️ WARNING: Temperature is rising steadily. Combined with high humidity, this indicates an increased risk of infection. Monitor closely.";
      alertLevel = "warning";
    }
    // RULE 3: Sudden Pressure Spike (more than 20% increase from average)
    else if (pFront > 500 && pFront > avgPressure * 1.20) {
      insightMessage = `⚠️ WARNING: Sudden increase in pressure detected. Check for recent over-activity or incorrect limb positioning.`;
      alertLevel = "warning";
    }
    // RULE 4: Strain Gauge Anomaly (potential impact)
    else if (strain1 > avgStrain * 1.50 && strain1 > 0.05) {
      insightMessage = `ℹ️ INFO: A significant strain spike was detected. This may indicate a recent impact or fall. Recommend checking on the patient.`;
      alertLevel = 'warning';
    }
    // RULE 5: High Activity Warning
    else if (activity && activity.toLowerCase().includes("high")) {
      insightMessage = "ℹ️ INFO: High activity level detected. To ensure proper healing, please rest and elevate the limb.";
      alertLevel = "normal"; // Not a warning, but actionable info
    }

    const aiInsight = {
      message: insightMessage,
      alertLevel: alertLevel,
      analyzedAt: new Date().toISOString(),
      triggeringTimestamp: context.params.timestamp,
    };

    try {
      await userSensorRef.child("ai_insight").set(aiInsight);
      console.log(`V2 Analysis for ${userId}: ${insightMessage}`);
    } catch (error) {
      console.error(`Failed to save V2 insight for ${userId}:`, error);
    }
    return null;
  });


// --- NEW Scheduled Daily Summary Function ---

exports.generateDailySummary = functions.pubsub.schedule('every day 23:00')
  .timeZone('Asia/Kolkata') // Set to your user's timezone
  .onRun(async (context) => {
    const sensorDataRef = admin.database().ref('/sensorData');
    const usersSnapshot = await sensorDataRef.once('value');
    if (!usersSnapshot.exists()) {
      console.log("No users to generate summaries for.");
      return null;
    }

    const allUsers = usersSnapshot.val();
    for (const userId in allUsers) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.getTime().toString();

      const historySnapshot = await sensorDataRef
        .child(`${userId}/history`)
        .orderByKey()
        .startAt(startOfDay)
        .once('value');

      if (!historySnapshot.exists()) continue;

      const todaysHistory = Object.values(historySnapshot.val());

      // Generate summary metrics
      const avgPressure = getAverage(todaysHistory, 'sensors.pressure.front');
      const maxTemp = Math.max(...todaysHistory.map(h => getNested(h, 'sensors.environment.temperature')));
      const minTemp = Math.min(...todaysHistory.map(h => getNested(h, 'sensors.environment.temperature')));

      const summary = {
        date: new Date().toISOString().split('T')[0],
        averagePressure: parseFloat(avgPressure.toFixed(2)),
        temperatureRange: `${minTemp.toFixed(1)}°C - ${maxTemp.toFixed(1)}°C`,
        criticalAlerts: todaysHistory.filter(h => getNested(h, 'ai_insight.alertLevel') === 'critical').length,
      };

      // Save the daily summary
      await admin.database().ref(`/summaries/${userId}/${summary.date}`).set(summary);
      console.log(`Generated daily summary for user ${userId}`);
    }
    return null;
  });