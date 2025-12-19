-- CreateTable
CREATE TABLE "synsets" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "synsets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "synsets_path_key" ON "synsets"("path");

-- CreateIndex
CREATE INDEX "synsets_path_idx" ON "synsets"("path");

-- CreateIndex
CREATE INDEX "synsets_deleted_idx" ON "synsets"("deleted");
