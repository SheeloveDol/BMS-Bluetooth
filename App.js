import { useState } from "react";

import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"; 

import DeviceModal from "./DeviceConnectionModal"
import useBLE from "./useBLE";

export default App = () => {
  const { requestPermissions, scanForPeripherals, allDevices } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };


  const hideModal = () => {
    setIsModalVisible(false);
  }


  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  }

  console.log(allDevices)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        <Text style={styles.heartRateTitleText}>
          Please press the button below to scan for devices
        </Text>
      </View>
      <TouchableOpacity
        onPress={openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText} >
          Connect
        </Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={() => {}}
        devices={allDevices}
      />
    </SafeAreaView>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});