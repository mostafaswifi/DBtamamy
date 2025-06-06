-- CreateTable
CREATE TABLE "employees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeName" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "hireDate" DATETIME,
    "department" TEXT,
    "jobTitle" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "attendance_departures" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "attendanceTime" DATETIME,
    "departureTime" DATETIME,
    "attendanceStatus" TEXT,
    "departureStatus" TEXT,
    "notes" TEXT,
    "cordx" REAL,
    "cordy" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "attendance_departures_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "places" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "points" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placeId" INTEGER NOT NULL,
    "cordx" REAL NOT NULL,
    "cordy" REAL NOT NULL,
    CONSTRAINT "points_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EmployeePlaces" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EmployeePlaces_A_fkey" FOREIGN KEY ("A") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EmployeePlaces_B_fkey" FOREIGN KEY ("B") REFERENCES "places" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeCode_key" ON "employees"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeePlaces_AB_unique" ON "_EmployeePlaces"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeePlaces_B_index" ON "_EmployeePlaces"("B");
