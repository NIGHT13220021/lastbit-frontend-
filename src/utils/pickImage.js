// src/utils/pickImage.js
// Asks "camera or gallery?" and resolves with the photo's uri (or null if cancelled).
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

async function launch(kind) {
  try {
    if (kind === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Camera permission needed", "Allow camera access in your phone settings to take a photo.");
        return null;
      }
      const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6 });
      return res.canceled ? null : res.assets[0].uri;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    return res.canceled ? null : res.assets[0].uri;
  } catch (e) {
    Alert.alert("Couldn't open photos", "Please try again.");
    return null;
  }
}

export function pickDishPhoto() {
  return new Promise((resolve) => {
    Alert.alert(
      "Dish photo",
      "Add it once. It is reused every time you post this dish.",
      [
        { text: "Take photo", onPress: async () => resolve(await launch("camera")) },
        { text: "Choose from gallery", onPress: async () => resolve(await launch("gallery")) },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
}