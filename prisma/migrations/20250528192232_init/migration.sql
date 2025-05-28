-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3),
    "department" TEXT,
    "jobTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_departures" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "attendanceTime" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),
    "attendanceStatus" TEXT,
    "departureStatus" TEXT,
    "notes" TEXT,
    "cordx" DOUBLE PRECISION,
    "cordy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_departures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "cordx" DOUBLE PRECISION NOT NULL,
    "cordy" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeePlaces" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmployeePlaces_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeCode_key" ON "employees"("employeeCode");

-- CreateIndex
CREATE INDEX "_EmployeePlaces_B_index" ON "_EmployeePlaces"("B");

-- AddForeignKey
ALTER TABLE "attendance_departures" ADD CONSTRAINT "attendance_departures_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeePlaces" ADD CONSTRAINT "_EmployeePlaces_A_fkey" FOREIGN KEY ("A") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeePlaces" ADD CONSTRAINT "_EmployeePlaces_B_fkey" FOREIGN KEY ("B") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
