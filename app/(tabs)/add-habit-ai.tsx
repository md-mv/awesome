import {
  API_HOST,
  DATABASE_ID,
  HABITS_COLLECTION_ID,
  databases,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/type/database.type";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import {
  Button,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];

//key value store, key is from FREQUENCIES array, value is a number
type Frequency = (typeof FREQUENCIES)[number];

// fetch('http://google.com:11434/api/chat', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     body: '{\n  "model": "llama3",\n  "messages": [\n    { "role": "user", "content": "What should I do [ff]?"  }\n\n  ],\n  "stream": false\n}'
// });

function resolveAfter3Minutes() {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve("resolved");
        getData();
      },
      60 * 10 * 1000,
    );
  });
}

async function getData() {
  // const url = "https://example.org/products.json";
  const task = "happiness";
  // const timeframe = "two months";
  // const question =
  //   "What should I do to complete a [TASK] in a [TIMEFRAME]? Split the task into pieces to be fulfilled each day to finish the task successfully within the timeframe. output the chunks, by separating them from each other with a new line. all chunks should be separated from another output by === before the first chunk and after the end of the last chunk. TASK=" +
  //   task +
  //   ". TIMEFRAME=" +
  //   timeframe;
  try {
    // const response = await fetch(url);
    // const response = await fetch(AI_HOST + "api/chat", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //   },
    //   body:
    //     '{\n  "model": "llama3",\n  "messages": [\n    { "role": "user", "content": "' +
    //     question +
    //     '"  }\n\n  ],\n  "stream": false\n}',
    // });

    const response = await fetch(`${API_HOST}`);
    // const response = await fetch(`${API_HOST}`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ task: "task" }),
    // });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

//  getTasksAi();

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");

  const [error, setError] = useState<string>("");
  const router = useRouter();

  const theme = useTheme();
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<string[]>();
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  //   function resolveAfterMinutes() {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       // resolve("resolved");
  //     }, 3*60*1000);
  //   });
  // }

  const getTasksAi = async () => {
    // const result = await getData();

    // await resolveAfter3Minutes();

    const task = "happiness";
    // const response = await fetch(`${API_HOST}` + "/items/" + task);

    const response = await fetch(`${API_HOST}/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: task }),
    });
    const result = await response.json();
    console.log(result);
    //     const client = Instructor({
    //   client: ollama,
    //   mode: "FUNCTIONS"**
    // })

    // const UserSchema = z.object({
    //   // Description will be used in the prompt
    //   age: z.number().describe("The age of the user"),
    //   name: z.string()
    // })

    // // User will be of type z.infer<typeof UserSchema>
    // const user = await client.chat.completions.create({
    //   messages: [{ role: "user", content: "Jason Liu is 30 years old" }],
    //   model: "llama3",
    //   response_model: {
    //     schema: UserSchema,
    //     name: "User"
    //   }
    // })

    // console.log(user)

    // for await (const part of response) {
    //   process.stdout.write(part.message.content);
    //   console.log(part.message.content);
    // }

    // //make sure the user exists before adding this
    // if (!user) return;
    // try {

    //   //  process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID has to be in ' ' not in ""
    //   await databases.createRow(
    //     DATABASE_ID,
    //     HABITS_COLLECTION_ID,
    //     ID.unique(),
    //     {
    //       user_id: user.$id,
    //       title,
    //       description,
    //       frequency,
    //       streak_count: 0,
    //       last_completed: new Date(),
    //       created_at: new Date(),
    //     }
    //   );

    //   router.back();
    // } catch (error) {
    //   if (error instanceof Error) {
    //     setError(error.message);
    //     return;
    //   }
    //   setError("There was an error creating a habit");
    // }
  };

  //async, because we are going to be accessing db stuff
  const handleSubmit = async () => {
    //make sure the user exists before adding this
    if (!user) return;
    try {
      //  process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID has to be in ' ' not in ""
      await databases.createRow(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title,
          description,
          frequency,
          streak_count: 0,
          last_completed: new Date(),
          created_at: new Date(),
        },
      );

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("There was an error creating a habit");
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteRow(DATABASE_ID, HABITS_COLLECTION_ID, id);
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
        <Text style={{ color: "#fff" }}>Added to Habits!</Text>
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <TextInput
              label="I want to achieve: "
              mode="outlined"
              onChangeText={setTitle}
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={getTasksAi}
              disabled={!title || !description}
            >
              Add AI Habits
            </Button>
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
              <Surface style={[styles.card]} elevation={0}>
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

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!title || !description}
        >
          Add Habits To Routine
        </Button>
      </ScrollView>

      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          //setting initial value for the SegmentedButtons
          value={frequency}
          onValueChange={(value) => setFrequency(value)}
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
        />
      </View>

      {error && <Text style={{ color: theme.colors.error }}> {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  input: {
    marginBottom: 8,
  },
  frequencyContainer: {
    marginBottom: 24,
  },

  // container: {
  //   flex: 1,
  //   padding: 16,
  //   backgroundColor: "#f5f5f5",
  // },
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
