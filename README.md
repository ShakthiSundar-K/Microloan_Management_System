# Thandal Management System (TMS)

## A Story of Money, Risk, and a Smarter Way Forward

### 1. The Legacy of Traditional Lending

For decades, lending has followed a familiar pattern: give someone a sum of money, and every month, they pay interest until—eventually—they repay the principal.

This model is reliable for banks and large financial institutions. Why? Because they demand collateral. If a borrower defaults, the lender has something to fall back on. The risk is controlled, and the process is justified.

But not everyone is a bank.

### 2. The Reality of the Local Lender

Many individuals and small business owners possess idle capital—savings they want to grow. These local lenders often step in where banks won't: offering small-to-medium loans (₹5 to ₹10 lakhs) without requiring collateral.

The business is attractive. Monthly interest provides consistent returns. But the model is flawed:

- **Capital Locking**: Principal remains tied up for years.
- **High Risk**: No collateral means if a borrower defaults, the lender absorbs the loss.
- **Repayment Stress**: Borrowers often struggle to return the principal, leading to delays, tension, and defaults.

There had to be a better way.

### 3. The Emergence of Thandal

Enter **Thandal** — a localized, smart, and borrower-friendly lending model.

Here's how it works:

- Lenders provide capital to small businesses that generate **daily income** (e.g., fruit vendors, flower shops, street-side retailers).
- **Profit is deducted upfront** — usually 10% of the loan amount.
- Borrowers repay **only the principal**, spread evenly across **100 daily installments**.

#### Example:

> A fruit seller borrows ₹50,000.
>
> - ₹5,000 (10%) is deducted as profit.
> - The seller receives ₹45,000.
> - Repays ₹500 per day for 100 days until he pays ₹50,000.

This model offers:

- **Reduced borrower burden**
- **Faster capital rotation for lenders**
- **Continuous, reinvestable cash flow**

### 4. Scaling Thandal: The Problem of Pen and Paper

While Thandal is elegant, its execution becomes complex when scaled. Imagine managing:

- 50+ borrowers
- Daily repayments
- Missed or delayed payments
- Idle vs. active capital

Doing this on paper is not just tedious—it’s dangerous. Errors creep in. Time is lost. Profits are affected.

That’s where the **Thandal Management System (TMS)** steps in.

---

## Introducing the Thandal Management System (TMS)

TMS is a professional, elegant web-based application designed to manage the complete lifecycle of Thandal loans—from borrower registration to repayment tracking, capital management, and risk evaluation.

Its mission is simple: **Digitize and scale Thandal lending without losing control.**

### Key Features at a Glance

- Digitally register and manage existing and new loans
- Collect, record, and auto-close daily repayments
- Track idle capital and capital in rotation
- View real-time repayment progress and financial summaries
- Manage borrower profiles, risk scores, and loan history

Let’s dive deeper.

---

## Core Modules & Workflows

### 1. Migrating Existing Loans

> **Home → Register Existing Loans**

- Lenders can move their physical records into TMS.
- Choose an existing borrower or create a new one.
- Enter loan details; TMS begins tracking repayments automatically from the present day.

### 2. Daily Repayment Collection

> **Home → Collect Today’s Repayments**

- View all repayments due today.
- For each borrower:
  - See repayment details (expected amount, due date, status)
  - Edit and record the amount paid
  - Automatically update repayment status based on amount and timing

#### Repayment Status Enum

```ts
enum RepaymentStatus {
  Paid,
  Unpaid,
  Missed,
  Paid_Late,
  Paid_in_Advance,
  Paid_Partial_Late,
  Paid_Partial_Advance,
  Paid_Partial
}
```

### 3. Closing the Day

> **Home → Close Today’s Repayments**

At the end of the business day:

- All remaining unpaid repayments are marked **Missed**.
- The day’s collection is added to capital tracking.
- Further edits for the day are locked.

> **Note:** Auto-close happens daily at **11:59 PM**.

### 4. Cash in Hand

> **Home → Cash in Hand**

Represents **idle capital**—funds available for lending.

- **Add** when receiving outside money
- **Subtract** for expenses or withdrawals

Accurate tracking ensures better lending decisions.

### 5. Today’s Collection

> **Home → Today's Collection**

Live display of collection progress:

> Example: ₹1,500 / ₹3,000 collected so far today.

Helps monitor repayment performance during business hours.

### 6. Financial Summary

> **Home → Financial Summary**

Track high-level financial metrics:

- Total loans issued
- Total profit earned
- New borrowers
- Loan status breakdowns
- Monthly performance
- Historical comparisons

Click **Update Now** to fetch the latest summary.

---

## Quick Access Tools

### 1. Loans

> **Quick Access → Loans**

- View all loans issued to date
- Click a loan for detailed stats:
  - Full repayment history
  - Repayment status breakdown (e.g. Paid: 70, Missed: 2)
  - Ability to close or delete loans

### 2. Borrowers

> **Quick Access → Borrowers**

- List of all borrowers
- Click a borrower to view:
  - Personal and contact info
  - Loan history
  - Risk assessment score
  - Actions: Call or edit borrower details

### 3. New Loan Issuance

> **Quick Access → New Loan**

- Select an existing borrower or create a new one
- Input:
  - Principal Amount
  - (Auto-filled) Profit deduction = 10% of loan
  - (Auto-filled) Daily repayment = Principal / 100
  - (Default) Repayment days = Monday to Saturday

Loan issuance triggers updates to capital and repayment tracking.

---

## Financial Intelligence

### Capital Formula

```ts
totalCapital = pendingLoanAmount + idleCapital
```

- Capital **increases** only when a **new loan** is issued (due to upfront profit)
- Daily repayments **do not** increase total capital; they just rotate idle funds

### Risk Assessment&#x20;

The system includes modules to calculate and display **borrower risk levels** based on their payment history. This helps lenders decide whether a borrower is eligible for future loans.

---

## Conclusion

The Thandal Management System is more than software. It’s a powerful narrative:

- From outdated methods to modern efficiency
- From risk and manual errors to automation and clarity
- From idle capital to a dynamic financial engine

TMS is built for those who believe in smart lending, reliable income, and scalable business.

**Welcome to the future of local lending.**

