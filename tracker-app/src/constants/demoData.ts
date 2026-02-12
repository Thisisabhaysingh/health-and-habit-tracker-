import type { ExerciseTask, MealEntry, ScreenSession } from '@/types/tracker';

const today = new Date();
const isoDate = (date: Date) => date.toISOString();
const dateKey = (date: Date) => date.toISOString().split('T')[0];

export const demoMeals: MealEntry[] = [
  {
    id: 'meal-1',
    foodName: 'Overnight Oats',
    calories: 320,
    portion: 1,
    unit: 'serving',
    loggedAt: isoDate(new Date(today.getTime() - 1000 * 60 * 60 * 6)),
  },
  {
    id: 'meal-2',
    foodName: 'Grilled Paneer Salad',
    calories: 450,
    portion: 1,
    unit: 'serving',
    loggedAt: isoDate(new Date(today.getTime() - 1000 * 60 * 60 * 2)),
  },
  {
    id: 'meal-3',
    foodName: 'Green Smoothie',
    calories: 180,
    portion: 1,
    unit: 'serving',
    loggedAt: isoDate(new Date(today.getTime() - 1000 * 60 * 30)),
  },
];

export const demoExerciseTasks: ExerciseTask[] = [
  {
    id: 'task-1',
    label: 'Mobility Flow',
    minutes: 15,
    category: 'mobility',
    completed: true,
  },
  {
    id: 'task-2',
    label: 'Strength Circuit',
    minutes: 20,
    category: 'strength',
    completed: false,
  },
  {
    id: 'task-3',
    label: 'Step Goal',
    minutes: 45,
    category: 'steps',
    completed: false,
  },
];

const buildDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() - offsetDays);
  return d;
};

export const demoScreenSessions: ScreenSession[] = Array.from({ length: 7 }).map((_, idx) => {
  const d = buildDate(idx);
  return {
    id: `screen-${idx}`,
    date: dateKey(d),
    minutes: 180 - idx * 10 + (idx % 2 === 0 ? 15 : -5),
  };
});
