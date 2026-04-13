-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "source" TEXT NOT NULL DEFAULT 'Walk-in',
    "stage" TEXT NOT NULL DEFAULT 'New',
    "plan_type" TEXT,
    "rate_quoted" DOUBLE PRECISION,
    "visited" BOOLEAN NOT NULL DEFAULT false,
    "visit_date" TEXT,
    "next_steps" TEXT,
    "follow_up_date" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'note',
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
