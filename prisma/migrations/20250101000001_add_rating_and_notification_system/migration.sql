-- Migration: Add Rating and Notification System
-- This migration adds the complete rating system and scalable notifications

-- Add new enum values to existing enums
ALTER TYPE "EventStatus" ADD VALUE 'ARCHIVED';

-- Create new enums
CREATE TYPE "NotificationCategory" AS ENUM (
  'EVENT',
  'APPLICATION',
  'RATING',
  'MESSAGE',
  'SYSTEM',
  'SECURITY',
  'PAYMENT',
  'PARTNERSHIP',
  'ACHIEVEMENT',
  'REMINDER',
  'REPORT',
  'SUPPORT'
);

CREATE TYPE "NotificationSubcategory" AS ENUM (
  'EVENT_CREATED',
  'EVENT_UPDATED',
  'EVENT_CANCELLED',
  'EVENT_REMINDER',
  'EVENT_ARCHIVED',
  'APPLICATION_RECEIVED',
  'APPLICATION_ACCEPTED',
  'APPLICATION_REJECTED',
  'APPLICATION_WITHDRAWN',
  'RATING_REMINDER',
  'RATING_RECEIVED',
  'RATING_PENDING',
  'RATING_COMPLETED',
  'MESSAGE_RECEIVED',
  'MESSAGE_READ',
  'MESSAGE_REPLY',
  'SYSTEM_MAINTENANCE',
  'SYSTEM_UPDATE',
  'SYSTEM_ALERT',
  'LOGIN_ATTEMPT',
  'PASSWORD_CHANGE',
  'VERIFICATION_REQUIRED',
  'BADGE_EARNED',
  'MILESTONE_REACHED',
  'LEVEL_UP'
);

CREATE TYPE "NotificationPriority" AS ENUM (
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
);

CREATE TYPE "NotificationStatus" AS ENUM (
  'PENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'ACTED',
  'EXPIRED',
  'ARCHIVED'
);

CREATE TYPE "RatingStatus" AS ENUM (
  'PENDING',
  'VOLUNTEER_RATED',
  'ORGANIZATION_RATED',
  'BOTH_RATED'
);

CREATE TYPE "DigestFrequency" AS ENUM (
  'IMMEDIATE',
  'HOURLY',
  'DAILY',
  'WEEKLY'
);

-- Create new tables
CREATE TABLE "event_ratings" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "raterId" TEXT NOT NULL,
  "ratedId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "feedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "event_ratings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_templates" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "NotificationCategory" NOT NULL,
  "subcategory" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "actionText" TEXT,
  "variables" TEXT[],
  "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
  "expiresIn" INTEGER,
  "language" TEXT NOT NULL DEFAULT 'es',
  "region" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_notification_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "preferences" JSONB NOT NULL,
  "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
  "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
  "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
  "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
  "quietHoursStart" TEXT,
  "quietHoursEnd" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "digestFrequency" "DigestFrequency" NOT NULL DEFAULT 'DAILY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- Modify existing tables
ALTER TABLE "event_applications" 
ADD COLUMN "ratingStatus" "RatingStatus" NOT NULL DEFAULT 'PENDING';

-- Remove old rating fields from event_applications
ALTER TABLE "event_applications" 
DROP COLUMN IF EXISTS "rating",
DROP COLUMN IF EXISTS "feedback",
DROP COLUMN IF EXISTS "completedAt";

-- Add new columns to notifications table
ALTER TABLE "notifications" 
ADD COLUMN "category" "NotificationCategory",
ADD COLUMN "subcategory" TEXT,
ADD COLUMN "template" TEXT,
ADD COLUMN "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
ADD COLUMN "actionText" TEXT,
ADD COLUMN "actionData" JSONB,
ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "readAt" TIMESTAMP(3),
ADD COLUMN "sentAt" TIMESTAMP(3),
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "clickedAt" TIMESTAMP(3),
ADD COLUMN "relatedEventId" TEXT,
ADD COLUMN "groupId" TEXT;

-- Create indexes
CREATE INDEX "event_ratings_eventId_idx" ON "event_ratings"("eventId");
CREATE INDEX "event_ratings_raterId_idx" ON "event_ratings"("raterId");
CREATE INDEX "event_ratings_ratedId_idx" ON "event_ratings"("ratedId");
CREATE INDEX "event_ratings_unique_idx" ON "event_ratings"("eventId", "raterId", "ratedId");

CREATE INDEX "notification_templates_name_idx" ON "notification_templates"("name");
CREATE INDEX "notification_templates_category_idx" ON "notification_templates"("category");
CREATE INDEX "notification_templates_active_idx" ON "notification_templates"("active");

CREATE INDEX "user_notification_preferences_userId_idx" ON "user_notification_preferences"("userId");

CREATE INDEX "notifications_userId_status_idx" ON "notifications"("userId", "status");
CREATE INDEX "notifications_category_subcategory_idx" ON "notifications"("category", "subcategory");
CREATE INDEX "notifications_expiresAt_idx" ON "notifications"("expiresAt");
CREATE INDEX "notifications_relatedEventId_idx" ON "notifications"("relatedEventId");

-- Create unique constraints
CREATE UNIQUE INDEX "event_ratings_unique" ON "event_ratings"("eventId", "raterId", "ratedId");
CREATE UNIQUE INDEX "notification_templates_name_unique" ON "notification_templates"("name");
CREATE UNIQUE INDEX "user_notification_preferences_userId_unique" ON "user_notification_preferences"("userId");

-- Add foreign key constraints
ALTER TABLE "event_ratings" ADD CONSTRAINT "event_ratings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_ratings" ADD CONSTRAINT "event_ratings_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_ratings" ADD CONSTRAINT "event_ratings_ratedId_fkey" FOREIGN KEY ("ratedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert default notification templates
INSERT INTO "notification_templates" ("id", "name", "category", "subcategory", "title", "message", "actionText", "variables", "priority", "expiresIn", "language") VALUES
('template_rating_reminder_first', 'rating_reminder_first', 'RATING', 'RATING_REMINDER', 'Califica tu experiencia en {eventTitle}', 'El evento "{eventTitle}" ha sido archivado. Por favor califica tu experiencia para ayudar a mejorar la comunidad.', 'Calificar Ahora', ARRAY['eventTitle'], 'NORMAL', 7, 'es'),
('template_rating_reminder_second', 'rating_reminder_second', 'RATING', 'RATING_REMINDER', 'Recordatorio: Califica tu experiencia', 'Aún no has calificado tu experiencia en "{eventTitle}". Tu opinión es importante para la comunidad.', 'Calificar Ahora', ARRAY['eventTitle'], 'HIGH', 4, 'es'),
('template_rating_reminder_final', 'rating_reminder_final', 'RATING', 'RATING_REMINDER', 'Última oportunidad para calificar', 'Esta es tu última oportunidad para calificar tu experiencia en "{eventTitle}". El evento será archivado permanentemente.', 'Calificar Ahora', ARRAY['eventTitle'], 'URGENT', 1, 'es'),
('template_rating_received', 'rating_received', 'RATING', 'RATING_RECEIVED', 'Has recibido una calificación', 'Has recibido una calificación de {rating} estrellas por tu participación en "{eventTitle}".', 'Ver Detalles', ARRAY['rating', 'eventTitle'], 'NORMAL', 30, 'es'),
('template_rating_completed', 'rating_completed', 'RATING', 'RATING_COMPLETED', 'Calificación completada', 'Todas las calificaciones para "{eventTitle}" han sido completadas. El evento ha sido archivado exitosamente.', 'Ver Evento', ARRAY['eventTitle'], 'NORMAL', 30, 'es'),
('template_event_archived', 'event_archived', 'EVENT', 'EVENT_ARCHIVED', 'Evento archivado', 'El evento "{eventTitle}" ha sido archivado automáticamente. Ahora puedes calificar tu experiencia.', 'Calificar Experiencia', ARRAY['eventTitle'], 'NORMAL', 7, 'es'),
('template_organization_rating_reminder', 'organization_rating_reminder', 'RATING', 'RATING_REMINDER', 'Califica a los voluntarios', 'El evento "{eventTitle}" ha sido archivado. Por favor califica a los {volunteersCount} voluntarios participantes.', 'Calificar Voluntarios', ARRAY['eventTitle', 'volunteersCount'], 'NORMAL', 7, 'es');

-- Update existing notifications to have default values
UPDATE "notifications" SET 
  "category" = 'SYSTEM',
  "subcategory" = 'INFO',
  "status" = CASE WHEN "read" = true THEN 'READ' ELSE 'UNREAD' END,
  "priority" = 'NORMAL';

-- Set default values for new columns
ALTER TABLE "notifications" 
ALTER COLUMN "category" SET DEFAULT 'SYSTEM',
ALTER COLUMN "subcategory" SET DEFAULT 'INFO',
ALTER COLUMN "priority" SET DEFAULT 'NORMAL',
ALTER COLUMN "status" SET DEFAULT 'UNREAD';

-- Make category and priority NOT NULL after setting defaults
ALTER TABLE "notifications" 
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "priority" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;


