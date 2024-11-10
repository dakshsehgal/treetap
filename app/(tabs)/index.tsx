import { Image, StyleSheet, Platform } from "react-native";
import * as React from "react";
import { Button, Checkbox, TextInput } from "react-native-paper";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import DeviceModal from "@/components/DeviceConnectionModal";
import useBLE from "@/hooks/useBle";

export default function HomeScreen() {
  const [includeLocation, setIncludeLocation] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [locationEnabled, setLocationEnabled] = React.useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = React.useState(false);

  const {
    allDevices,
    connectedDevice,
    connectToDevice,
    color,
    requestPermissions,
    scanForPeripherals,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  // const handleLocationPermission = async () => {
  //   let isPermitted = false;
  //   const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  //   isPermitted = result === RESULTS.GRANTED;
  //   // }

  //   if (isPermitted) {
  //     //Location permitted successfully, display next permission
  //   }
  // };

  // const handleBluetoothPermission = async () => {
  //   const isPermissionAllowed = await request(
  //     PERMISSIONS.ANDROID.BLUETOOTH_SCAN
  //   );
  //   if (isPermissionAllowed === RESULTS.GRANTED) {
  //     setBluetoothEnabled(true);
  //   }
  // };

  return (
    <>
      {!locationEnabled && !bluetoothEnabled ? (
        <>
          <Button
            mode="contained"
            onPress={() => console.log("pressed")}
            buttonColor="green"
            style={styles.sendButton}
          >
            Request location
          </Button>
          <Button
            mode="contained"
            onPress={openModal}
            buttonColor="green"
            style={styles.sendButton}
          >
            Request bluetooth
          </Button>
          <DeviceModal
            closeModal={hideModal}
            visible={isModalVisible}
            connectToPeripheral={connectToDevice}
            devices={allDevices}
          />
        </>
      ) : (
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
              <ThemedText style={styles.headerSubtitle} type="subtitle">
                Send SOS, receive help
              </ThemedText>
            </ThemedView>
          }
        >
          {/* <Image
        source={require("@/assets/images/forest.jpg")}
        style={styles.reactLogo}
      /> */}
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">You are connected</ThemedText>
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
            <TextInput
              placeholder="Your message"
              value={message}
              onChangeText={(text) => setMessage(text)}
              multiline
            />
            <Button
              mode="contained"
              onPress={() => console.log("Pressed")}
              buttonColor="green"
              style={styles.sendButton}
            >
              Send
            </Button>
          </ThemedView>
        </ParallaxScrollView>
      )}
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
    height: 550,
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
});
