// done manually , cuz neon not connecting
ALTER TABLE "Chatbot" ADD COLUMN IF NOT EXISTS "botType" TEXT NOT NULL DEFAULT 'support';
ALTER TABLE "Chatbot" ADD COLUMN IF NOT EXISTS "fallbackMessage" TEXT NOT NULL DEFAULT 'I don''t have information on that yet. Please contact the team directly and they''ll be happy to help.';
