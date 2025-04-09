import cron from "node-cron";
import dayjs from "dayjs";
import { generateMonthlyFinancialSummaryCron } from "../controllers/financialSummaryController";

import prisma from "../config/prismaClient";


  cron.schedule(
    "59 23 28-31 * *", // Trigger near the end of each month
    async () => {
      const today = dayjs();
      const lastDayOfMonth = today.endOf("month").date();

      // Ensure we only run this on the actual last day of the month
      if (today.date() === lastDayOfMonth) {
        console.log(`[CRON] Running monthly financial summary on ${today.format("YYYY-MM-DD HH:mm")}`);

        try {
          const users = await prisma.users.findMany();

          for (const user of users) {
            await generateMonthlyFinancialSummaryCron(user.userId);
            console.log(`[CRON] Financial summary generated for user: ${user.userId}`);
          }

        } catch (error) {
          console.error("[CRON] Error during financial summary generation:", error);
        }
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );


