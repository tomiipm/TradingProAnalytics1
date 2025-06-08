import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { darkTheme } from "../constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[styles.container, { backgroundColor: darkTheme.background }]}>
        <Text style={[styles.title, { color: darkTheme.text }]}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: darkTheme.accent }]}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
  },
});