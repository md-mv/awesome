import { DATABASE_ID, HABITS_COLLECTION_ID, databases } from "@/lib/appwrite";
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

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");

  const [error, setError] = useState<string>("");
  const router = useRouter();

  const theme = useTheme();
  const { user } = useAuth();

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
        }
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
