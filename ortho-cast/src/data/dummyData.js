const dummyData = {
  latest: {
    sensors: {
      pressure: { front: 550, back: 560, left: 545, right: 555 },
      strain: { gauge1: 0.021, gauge2: 0.023 },
      environment: { temperature: 37.8, humidity: 75 },
      movement: { activity: "Moderate" },
    },
    deviceStatus: { battery: 85 },
  },
  ai_insight: {
    alertLevel: "warning",
    message: "⚠️ WARNING: Temperature is rising steadily. Monitor closely.",
    analyzedAt: new Date().toISOString(),
  },
  doctor_note: {
    message:
      "Akhand, please remember to elevate your leg for at least 15 minutes every 2 hours. Your progress looks good otherwise!",
    updatedAt: new Date().toISOString(),
  },
  history: {
    [Date.now() - 3600000 * 4]: {
      sensors: {
        pressure: { front: 700 },
        strain: { gauge1: 0.020, gauge2: 0.022 },
        environment: { temperature: 37.2 },
        movement: { activity: "Low" },
      },
    },
    [Date.now() - 3600000 * 3]: {
      sensors: {
        pressure: { front: 520 },
        strain: { gauge1: 0.020, gauge2: 0.022 },
        environment: { temperature: 37.2 },
        movement: { activity: "Low" },
      },
    },
    [Date.now() - 3600000 * 2]: {
      sensors: {
        pressure: { front: 535 },
        strain: { gauge1: 0.021, gauge2: 0.021 },
        environment: { temperature: 37.4 },
        movement: { activity: "Moderate" },
      },
    },
    [Date.now() - 3600000 * 1]: {
      sensors: {
        pressure: { front: 550 },
        strain: { gauge1: 0.021, gauge2: 0.023 },
        environment: { temperature: 37.8 },
        movement: { activity: "High - Please Rest" },
      },
    },
  },
};

export default dummyData;
