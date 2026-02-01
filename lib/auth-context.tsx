import { createContext, useContext, useEffect, useState } from "react";

import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

//something like an interface
type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoadingUser: boolean;
  //Promise<string> to return error messages
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

// if the use exists (meaning he is logged in) ..., if this user variable is null then the user is not logged in
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );

  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true); //start value

  useEffect(() => {
    getUser();
  }, []); //[] here is to make sure it it not caleld in an infinite loop of refreshing and  reloading this component

  //get session( of user var) to. call it every time o provider renders (to get user session if user is authenticated)
  const getUser = async () => {
    try {
      const session = await account.get();
      await setUser(session);
    } catch (error) {
      await setUser(null);
    } finally {
      await setIsLoadingUser(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    //try to do the signup operation on appwrite
    try {
      //will create a user in the appwrite project, you created
      await account.create(ID.unique(), email, password);
      //and sign in the user
      await signIn(email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An error occured during sign up";
    }
  };
  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      await setUser(session);

      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An error occured during sign in";
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession("current");
      await setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoadingUser, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context == undefined) {
    throw new Error("useAuth must be inside of the AuthProvider");
  }
  return context;
}
