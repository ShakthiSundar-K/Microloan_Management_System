import prisma from "../config/prismaClient";


/**
 * Get repayment history with filtering
 * @param filterType "24h" | "week" | "month" | "custom"
 * @param startDate Optional - Custom start date
 * @param endDate Optional - Custom end date
 */
const getRepaymentHistory = async (filterType: string = "week", startDate?: string, endDate?: string, minAmount?: number, maxAmount?: number) => {
    const today = new Date();
    let fromDate: Date;
    let toDate: Date = today;

    // **Determine the time range based on filterType**
    switch (filterType) {
        case "24h":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 1); // Last 24 hours
            break;
        case "week":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 7); // Last week (DEFAULT)
            break;
        case "month":
            fromDate = new Date(today);
            fromDate.setMonth(today.getMonth() - 1); // Last month
            break;
        case "custom":
            if (!startDate || !endDate) throw new Error("Custom date range requires startDate and endDate.");
            fromDate = new Date(startDate);
            toDate = new Date(endDate);
            break;
        default:
            throw new Error("Invalid filter type. Use '24h', 'week', 'month', or 'custom'.");
    }

    // **Fetch repayment history from DB**
    const repaymentHistory = await prisma.repaymentHistory.findMany({
        where: {
            paidDate: {
                gte: fromDate,
                lte: toDate,
            },
            amountPaid: {
                gte: minAmount || 0,  // Filter by minimum amount if provided
                lte: maxAmount || Number.MAX_VALUE, // Filter by maximum amount if provided
            }
        },
        orderBy: { paidDate: "desc" },
        select: {
            paidDate: true,
            amountPaid: true,
            borrower: {
                select: {
                    borrowerId: true,
                    name: true,
                },
            },
        },
    });

    // **Group by date for GPay-style history**
    const groupedHistory: Record<string, any[]> = {};
    repaymentHistory.forEach((repayment) => {
        const dateKey = repayment.paidDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
        if (!groupedHistory[dateKey]) {
            groupedHistory[dateKey] = [];
        }
        groupedHistory[dateKey].push({
            borrowerId: repayment.borrower.borrowerId,
            borrowerName: repayment.borrower.name,
            amountPaid: repayment.amountPaid,
        });
    });

    return groupedHistory;
};


export { getRepaymentHistory };