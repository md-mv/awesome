import {
  API_HOST,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text, TextInput, useTheme } from "react-native-paper";

export interface HabitDraft {
  title: string;
  description: string;
}
const FREQUENCIES = ["daily", "weekly", "monthly"];

//key value store, key is from FREQUENCIES array, value is a number
type Frequency = (typeof FREQUENCIES)[number];

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
  const task = "happiness";

  try {
    const response = await fetch(`${API_HOST}`);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
  } catch (error) {
    console.error(error);
  }
}

export default function AddGoalScreen() {
  const [goal, setGoal] = useState<string>("");
  // const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");

  const [error, setError] = useState<string>("");
  const router = useRouter();

  const theme = useTheme();
  const { user } = useAuth();

  const [habitDrafts, setHabitDrafts] = useState<HabitDraft[]>([]);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  const [loading, setLoading] = useState<Boolean>(false);

  const [currentText, setCurrentText] = useState("");

  const texts = [
    "Loading...",
    "Searching for WiFi...",
    "Calling the waiter...",
    "Asking for WiFi password...",
    "Connecting to the internet...",
    "Touching grass...",
    "Searching for GPU...",
    "Browsing Amazon...",
    "Looking for money to buy GPU...",
    "Did not find the money to buy GPU...",
    "Searching for CPU...",
    "Found CPU...",
    "Searching for AI model on the internet...",
    "Found llama 3...",
    "Sending the request to llama 3...",
    "Checking the format...",
    "Resending request...",
    "Connecting to database...",
    "Looking up NASA records...",
    "Flying to the Moon...",
    "Flying back...",
    "Running outside...",
    "Made a friend...",
    "It should have already given back the answer...",
    "Usually it does...",
    "Hold on tight...",
    "Tighter...",
    "You really should consider buying paid version...",
  ];
  let point = -1;
  useEffect(() => {
    if (loading) {
      const intervalId = setInterval(() => {
        setCurrentText((prevText) => {
          // const currentIndex = texts.indexOf(prevText);
          if (point >= texts.length - 1) {
            point = -1;
          }
          point = point + 1;

          // const nextIndex = point % texts.length;
          // console.log(texts[point]);
          return texts[point];
        });
      }, 5000);

      return () => clearInterval(intervalId); // Clean up on unmount
    }
  }, [loading]);

  //   function resolveAfterMinutes() {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       // resolve("resolved");
  //     }, 3*60*1000);
  //   });
  // }

  // let loaded = false;
  const getTasksAi = async () => {
    // const result = await getData();

    // await resolveAfter3Minutes();
    setLoading(true);
    // performance.mark("request to AI API sent");

    try {
      let data;
      let result;
      let jsonCorrect = false;
      while (!jsonCorrect) {
        try {
          const response = await fetch(`${API_HOST}/goals`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: goal }),
          });
          result = await response.json();
          data = JSON.parse(result);
          jsonCorrect = true;
        } catch (er) {
          if (er instanceof Error) {
            setError(er.message);
            return;
          }
          setError("There was an error creating a habit");
        }
      }
      // console.log(result);
      // console.log("tasks: ");
      const tasks = data.tasks;

      let res: HabitDraft[] = [];

      for (let i in tasks) {
        let gg: HabitDraft = {
          title: tasks[i].name,
          description: tasks[i].description,
        };

        res.push(gg);
      }

      await setHabitDrafts(res as HabitDraft[]);

      // console.log("habit drafts: ");
      // console.log(habitDrafts);
      // console.log("hopefully it reaches here");

      // performance.mark("request to AI API received");

      // performance.measure(
      //   "loadTime",
      //   "request to AI API sent",
      //   "request to AI API received",
      // );

      // const measure = performance.getEntriesByName("loadTime")[0];
      // const loadTime = measure.duration / 1000; // Convert to seconds

      // console.log(`Page loaded in ${loadTime.toFixed(2)} seconds.`);
      setLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("There was an error creating a habit");
    }
  };

  //async, because we are going to be accessing db stuff
  // const handleSubmit = async () => {
  //   console.log("handleSubmit: habit drafts: ");
  //   console.log(habitDrafts);
  //   //make sure the user exists before adding this
  //   if (!user) return;
  //   try {
  //     //  process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID has to be in ' ' not in ""

  //     try {
  //       //  process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID has to be in ' ' not in ""

  //       for (let ii = 0; ii < habitDrafts.length; ii++) {
  //         console.log(ii);
  //         const foundDescription = await habitDrafts[ii].title;
  //         console.log(foundDescription);
  //         await databases.createRow(
  //           DATABASE_ID,
  //           HABITS_COLLECTION_ID,
  //           ID.unique(),
  //           {
  //             user_id: user.$id,
  //             title: habitDrafts[ii].title,
  //             description: habitDrafts[ii].description,
  //             frequency,
  //             streak_count: 0,
  //             last_completed: new Date(),
  //             created_at: new Date(),
  //           },
  //         );

  //         //delete from array
  //         await setHabitDrafts(
  //           habitDrafts.filter((a) => a.title !== habitDrafts[ii].title),
  //         );
  //       }
  //       console.log("adding and deleting habitDrafts");
  //       console.log(habitDrafts);
  //       // router.back();
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         setError(error.message);
  //         return;
  //       }
  //       setError("There was an error creating a habit");
  //     }

  //     // router.back();
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       setError(error.message);
  //       return;
  //     }
  //     setError("There was an error creating a habit");
  //   }
  // };

  const handleDeleteHabitDraft = async (id: string) => {
    try {
      //delete from array
      await setHabitDrafts(habitDrafts.filter((a) => a.title !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddHabitDraft = async (id: string) => {
    //make sure the user exists before adding this

    // console.log("add habit handle");
    // console.log(id);
    if (!user) return;
    try {
      //  process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID has to be in ' ' not in ""
      const foundDescription = await habitDrafts.find(
        (item) => item.title === id,
      );
      await databases.createRow(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title: id,
          description: foundDescription?.description,
          frequency,
          streak_count: 0,
          last_completed: new Date(),
          created_at: new Date(),
        },
      );

      //delete from array
      await setHabitDrafts(habitDrafts.filter((a) => a.title !== id));

      // router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("There was an error creating a habit");
    }
  };

  const isHabitCompleted = (habitId: HabitDraft) =>
    habitDrafts?.includes(habitId);

  //parenthesis not curly brackets because return a view
  const renderRightActions = (habitId: HabitDraft) => (
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
      {/* {habitDrafts?.length === 0 ? (
        
      ) : null} */}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Text disabled={habitDrafts?.length === 0} style={styles.goalText}>
            Your Goal: {goal}
          </Text>
        </View>
        {/* <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={habitDrafts?.length === 0}
        >
          Add Habits To Routine
        </Button> */}

        {habitDrafts?.length === 0 ? (
          <View style={styles.containerAdd}>
            <TextInput
              label="I want to achieve: "
              mode="outlined"
              placeholder="six pack"
              onChangeText={setGoal}
              style={styles.inputAdd}
            />
            <Button mode="contained" onPress={getTasksAi} disabled={!goal}>
              Add Goal
            </Button>

            {loading ? (
              <View>
                <Text style={styles.loadingText}>{currentText}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          habitDrafts?.map((habitDraft, key) => (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[habitDraft.title] = ref;
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={() => renderRightActions(habitDraft)}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  handleDeleteHabitDraft(habitDraft.title);
                } else if (direction === "right") {
                  handleAddHabitDraft(habitDraft.title);
                }

                swipeableRefs.current[habitDraft.title]?.close();
              }}
            >
              {/* overshootLeft={false} to make sure the swiping is not overly responsive */}
              <Surface style={[styles.card]} elevation={0}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{habitDraft.title}</Text>
                  <Text style={styles.cardDescription}>
                    {habitDraft.description}
                  </Text>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>

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
    // flex: 1,
    marginBottom: 8,
  },
  frequencyContainer: {
    marginBottom: 24,
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
  lottie: {
    width: 100,
    height: 100,
  },
  loadingText: {
    marginTop: 100,
    color: "#1a2a88",
    fontWeight: "bold",
    fontSize: 14,
    justifyContent: "center",
  },
  goalText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#22223b",
  },
  containerAdd: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  inputAdd: {
    marginBottom: 8,
  },
});
