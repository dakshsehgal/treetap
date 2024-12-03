import {
  Image,
  StyleSheet,
  Platform,
  Alert,
  PermissionsAndroid,
} from "react-native";
import * as React from "react";
import { Button, Checkbox, TextInput } from "react-native-paper";
import { Buffer } from "buffer";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Location from "expo-location";
// import useBLE from "@/hooks/useBLE";
import BLEAdvertiser from "react-native-ble-advertiser";
import { DeviceContext } from "../DeviceContext";
// import useBLE from "@/hooks/useBLE";

export default function HomeScreen() {
  const [location, setLocation] = React.useState("33.769513,-84.3857433");
  const [includeLocation, setIncludeLocation] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [recipient, setRecipient] = React.useState("");

  const { deviceMessages, startScan, stopScan, username } =
    React.useContext(DeviceContext);

  React.useEffect(() => {
    console.log("location became", location);
  }, [location]);

  React.useEffect(() => {
    const fetchLocation = async () => {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(
        String(loc.coords.latitude) + "," + String(loc.coords.longitude)
      );
    };

    if (includeLocation) {
      fetchLocation();
    }
  }, [includeLocation]);
  // const scanForDevices = async () => {
  //   const isPermissionsEnabled = await requestPermissions();
  //   if (isPermissionsEnabled) {
  //     scanForPeripherals();
  //   }
  // };

  //
  // React.useEffect(() => {
  //   if (devices.length > 0) {
  //     // console.log("Devices found:", devices);

  //     // const filteredArray = devices.filter((item) =>
  //     //   item.name?.includes("TreeTap")
  //     // );
  //     // if (filteredArray.length > 0) {

  //     const data = devices.map((d) => {
  //       if (d.manufacturerData) {
  //         return Buffer.from(d.manufacturerData, "base64").toString("ascii");
  //       } else {
  //         return "none";
  //       }
  //     });
  //     console.log("found", devices);
  //     console.log("found data", data);
  //     // }
  //   }
  // }, [devices]);

  const getLocation = async () => {
    try {
      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(
        String(userLocation.coords.latitude) +
          "," +
          String(userLocation.coords.longitude)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const requestPermissions = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "BLE Avertiser Example App",
            message: "Example App access to your location ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("[Permissions]", "Location Permission granted");
        } else {
          console.log("[Permissions]", "Location Permission denied");
        }

        const adv = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          {
            title: "BLE Avertiser Example App",
            message: "Example App access to your location ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (adv === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("[Permissions]", "Advertising Permission granted");
        } else {
          console.log("[Permissions]", "Advertising Permission denied");
        }
      }

      const blueoothActive = await BLEAdvertiser.getAdapterState()
        .then((result) => {
          console.log("[Bluetooth]", "Bluetooth Status", result);
          return result === "STATE_ON";
        })
        .catch((error) => {
          console.log("[Bluetooth]", "Bluetooth Not Enabled");
          return false;
        });

      if (!blueoothActive) {
        await Alert.alert(
          "Example requires bluetooth to be enabled",
          "Would you like to enable Bluetooth?",
          [
            {
              text: "Yes",
              onPress: () => BLEAdvertiser.enableAdapter(),
            },
            {
              text: "No",
              onPress: () => console.log("Do Not Enable Bluetooth Pressed"),
              style: "cancel",
            },
          ]
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const convertMsgToPayload = (message: string) => {
    return Array.from(message).map((char) => char.charCodeAt(0));
  };

  const convertb64ToAscii = () => {
    console.log(
      "iububi",
      Buffer.from(
        "AgEGCAlUcmVlVGFwDP/M+gBoZXkgbXkgYQgJVHJlZVRhcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "base64"
      ).toString("ascii")
    );
  };

  function splitIntoChunks<T>(
    array: T[],
    sender_id: T,
    chunkSize: number = 8
  ): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < array.length; i += chunkSize - 1) {
      const append_arr = [sender_id, ...array.slice(i, i + chunkSize - 1)];
      // append_arr = append_arr.concat(array.slice(i, i + chunkSize - 1));
      result.push(append_arr);
    }
    return result;
  }

  const openDialog = async () => {
    await new Promise((f) => setTimeout(f, 2000));
    Alert.alert(
      "",
      "Your message has been sent",
      [
        {
          text: "ok",
          // onPress: () => Alert.alert("Cancel Pressed"),
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      }
    );
  };
  const advertiseBle = async () => {
    await requestPermissions();
    await getLocation();

    const UUID = "A47595A8-8121-43D7-8761-A13E67E9BBC0";

    BLEAdvertiser.setCompanyId(0xfacc);
    console.log("is location enabled", includeLocation);
    const msg = includeLocation
      ? location + "/" + username + "/" + recipient + "/" + message + "$"
      : "0,0" + "/" + username + "/" + recipient + "/" + message + "$";

    console.log("message is", msg);
    const hexMessage = convertMsgToPayload(msg);
    console.log("hex message is", hexMessage);
    const splitMessage = splitIntoChunks(hexMessage, 69);
    console.log("split message is", splitMessage);
    let hasDialogBeenShown = false;
    for (let i = 0; i < splitMessage.length; i++) {
      const payload = [i, ...splitMessage[i]];
      console.log(payload);
      BLEAdvertiser.broadcast(UUID, payload, {
        includeDeviceName: false,
        connectable: false,
        // txPowerLevel: BLEAdvertiser.ADVERTISE_TX_POWER_MEDIUM
      }) // The service UUID and additional manufacturer data.
        .then(() => {
          if (!hasDialogBeenShown) {
            openDialog();
            hasDialogBeenShown = !hasDialogBeenShown;
          }
        })
        .catch((error) => console.log("Broadcasting Error", error));
      await new Promise((f) => setTimeout(f, 7000));
      BLEAdvertiser.stopBroadcast()
        .then((err) => console.log("stopped", err))
        .catch((error) => console.log("Stop Broadcast Error", error));
    }
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <ThemedView style={styles.headerView}>
            <Image
              source={require("@/assets/images/forest.jpg")}
              style={styles.reactLogo}
            />

            <ThemedText style={styles.headerText} type="title">
              TreeTap
            </ThemedText>
            {/* <ThemedText style={styles.headerSubtitle} type="subtitle">
              Send SOS, receive help
            </ThemedText> */}
          </ThemedView>
        }
        headerHeight={480}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">your username is: {username}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Checkbox
            status={includeLocation ? "checked" : "unchecked"}
            color="green"
            onPress={() => {
              setIncludeLocation(!includeLocation);
            }}
          />
          <ThemedText style={styles.checkboxText}>
            Attach current location
          </ThemedText>
        </ThemedView>
        <ThemedView>
          {/* <ThemedText>Who would you like to send message to?</ThemedText> */}
          <TextInput
            placeholder="Your recipient"
            value={recipient}
            multiline
            onChangeText={(text) => setRecipient(text)}
          />
          <TextInput
            placeholder="Your message"
            value={message}
            multiline
            onChangeText={(text) => setMessage(text)}
            style={styles.messageInput}
          />
          <Button
            mode="contained"
            onPress={advertiseBle}
            buttonColor="green"
            style={styles.sendButton}
          >
            Send Message
          </Button>
          {/* <Button
            mode="contained"
            onPress={scanForDevices}
            buttonColor="green"
            style={styles.sendButton}
          >
            scan BLE devices
          </Button> */}
          {/* <Button
            mode="contained"
            onPress={convertb64ToAscii}
            buttonColor="green"
            style={styles.sendButton}
          >
            Translate
          </Button> */}
        </ThemedView>
      </ParallaxScrollView>
      {/* 
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>SOS Sent</Dialog.Title>
          <Dialog.Content>
            <ThemedText>
              Your SOS message has been successfully sent.
            </ThemedText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal> */}
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    // flexDirection: 'row',
    alignItems: "center",
    textAlign: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    display: "flex",
    flexDirection: "row",
  },
  reactLogo: {
    // height: 180,
    // width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  headerText: {
    textAlign: "center",
    marginTop: 270,
    color: "white",
  },
  headerView: {
    height: 630,
  },
  headerSubtitle: {
    textAlign: "center",
    // marginTop: 120,
    color: "white",
    fontSize: 13,
  },
  checkboxText: {
    // marginLeft: 15,
    textAlign: "center",
    alignSelf: "center",
  },
  sendButton: {
    marginTop: 20,
  },
  messageInput: {
    marginTop: 20,
  },
});
