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
    devices.findIndex((device) => nextDevice.id === device.id) > -1;
  }

  const scanForPeripherals = () => 
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error)
      }
      if (device) {
        setAllDevices((prevState) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device] 
          }
          return prevState;
        })
      }
    })
  

  return {
    scanForPeripherals,
    requestPermissions,
    allDevices,
  };

  
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