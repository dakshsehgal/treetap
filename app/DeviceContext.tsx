import React, { createContext, useState, useEffect } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import BLEAdvertiser from "react-native-ble-advertiser";

export const DeviceContext = createContext<{
  deviceMessages: { [key: string]: string[] };
  startScan: () => void;
  stopScan: () => void;
  username: string;
}>({
  deviceMessages: {},
  startScan: () => {},
  stopScan: () => {},
  username: "",
});

const DeviceProvider = ({ children }) => {
  //   const [messages, setMessages] = React.useState<string[]>([]);
  const [deviceMessages, setDeviceMessages] = useState<{
    [key: string]: string[];
  }>({});
  const [bleManager] = useState(new BleManager());

  React.useEffect(() => {
    // startScan();
    startScan();

    return () => console.log("page exit"); // Cleanup scan when leaving the screen
  }, []);

  React.useEffect(() => {
    console.log("device messages", deviceMessages);
  }, [deviceMessages]);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "BLE Advertiser Example App",
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

  // const requestAndroid31Permissions = async () => {
  //   const bluetoothScanPermission = await PermissionsAndroid.request(
  //     PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  //     {
  //       title: "Location Permission",
  //       message: "Bluetooth Low Energy requires Location",
  //       buttonPositive: "OK",
  //     }
  //   );
  //   const bluetoothConnectPermission = await PermissionsAndroid.request(
  //     PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  //     {
  //       title: "Location Permission",
  //       message: "Bluetooth Low Energy requires Location",
  //       buttonPositive: "OK",
  //     }
  //   );
  //   const fineLocationPermission = await PermissionsAndroid.request(
  //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //     {
  //       title: "Location Permission",
  //       message: "Bluetooth Low Energy requires Location",
  //       buttonPositive: "OK",
  //     }
  //   );

  //   return (
  //     bluetoothScanPermission === "granted" &&
  //     bluetoothConnectPermission === "granted" &&
  //     fineLocationPermission === "granted"
  //   );
  // };

  // const requestPermissions = async () => {
  //   if (Platform.OS === "android") {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //       {
  //         title: "Location Permission",
  //         message: "Bluetooth Low Energy requires Location",
  //         buttonPositive: "OK",
  //       }
  //     );
  //     return granted === PermissionsAndroid.RESULTS.GRANTED;
  //   } else {
  //     return true;
  //   }
  // };

  const requestBluetoothPermission = async () => {
    if (Platform.OS === "ios") {
      return true;
    }
    if (
      Platform.OS === "android" &&
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ) {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        console.log(
          "api level is less than 31 and granted access fine location"
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      if (
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      ) {
        console.log("granted bl perms");
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        console.log(
          "this should be true",
          result["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
            result["android.permission.BLUETOOTH_SCAN"] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            result["android.permission.ACCESS_FINE_LOCATION"] ===
              PermissionsAndroid.RESULTS.GRANTED
        );
        return (
          result["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }

    console.log("Permission have not been granted");

    return false;
  };

  const username = "dsehgal";
  const isAlphanumeric = (char) =>
    (char >= "a" && char <= "z") ||
    char == " " ||
    char == "$" ||
    char == "/" ||
    char == "," ||
    char == "." ||
    (char >= "A" && char <= "Z") ||
    (char >= "0" && char <= "9");

  const startScan = async () => {
    // if (Platform.OS === "android" && Platform.Version >= 23) {
    //   const granted = await PermissionsAndroid.requestMultiple([
    //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //     PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    //   ]);

    //   // Check if permissions are granted
    //   if (
    //     granted["android.permission.ACCESS_FINE_LOCATION"] !==
    //       PermissionsAndroid.RESULTS.GRANTED ||
    //     granted["android.permission.BLUETOOTH_SCAN"] !==
    //       PermissionsAndroid.RESULTS.GRANTED
    //   ) {
    //     console.log("Bluetooth scanning permissions denied");
    //     return;
    //   }
    // }
    setDeviceMessages({}); // Clear the list of devices
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error("Scan error:", error);
        return;
      }
      //   console.log("scanning");
      // if (scannedDevice?.name) {
      //   console.log(scannedDevice.name);
      // }
      if (
        scannedDevice?.name?.includes("TreeTap") &&
        scannedDevice.manufacturerData
      ) {
        const manuf_data = scannedDevice.manufacturerData;
        const translated_string = Buffer.from(manuf_data, "base64").toString(
          "ascii"
        );
        const company_data = translated_string.slice(0, 2);
        const unique_device_string = translated_string.slice(3, 4);
        const actual_message = Array.from(translated_string.slice(4).trimEnd())
          .filter(isAlphanumeric)
          .join("");

        // console.log("translated string is", translated_string);
        // console.log("company data", company_data);
        // console.log("unique string", unique_device_string);
        // console.log("actual message", actual_message);

        setDeviceMessages((prevMessages) => {
          const existingMessages = prevMessages[unique_device_string] || [];
          const not_duplicate = !existingMessages.find((str) =>
            str.includes(actual_message)
          );

          if (not_duplicate) {
            if (existingMessages.length == 0) {
              return {
                ...prevMessages,
                [unique_device_string]: [...existingMessages, actual_message],
              };
            }
            const last_string = existingMessages[existingMessages.length - 1];
            if (last_string[last_string.length - 1] === "$") {
              return {
                ...prevMessages,
                [unique_device_string]: [...existingMessages, actual_message],
              };
            } else {
              // merge
              const newArr = [...existingMessages];
              newArr[newArr.length - 1] += actual_message;
              return {
                ...prevMessages,
                [unique_device_string]: newArr,
              };
            }
          } else {
            return prevMessages;
          }
        });
      }
    });
  };

  const stopScan = () => {
    console.log("Stopping BLE scan...");
    bleManager.stopDeviceScan();
  };

  return (
    <DeviceContext.Provider
      value={{ deviceMessages, startScan, stopScan, username }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export default DeviceProvider;
