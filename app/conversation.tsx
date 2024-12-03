import {
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { TextInput } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { DeviceContext } from "./DeviceContext";

export default function ConversationScreen() {
  // const messages = [
  //   { id: "1", text: "Hey there!", sender: "them" },
  //   { id: "2", text: "Hi! How's it going?", sender: "me" },
  //   { id: "3", text: "Pretty good, thanks for asking!", sender: "them" },
  //   { id: "4", text: "Glad to hear that.", sender: "me" },
  // ];

  const { deviceMessages, startScan, stopScan, username } =
    useContext(DeviceContext);

  const { sendingDevice } = useLocalSearchParams();

  console.log("sending devices is", sendingDevice);
  const isAlphanumeric = (char) =>
    (char >= "a" && char <= "z") ||
    char == " " ||
    char == "," ||
    char == "." ||
    char == "/" ||
    (char >= "A" && char <= "Z") ||
    (char >= "0" && char <= "9");

  const [keyboardHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        Animated.timing(keyboardHeight, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardHeight]);
  const messages = [
    // {
    //   id: "1",
    //   text:
    //     deviceMessages[sendingDevice as string].join("").split("/")[0] +
    //     "\n" +
    //     [...deviceMessages[sendingDevice as string].join("").split("/")[2]]
    //       .filter(isAlphanumeric)
    //       .join(""),
    //   sender: "them",
    // },
  ];

  for (let i = 0; i < deviceMessages[sendingDevice as string].length; i++) {
    const curr_message = Array.from(deviceMessages[sendingDevice as string][i])
      .filter(isAlphanumeric)
      .join("");
    const splitmsg = curr_message.split("/");
    if (splitmsg.length === 4) {
      messages.push({
        id: i.toString(),
        text: splitmsg[0] + "\n" + splitmsg[3],
        sender: splitmsg[1] === username ? "me" : "them",
      });
    }
  }

  // const messages = [
  //   {
  //     id: "1",
  //     text: "Hey, we have reached the waterfall!",
  //     sender: "them",
  //   },
  // ];
  console.log(deviceMessages[sendingDevice as string]);

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "me";
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <ThemedText style={styles.messageText}>{item.text}</ThemedText>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View
          style={[styles.container, { paddingBottom: keyboardHeight }]}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chat}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.sendButton}>
              <ThemedText style={styles.sendButtonText}>Send</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chat: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "75%",
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d1f7c4",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e1e1e1",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
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
});
