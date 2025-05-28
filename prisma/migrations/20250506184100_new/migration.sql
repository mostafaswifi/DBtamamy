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
    CONSTRAINT "points_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EmployeePlaces" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EmployeePlaces_A_fkey" FOREIGN KEY ("A") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EmployeePlaces_B_fkey" FOREIGN KEY ("B") REFERENCES "places" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeePlaces_AB_unique" ON "_EmployeePlaces"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeePlaces_B_index" ON "_EmployeePlaces"("B");
