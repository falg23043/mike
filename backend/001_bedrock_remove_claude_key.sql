-- Migration 001: Replace per-user Claude API key with AWS Bedrock server-side credentials

-- Remove claude_api_key column (no longer needed)
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS claude_api_key;

-- Update default tabular model to Bedrock Haiku
ALTER TABLE public.user_profiles ALTER COLUMN tabular_model SET DEFAULT 'bedrock-claude-haiku-4-5';

-- Migrate existing user preferences to Bedrock equivalents
UPDATE public.user_profiles
  SET tabular_model = 'bedrock-claude-haiku-4-5'
  WHERE tabular_model IN ('claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-7', 'claude-opus-4-8', 'gemini-3-flash-preview');
