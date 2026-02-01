import {
  client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/type/database.type";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DATABASE_ID}.tables.${HABITS_COLLECTION_ID}.rows`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {
          if (response.events.includes("databases.*.tables.*.rows.*.create")) {
            fetchHabits();
          } else if (
            response.events.includes("databases.*.tables.*.rows.*.update")
          ) {
            fetchHabits();
          } else if (
            response.events.includes("databases.*.tables.*.rows.*.delete")
          ) {
            fetchHabits();
          }
        },
      );

      const completionsChannel = `databases.${DATABASE_ID}.tables.${COMPLETIONS_COLLECTION_ID}.rows`;
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {
          if (response.events.includes("databases.*.tables.*.rows.*.create")) {
            fetchCompletions();
          }
        },
      );

      fetchHabits();
      fetchCompletions();

      //this function when called will cancel and unsubscribe the subscription
      return () => {
        habitsSubscription();
        completionsSubscription();
      };
    }
  }, [user]); //dependency array in [] (is called wehn var in this array changes)

  const fetchHabits = async () => {
    try {
      //if user == null then put "" instead
      const response = await databases.listRows(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")],
      );
      console.log(response.rows);
      //Habit interface should extend the type  which is returned by response.rows
      setHabits(response.rows as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCompletions = async () => {
    try {
      const response = await databases.listRows(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")],
      );
      console.log(response.rows);
      const completions = response.rows as HabitCompletion[];
      //Habit interface should extend the type  which is returned by response.rows
      setCompletedHabits(completions);
    } catch (error) {
      console.error(error);
    }
  };

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }
  //returns streak for the habit, best streak and total amount for the habit

  const getStreakData = (habitId: string): StreakData => {
    const habitCompletions = completedHabits
      ?.filter((c) => c.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime(),
      );

    if (habitCompletions?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    //build streak data
    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions?.forEach((c) => {
      const date = new Date(c.completed_at);
      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      streak = currentStreak;
      lastDate = date;
    });

    return { streak, bestStreak, total };
  };

  const loadStreaks = () => {
    let habitStreaks = habits.map((habit) => {
      const { streak, bestStreak, total } = getStreakData(habit.$id);
      return { habit, bestStreak, streak, total };
    });

    let rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);
    // console.log(rankedHabits.map((h) => h.habit.title));

    let badgeStyles = [styles.badge1, styles.badge2, styles.badge3];
  };
  let habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreakData(habit.$id);
    return { habit, bestStreak, streak, total };
  });

  let rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);
  // console.log(rankedHabits.map((h) => h.habit.title));

  let badgeStyles = [styles.badge1, styles.badge2, styles.badge3];
  return (
    <View style={styles.container} onFocus={loadStreaks}>
      <Text style={styles.title} variant="headlineSmall">
        Habit Streaks
      </Text>
      {/* if rankedHabits.length > 0 display this view */}
      {rankedHabits.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>🎖️ Top Streaks</Text>
          {rankedHabits.slice(0, 3).map((item, key) => (
            <View key={key} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[key]]}>
                <Text style={styles.rankingBadgeText}> {key + 1} </Text>
              </View>
              <Text style={styles.rankingHabit}> {item.habit.title}</Text>
              <Text style={styles.rankingStreak}> {item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}
      {habits.length === 0 ? (
        <View>
          <Text>No Habits yet. Add your first Habit</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          {rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
            <Card
              key={key}
              style={[styles.card, key === 0 && styles.firstCard]}
            >
              <Card.Content>
                <Text variant="titleMedium" style={styles.habitTitle}>
                  {habit.title}
                </Text>
                <Text style={styles.habitDescription}>{habit.description}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>🔥 {streak} </Text>
                    <Text style={styles.statLabel}>Current</Text>
                  </View>
                  <View style={styles.statBadgeGold}>
                    <Text style={styles.statBadgeText}>🏆 {bestStreak} </Text>
                    <Text style={styles.statLabel}>Best</Text>
                  </View>
                  <View style={styles.statBadgeGreen}>
                    <Text style={styles.statBadgeText}>✅ {total} </Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  firstCard: {
    borderWidth: 2,
    borderColor: "#7c4dff",
  },
  habitTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },
  habitDescription: {
    color: "#6c6c80",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row", //makes the things inside stay in row instead of a column
    justifyContent: "space-between", //equal space between elements inside it
    marginBottom: 12,
    marginTop: 8,
  },
  statBadge: {
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  statBadgeGold: {
    backgroundColor: "#fffde7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  statBadgeGreen: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  statBadgeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },

  rankingContainer: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  rankingTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#7c4dff",
    letterSpacing: 0.5,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  badge1: {
    backgroundColor: "#ffd700",
  }, //gold
  badge2: {
    backgroundColor: "#c0c0c0",
  }, // silver
  badge3: {
    backgroundColor: "#cd7f32",
  }, //bronze

  rankingBadgeText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },

  rankingHabit: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  rankingStreak: {
    fontSize: 14,
    color: "#7c4dff",
    fontWeight: "bold",
  },
});
