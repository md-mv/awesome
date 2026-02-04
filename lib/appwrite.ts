import { Account, Client, TablesDB } from "react-native-appwrite";

//! is telling that the programmer is sure that this value will not be null -> thus ignoring the error
//export is for this client var to be available later on in the project
export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!);

export const account = new Account(client);
export const databases = new TablesDB(client);

export const DATABASE_ID = process.env.EXPO_PUBLIC_DB_ID!;
export const HABITS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID!;
export const COMPLETIONS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID!;

export const AI_HOST = process.env.EXPO_PUBLIC_AI_HOST_IP!;
export const API_HOST = process.env.EXPO_PUBLIC_API_HOST_IP!;

export const CLARITY_PROJECT_ID = process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID!;
export interface RealtimeResponse {
  events: string[];
  payload: any;
}
