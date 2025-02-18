import {
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
  StorageProvider,
  useFirebaseApp,
  useInitAuth,
} from "reactfire";
import { connectAuthEmulator, getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { Material3ThemeProvider } from "@/lib/Material3ThemeProvider";
import { Stack } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialNavBar from "@/components/material-nav-bar";
import { FirebaseError } from "firebase/app";

GoogleSignin.configure({
  webClientId:
    "465591214869-o74r5cpetehg66fnfd570qd34kvj2m6s.apps.googleusercontent.com",
});

export const firebaseConfig = {
  apiKey: "AIzaSyAhtwbLxecmNvnozWuQY6tbQcicQUctH9E",
  authDomain: "iac-chat.firebaseapp.com",
  projectId: "iac-chat",
  storageBucket: "iac-chat.appspot.com",
  messagingSenderId: "465591214869",
  appId: "1:465591214869:web:6d9a408622c6b81cd7bf1c",
};

export function FirebaseProviders({ children }: { children: React.ReactNode }) {
  const app = useFirebaseApp();
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const { status: authInitStatus, data: auth } = useInitAuth(async (app) => {
    try {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // Already initialized
      return getAuth(app);
    }
  });

  if (authInitStatus === "loading") {
    return null;
  }

  if (__DEV__) {
    try {
      connectFirestoreEmulator(firestore, "localhost", 8080);
      connectStorageEmulator(storage, "localhost", 9199);
      // https://github.com/firebase/firebase-js-sdk/issues/6824
      // @ts-ignore
      if (!auth.config.emulator) {
        connectAuthEmulator(auth, "http://localhost:9099");
      }
    } catch (e) {
      if (e instanceof FirebaseError && e.code === "failed-precondition") {
        // Suppress error
      } else {
        throw e;
      }
    }
  }

  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestore}>
        <StorageProvider sdk={storage}>{children}</StorageProvider>
      </FirestoreProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FirebaseProviders>
        <Material3ThemeProvider sourceColor="#74e362">
          <Stack
            screenOptions={{
              header: (props) => <MaterialNavBar {...props} />,
              headerShown: false,
              animation: "fade_from_bottom",
            }}
          />
        </Material3ThemeProvider>
      </FirebaseProviders>
    </FirebaseAppProvider>
  );
}
