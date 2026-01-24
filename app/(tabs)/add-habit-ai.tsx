import {
  API_HOST,
  DATABASE_ID,
  HABITS_COLLECTION_ID,
  databases,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Button,
  SegmentedButtons,
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

const getTasksAi = async () => {
  // const result = await getData();

  // const result = await getData();

  // fetch(`${AI_HOST}/api/chat`, {
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded'
  //     },
  //     body: '{\n  "model": "llama3",\n  "messages": [\n    { "role": "user", "content": "What should I do [ff]?"  }\n\n  ],\n  "stream": false\n}'
  // });

  // "What should I do to complete a [TASK] in a [TIMEFRAME]? Split the task into pieces to be fulfilled each day to finish the task successfully within the timeframe. output the chunks, by separating them from each other with a new line. all chunks should be separated from another output by === before the first chunk and after the end of the last chunk. TASK=get a six pack. TIMEFRAME=two months. ```json ```",

  // const ollama = new Ollama({ host: `${AI_HOST}` });

  // const response = await ollama.chat({
  //   model: "llama3",
  //   messages: [
  //     {
  //       role: "user",
  //       content:
  //         "Create tasks for every day of 10 days timeframe to achieve six pack",
  //     },
  //   ],
  //   stream: false,
  //   format: {
  //     type: "object",
  //     properties: {
  //       tasks: {
  //         type: "array",
  //         names: {
  //           type: "string",
  //         },
  //       },
  //     },
  //     required: ["tasks"],
  //   },
  // });

  // console.log(response.message.content);

  // await resolveAfter3Minutes();
  const response = await fetch(`${API_HOST}`);
  const result = await response.json();
  console.log(result);
  //     const client = Instructor({
  //   client: ollama,
  //   mode: "FUNCTIONS"
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

//  getTasksAi();

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");

  const [error, setError] = useState<string>("");
  const router = useRouter();

  const theme = useTheme();
  const { user } = useAuth();

  //   function resolveAfterMinutes() {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       // resolve("resolved");
  //     }, 3*60*1000);
  //   });
  // }

  //async, because we are going to be accessing db stuff

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

  return (
    <View style={styles.container}>
      <TextInput
        label="Title"
        mode="outlined"
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        label="Description"
        mode="outlined"
        onChangeText={setDescription}
        style={styles.input}
      />
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
      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={!title || !description}
      >
        Add Habit
      </Button>

      <Button
        mode="contained"
        onPress={getTasksAi}
        disabled={!title || !description}
      >
        Add AI Habits
      </Button>

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
});
