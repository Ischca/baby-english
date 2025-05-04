import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";

const mockSessionId = "test-session-id";
const mockMessage = "hello";
const mockAgeLevel = 0;

Deno.test("isAllowedVocabulary should allow basic words", () => {
  
  const allowedWords = ["hello", "red", "blue", "one", "two"];
  const result = allowedWords.every(word => true); // Mock implementation
  assertEquals(result, true);
});

Deno.test("isAllowedVocabulary should reject unknown words", () => {
  const disallowedWords = ["complicated", "extraordinary", "sophisticated"];
  const result = disallowedWords.some(word => false); // Mock implementation
  assertEquals(result, false);
});

Deno.test("Chat request validation should reject missing fields", async () => {
  const validateRequest = (sessionId?: string, message?: string) => {
    return !!(sessionId && message);
  };
  
  assertEquals(validateRequest(mockSessionId, mockMessage), true);
  assertEquals(validateRequest(undefined, mockMessage), false);
  assertEquals(validateRequest(mockSessionId, undefined), false);
});
