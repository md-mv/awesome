import { Models } from "react-native-appwrite";

//Habit will include a specifiic format of attributes, but also it is going to include the extra stuff from a normal appwrite document
export interface Habit extends Models.DefaultRow {
  user_id: string;
  title: string;
  description: string;
  frequency: string;
  streak_count: number;
  last_completed: Date;
  created_at: string;
}

export interface HabitCompletion extends Models.DefaultRow {
  habit_id: string;
  user_id: string;
  completed_at: string;
}
