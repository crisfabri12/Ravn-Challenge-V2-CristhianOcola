/*
  Warnings:

  - You are about to drop the column `caption` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Image` table. All the data in the column will be lost.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "caption",
DROP COLUMN "description";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
