// models/riskAssessmentModel.ts

import prisma from "../config/prismaClient";
import { RiskLevel } from "@prisma/client";

 const calculateAndSaveRiskAssessment = async (borrowerIds: string[]) => {
  for (const borrowerId of borrowerIds) {
    const borrower = await prisma.borrowers.findUnique({
    where: { borrowerId },
    include: { loansTaken: true },
    });
    if (!borrower) continue;
    // console.log("borrowerdata:",borrower);
    if (!borrower.loansTaken || borrower.loansTaken.length === 0) continue;

    const userId = borrower.loansTaken[0].issuedById;
    if (!userId) continue; // skip if somehow userId is not present

    const threshold = await prisma.riskThreshold.findUnique({ where: { userId } });

    const loans = borrower.loansTaken;    
    const repayments = await prisma.repayments.findMany({ where: { borrowerId } });

    const totalLoans = loans.length;
    const completedLoans = loans.filter(l => l.status === "Closed").length;
    const defaultedLoans = loans.filter(l => l.status === "Defaulted").length;

    const totalRepayments = repayments.length;
    const missedRepayments = repayments.filter(r => r.status === "Missed").length;
    const onTimePayments = repayments.filter(r => r.status === "Paid" ).length;
    const latePayments = repayments.filter(r => r.status === "Paid_Late");

    const successfulRepayments = repayments.filter(r =>
    r.status === "Paid" || r.status === "Paid_Late"
    );
    const totalSuccessfulRepayments = successfulRepayments.length;

    const repaymentRate = totalSuccessfulRepayments > 0
    ? parseFloat(((onTimePayments + latePayments.length) / totalSuccessfulRepayments * 100).toFixed(2))
    : 0;

    const onTimeRate = totalSuccessfulRepayments > 0
    ? parseFloat((onTimePayments / totalSuccessfulRepayments * 100).toFixed(2))
    : 0;

    const defaultRate = totalLoans > 0
      ? parseFloat((defaultedLoans / totalLoans * 100).toFixed(2))
      : 0;

    const safeLatePayments = latePayments.filter(p => p.paidDate && p.dueDate);
    const averageDelay = safeLatePayments.length > 0
    ? safeLatePayments
        .map(p => Math.max(0, (p.paidDate!.getTime() - p.dueDate!.getTime()) / (1000 * 60 * 60 * 24)))
        .reduce((a, b) => a + b, 0) / safeLatePayments.length
    : 0;

    // 🎯 Weighted Score
    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (onTimeRate * 0.4) +
          (repaymentRate * 0.3) +
          ((100 - defaultRate) * 0.2) +
          ((100 - averageDelay) * 0.1)
        )
      )
    );

    // 🎯 Risk Level Classification
    let riskLevel: RiskLevel = "High_Risk";
    const low = threshold?.lowThreshold ?? 70;
    const medium = threshold?.mediumThreshold ?? 40;

    if (score >= low) {
      riskLevel = "Low_Risk";
    } else if (score >= medium) {
      riskLevel = "Moderate_Risk";
    }

    // ✅ Upsert into RiskAssessment
    await prisma.riskAssessment.upsert({
      where: { borrowerId },
      update: {
        totalLoansTaken: totalLoans,
        totalRepayments,
        missedRepayments,
        latePayments: latePayments.length,
        defaultedLoans,
        completedLoans,
        onTimePayments,
        repaymentRate,
        averageDelayInDays: parseFloat(averageDelay.toFixed(2)),
        riskScore: score,
        riskLevel,
        lastEvaluatedAt: new Date(),
      },
      create: {
        borrowerId,
        totalLoansTaken: totalLoans,
        totalRepayments,
        missedRepayments,
        latePayments: latePayments.length,
        defaultedLoans,
        completedLoans,
        onTimePayments,
        repaymentRate,
        averageDelayInDays: parseFloat(averageDelay.toFixed(2)),
        riskScore: score,
        riskLevel,
      },
    });

//     console.log(`Risk Assessment for borrower ${borrowerId}:`, {
//   totalLoansTaken: totalLoans,
//   totalRepayments,
//   missedRepayments,
//   latePayments: latePayments.length,
//   defaultedLoans,
//   completedLoans,
//   onTimePayments,
//   repaymentRate,
//   averageDelayInDays: parseFloat(averageDelay.toFixed(2)),
//   riskScore: score,
//   riskLevel,
// }
// );

  }
};

const getRiskThresholdByUserId = async (userId: string) => {
  return prisma.riskThreshold.findUnique({ where: { userId } });
};

const upsertRiskThreshold = async (
  userId: string,
  thresholds: { lowThreshold?: number; mediumThreshold?: number }
) => {
  const existing = await prisma.riskThreshold.findUnique({ where: { userId } });

  if (existing) {
    await prisma.riskThreshold.update({
      where: { userId },
      data: {
        lowThreshold: thresholds.lowThreshold ?? existing.lowThreshold,
        mediumThreshold: thresholds.mediumThreshold ?? existing.mediumThreshold,
      },
      
    });
  } else {
      await  prisma.riskThreshold.create({
      data: {
        userId,
        lowThreshold: thresholds.lowThreshold ?? 70,
        mediumThreshold: thresholds.mediumThreshold ?? 40,
      },

    });
  }
};

const getAllBorrowerId = async () => {
    return prisma.borrowers.findMany({
      select: { borrowerId: true }
    });
}

 const getRiskAssessmentByUserId = async (borrowerId: string) => {
  return await prisma.riskAssessment.findUnique({
    where: {
      borrowerId,
    },
  });
};

export {calculateAndSaveRiskAssessment,upsertRiskThreshold,getRiskThresholdByUserId,getAllBorrowerId,getRiskAssessmentByUserId};