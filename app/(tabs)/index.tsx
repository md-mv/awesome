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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

// import {  } from "react-native";
export default function Index() {
  const { signOut, user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<string[]>();

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  //call this function every time the user changes

  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchHabits();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

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
            fetchTodayCompletions();
          }
        },
      );

      fetchHabits();
      fetchTodayCompletions();
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
      const responseH = await databases.listRows(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")],
      );
      console.log(responseH.rows);

      // const responseC = await databases.listRows(
      //   DATABASE_ID,
      //   COMPLETIONS_COLLECTION_ID,
      //   [Query.equal("user_id", user?.$id ?? "")],
      // );
      // console.log(responseC.rows);

      // for (let i = 0; i < responseC.rows.length; i++) {
      //   let toDelete = true;
      //   for (let j = 0; j < responseH.rows.length; j++) {
      //     if (responseC.rows[i].habit_id == responseH.rows[j].$id) {
      //       toDelete = false;
      //     }
      //   }
      //   // const response = await databases.listRows(
      //   //   DATABASE_ID,
      //   //   COMPLETIONS_COLLECTION_ID,
      //   //   [
      //   //     Query.equal("user_id", user?.$id ?? ""),
      //   //     Query.equal("habit_id", id ?? ""),
      //   //   ],
      //   // );
      //   // console.log(response.rows);

      //   // for (let i = 0; i < response.rows.length; i++) {
      //   console.log("to delete completion id: ");
      //   console.log(responseC.rows[i].$id);
      //   await databases.deleteRow(
      //     DATABASE_ID,
      //     COMPLETIONS_COLLECTION_ID,
      //     responseC.rows[i].$id,
      //   );
      //   // }
      // }

      //Habit interface should extend the type  which is returned by response.rows
      await setHabits(responseH.rows as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      //if user == null then put "" instead
      const response = await databases.listRows(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ],
      );
      console.log(response.rows);
      const completions = response.rows as HabitCompletion[];
      //Habit interface should extend the type  which is returned by response.rows
      await setCompletedHabits(completions.map((c) => c.habit_id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteRow(DATABASE_ID, HABITS_COLLECTION_ID, id);

      const response = await databases.listRows(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.equal("habit_id", id ?? ""),
        ],
      );
      console.log(response.rows);

      for (let i = 0; i < response.rows.length; i++) {
        console.log("to delete completion id: ");
        console.log(response.rows[i].$id);
        await databases.deleteRow(
          DATABASE_ID,
          COMPLETIONS_COLLECTION_ID,
          response.rows[i].$id,
        );
      }

      fetchHabits();
      fetchTodayCompletions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;
    try {
      const currentDate = new Date();
      await databases.createRow(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user.$id,
          completed_at: currentDate.toISOString(),
        },
      );

      const habit = habits?.find((h) => h.$id === id);

      if (!habit) return;

      await databases.updateRow(DATABASE_ID, HABITS_COLLECTION_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: currentDate,
      });

      fetchHabits();
      fetchTodayCompletions();
    } catch (error) {
      console.error(error);
    }
  };

  const isHabitCompleted = (habitId: string) =>
    completedHabits?.includes(habitId);

  //parenthesis not curly brackets because return a view
  const renderRightActions = (habitId: string) => (
    <View style={styles.swipeActionRight}>
      {isHabitCompleted(habitId) ? (
        <Text style={{ color: "#fff" }}>Completed!</Text>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={"#fff"}
        />
      )}
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.swipeActionLeft}>
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Today's Habits
        </Text>
        <Button mode="text" onPress={signOut} icon={"logout"}>
          Sign Out
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No Habits yet. Add your first Habit
            </Text>
          </View>
        ) : (
          habits?.map((habit, key) => (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[habit.$id] = ref;
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={() => renderRightActions(habit.$id)}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  handleDeleteHabit(habit.$id);
                } else if (direction === "right") {
                  handleCompleteHabit(habit.$id);
                }

                swipeableRefs.current[habit.$id]?.close();
              }}
            >
              {/* overshootLeft={false} to make sure the swiping is not overly responsive */}
              <Surface
                style={[
                  styles.card,
                  isHabitCompleted(habit.$id) && styles.cardCompleted,
                ]}
                elevation={0}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardDescription}>
                    {habit.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color={"#ff9800"}
                      />
                      <Text style={styles.streakText}>
                        {habit.streak_count} day streak
                      </Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>
                        {habit.frequency.charAt(0).toUpperCase() +
                          habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
  },

  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cardCompleted: {
    opacity: 0.6,
  },

  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  cardDescription: {
    fontSize: 16,
    marginBottom: 16,
    color: "#6c6c80",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },

  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
    // textTransform: "uppercase",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666666",
  },
  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionRight: {
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});
