import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";

const mockSession = {
  id: "test-session-id",
  userId: "test-user-id",
  startedAt: new Date().toISOString(),
  endedAt: null,
  missionType: "colors"
};

const mockMessages = [
  {
    id: "test-message-1",
    sessionId: "test-session-id",
    role: "assistant",
    content: "Let's learn colors! Can you say a color?",
    createdAt: new Date().toISOString()
  },
  {
    id: "test-message-2",
    sessionId: "test-session-id",
    role: "user",
    content: "Red!",
    createdAt: new Date().toISOString()
  }
];

const mockScores = [
  {
    id: "test-score-1",
    sessionId: "test-session-id",
    mission: "colors",
    targetWords: ["red"],
    success: true,
    score: 5
  }
];

Deno.test("Session data structure should be valid", () => {
  assertEquals(typeof mockSession.id, 'string');
  assertEquals(typeof mockSession.userId, 'string');
  assertEquals(typeof mockSession.startedAt, 'string');
  assertEquals(typeof mockSession.missionType, 'string');
  
  const date = new Date(mockSession.startedAt);
  assertEquals(isNaN(date.getTime()), false);
});

Deno.test("Message data structure should be valid", () => {
  mockMessages.forEach(message => {
    assertEquals(typeof message.id, 'string');
    assertEquals(typeof message.sessionId, 'string');
    assertEquals(['user', 'assistant'].includes(message.role as string), true);
    assertEquals(typeof message.content, 'string');
    assertEquals(typeof message.createdAt, 'string');
    
    const date = new Date(message.createdAt);
    assertEquals(isNaN(date.getTime()), false);
  });
});

Deno.test("Score data structure should be valid", () => {
  mockScores.forEach(score => {
    assertEquals(typeof score.id, 'string');
    assertEquals(typeof score.sessionId, 'string');
    assertEquals(typeof score.mission, 'string');
    assertEquals(Array.isArray(score.targetWords), true);
    assertEquals(typeof score.success, 'boolean');
    assertEquals(typeof score.score, 'number');
  });
});

Deno.test("Session formatting should be correct", () => {
  const formattedSession = {
    id: mockSession.id,
    startedAt: mockSession.startedAt,
    endedAt: mockSession.endedAt,
    missionType: mockSession.missionType,
    messageCount: mockMessages.length,
    totalScore: mockScores.reduce((sum, score) => sum + score.score, 0)
  };
  
  assertEquals(formattedSession.id, mockSession.id);
  assertEquals(formattedSession.startedAt, mockSession.startedAt);
  assertEquals(formattedSession.endedAt, mockSession.endedAt);
  assertEquals(formattedSession.missionType, mockSession.missionType);
  assertEquals(formattedSession.messageCount, 2);
  assertEquals(formattedSession.totalScore, 5);
});
