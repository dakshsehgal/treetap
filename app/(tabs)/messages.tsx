import { StyleSheet, Image, Platform } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar, Card, IconButton } from "react-native-paper";
import { Link } from "expo-router";
import { useContext, useEffect } from "react";
import { DeviceContext } from "../DeviceContext";

export default function TabTwoScreen() {
  const { deviceMessages, startScan, stopScan, username } =
    useContext(DeviceContext);

  //   useEffect(() => {
  //     startScan();

  //     return () => stopScan(); // Cleanup scan when leaving the screen
  //   }, []);
  const deviceMessagesTest = {
    E: ["33.774864,-84.391503/dakshsehgal/Hey, we have reached the waterfall!"],
  };
  // console.log("my msgs are", deviceMessages);
  const dollarFilter = (char) => char !== "$";
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <ThemedView style={styles.headerView}>
          <Image
            source={require("@/assets/images/forest.jpg")}
            style={styles.reactLogo}
          />

          <ThemedText style={styles.headerText} type="title">
            Messages
          </ThemedText>
        </ThemedView>
      }
      headerHeight={100}
    >
      {Object.entries(deviceMessages).map(([uniqueString, messages]) => {
        console.log(messages);
        if (messages.length == 0) {
          return;
        }
        // messages would be ["lat,long/user/reicp/msg$", "fwefew/fwefew/fwef$"]
        const splitmsg = Array.from(messages[messages.length - 1])
          .filter(dollarFilter)
          .join("")
          .split("/");
        if (splitmsg.length === 4) {
          const sender_name = splitmsg[1];
          const recipient_name = splitmsg[2];
          if (recipient_name !== username) {
            return;
          }
          const actual_msg = splitmsg[3];

          return (
            <Link
              href={{
                pathname: "/conversation",
                params: {
                  //   texts: JSON.stringify([
                  //     {
                  //       ids: 1,
                  //       text: messages.join(""),
                  //       sender: "them",
                  //     },
                  //   ]),
                  sendingDevice: uniqueString,
                },
              }}
              asChild
            >
              <Card>
                <Card.Title
                  title={sender_name}
                  subtitle={actual_msg}
                  key={1}
                  left={(props) => <Avatar.Icon {...props} icon="face-man" />}
                />
              </Card>
            </Link>
          );
        }
      })}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    textAlign: "center",
    marginTop: 60,
    color: "white",
  },
  headerView: {
    height: 550,
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  reactLogo: {
    // height: 180,
    // width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
