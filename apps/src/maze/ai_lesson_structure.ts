// Rough outline of the data structures for AI-adaptive maze lessons.

export interface Unit {
  name: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  name: string;
  description: string;
  levels: Level[];
}

export type Level = DynamicLevel;

export type LevelType = 'dynamic';

interface LevelBase {
  type: LevelType;
  name: string;
  description: string;
}

export interface DynamicLevel extends LevelBase {
  type: 'dynamic';
}
