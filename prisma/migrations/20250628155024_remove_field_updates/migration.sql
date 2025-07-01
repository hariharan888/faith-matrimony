/*
  Warnings:

  - You are about to drop the `field_updates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "field_updates" DROP CONSTRAINT "field_updates_userId_fkey";

-- DropTable
DROP TABLE "field_updates";
