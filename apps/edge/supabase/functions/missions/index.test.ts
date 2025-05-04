import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";

const mockMissions = [
  {
    id: 'colors',
    name: 'Colors',
    description: 'Learn to identify and name different colors in English.',
    vocabulary: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown'],
  },
  {
    id: 'numbers',
    name: 'Numbers',
    description: 'Count and recognize numbers from one to ten.',
    vocabulary: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  },
  {
    id: 'greetings',
    name: 'Greetings',
    description: 'Practice common greetings and polite expressions.',
    vocabulary: ['hi', 'hello', 'bye', 'goodbye', 'yes', 'no', 'please', 'thank you', 'sorry', 'good'],
  }
];

Deno.test("Mission data structure should be valid", () => {
  mockMissions.forEach(mission => {
    assertEquals(typeof mission.id, 'string');
    assertEquals(typeof mission.name, 'string');
    assertEquals(typeof mission.description, 'string');
    assertEquals(Array.isArray(mission.vocabulary), true);
    assertEquals(mission.vocabulary.length > 0, true);
  });
});

Deno.test("Mission IDs should be unique", () => {
  const ids = mockMissions.map(mission => mission.id);
  const uniqueIds = [...new Set(ids)];
  assertEquals(ids.length, uniqueIds.length);
});
