export const generateAiInsights = (sensors) => {
  const insights = [];
  
  // Data fetch kar rahe hain, agar data nahi hai toh default 0 le lenge
  const temp = sensors?.dht22?.temperature || 0;
  const humidity = sensors?.dht22?.humidity || 0;
  const weight = sensors?.hx711?.weight || 0;
  const activity = sensors?.mpu6050?.activity || "Low";

  // --- 1. TEMPERATURE (Infection & Inflammation Logic) ---
  if (temp >= 38.0) {
    insights.push({ 
      level: "critical", 
      title: "High Risk of Infection",
      message: `CRITICAL: Skin temperature is very high (${temp}°C). This indicates possible severe inflammation or infection inside the cast. SCHEDULE DOCTOR VISIT IMMEDIATELY.` 
    });
  } else if (temp >= 37.5) {
     insights.push({ 
      level: "warning", 
      title: "Slight Inflammation",
      message: `WARNING: Temperature is slightly elevated (${temp}°C). Elevate your leg and apply an ice pack behind the knee for 15 mins.` 
    });
  }

  // --- 2. WEIGHT / LOAD (Bone Safety Logic via HX711) ---
  // Maan lijiye doctor ne max 20kg weight allowed kiya hai fractured leg par
  if (weight > 30) {
    insights.push({ 
      level: "critical", 
      title: "Excessive Force Detected",
      message: `CRITICAL: You are putting ${weight}kg on your healing leg! High risk of bone displacement. STOP immediately and use crutches.` 
    });
  } else if (weight >= 15 && weight <= 30) {
    insights.push({ 
      level: "warning", 
      title: "Approaching Weight Limit",
      message: `WARNING: You are putting ${weight}kg weight. You are very close to your allowed limit. Walk slowly.` 
    });
  }

  // --- 3. MOVEMENT & EXERCISE (MPU6050 Logic) ---
  if (activity.includes("High")) {
    insights.push({ 
      level: "warning", 
      title: "Over-exertion Detected",
      message: "REST NEEDED: MPU6050 detected continuous high motion. You need to rest the limb for at least 2 hours to prevent swelling." 
    });
  } else if (activity === "Low") {
    insights.push({ 
      level: "normal", 
      title: "Physiotherapy Time",
      message: "SUGGESTION: Your limb has been inactive. Please do 10 minutes of light ankle pumps (toe-wiggling) to maintain blood circulation and prevent clots." 
    });
  }

  // --- 4. HUMIDITY / HYGIENE (DHT22 Logic) ---
  if (humidity > 70) {
    insights.push({ 
      level: "warning", 
      title: "Moisture Alert",
      message: `WARNING: High moisture (${humidity}%) inside the cast. This can cause fungal infections. Keep the area dry and well-ventilated.` 
    });
  }

  // --- 5. Default Good Status ---
  if (insights.length === 0) {
    insights.push({ 
      level: "normal", 
      title: "Optimal Healing",
      message: "EXCELLENT: All sensor vitals are normal. You are recovering perfectly. Maintain your current routine." 
    });
  }

  // Priority ke hisaab se sort karna (Critical hamesha top par aayega)
  const severity = { critical: 1, warning: 2, normal: 3 };
  insights.sort((a, b) => severity[a.level] - severity[b.level]);

  return insights;
};