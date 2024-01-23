import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

import base64 from "react-native-base64";

import * as ExpoDevice from "expo-device";

function useBLE() {
  const bleManager = useMemo(() => new BleManager());

  const [allDevices, setAllDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);

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
    // console.log(`Checking for duplicates. Device ID: ${nextDevice.id}, Is Duplicate: ${isDuplicate}`);
    return isDuplicate;
  };

  const scanForPeripherals = () => 
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('THIS IS AN ERROR', error)
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
  
    const connectToDevice = async (device) => {
      try {
        const deviceConnection = await bleManager.connectToDevice(device.id);
        setConnectedDevice(deviceConnection);
        console.log("I've connected to the device:", deviceConnection), //debugging
        console.log("Getting ready to stop all scanning"); //debugging
        bleManager.stopDeviceScan();
        console.log("STOPPED SCANNING FOR DEVICES"); //debugging
        await deviceConnection.discoverAllServicesAndCharacteristics(); // This is where we would discover the services and characteristics of the device but we get an error
      } catch (error) {
        console.log("<<<<< ERROR CONNECTING TO DEVICE >>>>:", error);
      }
    };




    // Delayed characterisitc discovery
    // const connectToDevice = async (device) => {
    //   try {
    //     await bleManager.connectToDevice(device.id);
    //     console.log("Connection initiated");
    
    //     // Adding a delay
    //     setTimeout(async () => {
    //       // Confirm the connection
    //       const isConnected = await bleManager.isDeviceConnected(device.id);
    //       if (isConnected) {
    //         console.log("Device is connected, now proceeding");
    //         bleManager.stopDeviceScan();
    //         console.log("STOPPED SCANNING FOR DEVICES")
    //         // Proceed with further operations here

    //         console.log("Getting ready to discover all services and characteristics"); //debugging  
    //         await device.discoverAllServicesAndCharacteristics();
    //         // Other operations...
    //       } else {
    //         console.log("Device not connected after delay");
    //       }
    //     }, 30000); // Delay of 5000 milliseconds (5 seconds)
    
    //   } catch (error) {
    //     console.log("Error connecting to device:", error);
    //   }
    // };
    



    // const connectToDevice = async (device) => {
    //   try {
    //     await bleManager.connectToDevice(device.id);
    //     setConnectedDevice(device);
    //     console.log("Connected to device:", device.id);

    //     // stop scanning for devices
    //     bleManager.stopDeviceScan();
    //     console.log("STOPPED SCANNING FOR DEVICES")


    
    //     // Write a command to the device
    //     await writeCommandToDevice(device.id);
    
    //     // Subscribe to notifications from the device
    //     await subscribeToCharacteristic(device.id);
    
    //   } catch (error) {
    //     console.log("Error connecting to device:", error);
    //   }
    // };
    

    // const writeCommandToDevice = async (deviceId) => {
    //   try {
    //     const serviceUUID = "0000ff00-0000-1000-8000-00805f9b34fb";
    //     const characteristicUUID = '0000ff02-0000-1000-8000-00805f9b34fb';
    //     const command = 'DDA50300FFFD77'; // The hex command for requesting info
    //     const base64Command = base64.encode(command);
    
    //     await bleManager.writeCharacteristicWithoutResponseForDevice(
    //       deviceId, 
    //       serviceUUID, 
    //       characteristicUUID, 
    //       base64Command
    //     );
    
    //     console.log("Command written to characteristic FF02");
    //   } catch (error) {
    //     console.log("Error writing command to characteristic:", error);
    //   }
    // };

    // const subscribeToCharacteristic = async (deviceId) => {
    //   try {
    //     const serviceUUID = "0000ff00-0000-1000-8000-00805f9b34fb";
    //     const characteristicUUID = '0000ff01-0000-1000-8000-00805f9b34fb';
    
    //     await bleManager.monitorCharacteristicForDevice(
    //       deviceId, 
    //       serviceUUID, 
    //       characteristicUUID, 
    //       (error, characteristic) => {
    //         if (error) {
    //           console.log("Notification error AT THIS LINE!!!!:", error.message);
    //           return;
    //         }
    //         const receivedData = base64.decode(characteristic.value);
    //         console.log("Received data:", receivedData);
    //       }
    //     );
    
    //     console.log("Subscribed to characteristic FF01");
    //   } catch (error) {
    //     console.log("Error subscribing to characteristic:", error.message);
        
    //   }
    // };
    
    




  return {
    scanForPeripherals,
    requestPermissions,
    allDevices,
    connectToDevice,
    connectedDevice,
  };
 
  
}

export default useBLE;


