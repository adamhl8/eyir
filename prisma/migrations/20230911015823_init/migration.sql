-- CreateTable
CREATE TABLE "FaqSettings" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "faqChannelId" TEXT NOT NULL,
    "faqLogChannelId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FaqMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "faqChannelId" TEXT NOT NULL,
    CONSTRAINT "FaqMessage_faqChannelId_fkey" FOREIGN KEY ("faqChannelId") REFERENCES "FaqSettings" ("faqChannelId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FaqSettings_faqChannelId_key" ON "FaqSettings"("faqChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "FaqSettings_faqLogChannelId_key" ON "FaqSettings"("faqLogChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "FaqMessage_fileName_key" ON "FaqMessage"("fileName");
