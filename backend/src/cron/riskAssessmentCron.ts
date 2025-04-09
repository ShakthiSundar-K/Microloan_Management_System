import cron from "node-cron";
import { runDailyRiskAssessment } from "../controllers/riskAssessmentController";

// Daily at 2 AM IST
cron.schedule(
  "0 2 * * *",
  () => {
    runDailyRiskAssessment();
    console.log(`[CRON] Risk assessment triggered at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
  },
  {
    timezone: "Asia/Kolkata",
  }
);
