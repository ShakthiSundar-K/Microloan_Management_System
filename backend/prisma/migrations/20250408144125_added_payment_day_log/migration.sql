-- CreateTable
CREATE TABLE "PaymentDayLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentDayLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDayLog_userId_date_key" ON "PaymentDayLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "PaymentDayLog" ADD CONSTRAINT "PaymentDayLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
