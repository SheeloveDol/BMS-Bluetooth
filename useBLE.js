import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

function useBLE() {
  const bleManager = useMemo(() => new BleManager());

  const [allDevices, setAllDevices] = useState([]);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requiers Location Permission",
        buttonPositive: "OK",
      }
    );

    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Scan Permission",
        message: "App requires bluetooth scanning permission",
        buttonPositive: "OK",
      }
    );

    const bluetoothFineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Fine Location",
        message: "App requires fine location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      bluetoothFineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "App requires location permission",
            buttonPositive: "OK",
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionGranted = await requestAndroid31Permissions();
        return isAndroid31PermissionGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicateDevice = (devices, nextDevice) => {
    const isDuplicate = devices.some(device => device.id === nextDevice.id);
    console.log(`Checking for duplicates. Device ID: ${nextDevice.id}, Is Duplicate: ${isDuplicate}`);
    return isDuplicate;
  };

  const scanForPeripherals = () => 
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error)
      }
      if (device) {
        setAllDevices((prevState) => {
          console.log(`Current state: `, prevState.map(d => d.id)); //debugging
          if (!isDuplicateDevice(prevState, device)) {
            console.log(`Adding device: ${device.id}`); //debugging
            return [...prevState, device] 
          } else {
            console.log(`Duplicate found, not adding: ${device.id}`); //debugging
          }
          return prevState;
        })
      }
    })
  
    setTimeout(() => {
      bleManager.stopDeviceScan();
      console.log("Stopped scanning for BLE devices.");
    }, 10000); // Adjust time as needed


  return {
    scanForPeripherals,
    requestPermissions,
    allDevices,
  };
 //TODO: Need to figure out how to stop the scan and stop the duplicate devices from being added to the array
  
}

export default useBLE;

// bleManager.startDeviceScan(null, null, (error, device) => {
//   if (error) {
//     console.log(error);
//   }
//   if (device) {
//     console.log("Device found", device) //debugging
//     setAllDevices((prevState) => {
//       if (!isDuplicateDevice(prevState, device)) {
//         return [...prevState, device];
//       }
//       return prevState;
//     })
//   }
// })
