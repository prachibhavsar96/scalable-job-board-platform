ALTER TABLE "Company" ADD COLUMN "employerId" INTEGER;

ALTER TABLE "Company" ADD CONSTRAINT "Company_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Company_employerId_idx" ON "Company"("employerId");
