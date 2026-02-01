import { AuthProvider, useAuth } from "@/lib/auth-context";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

//the function to check user's auth state, now can write  <RouteGuard>
function RouteGuard({ children }: { children: React.ReactNode }) {
  // const isAuth = false;

  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();

  const navigationState = useRootNavigationState();
  //segments help us determine where on the app the user is right now

  const router = useRouter();
  // router.replace("/auth");
  //run immediately when this component renders
  useEffect(() => {
    // console.log("layout useeffect");

    if (!navigationState?.key) return;
    if (isLoadingUser) return;
    const inAuthGroup = segments[0] === "auth";
    if (!user && !inAuthGroup) {
      // console.log("layout useeffect not logged in");
      //replace the user's current route with user's off route
      router.replace("/auth");
    } else if (user && inAuthGroup) {
      // console.log("layout useeffect logged in");
      router.replace("/");
    }
  }, [user, segments, isLoadingUser, navigationState]); // call it every time the user is changed, or segments are changed

  //since this is only a wrapper component i dont want to return any UI only children
  return <>{children}</>;
}
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <SafeAreaProvider>
            <RouteGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
