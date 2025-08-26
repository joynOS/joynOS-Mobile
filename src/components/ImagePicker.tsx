import React from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
}

interface ImagePickerProps {
  onImageSelected: (image: ImagePickerResult | null) => void;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
}

export const useImagePicker = () => {
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
        return false;
      }
    }
    return true;
  };

  const pickImage = async (options: ImagePickerProps): Promise<ImagePickerResult | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect ?? [1, 1],
      quality: options.quality ?? 0.8,
      allowsMultipleSelection: options.allowsMultipleSelection ?? false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      };
    }

    return null;
  };

  const takePhoto = async (options: ImagePickerProps): Promise<ImagePickerResult | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect ?? [1, 1],
      quality: options.quality ?? 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      };
    }

    return null;
  };

  const showImagePickerOptions = (options: ImagePickerProps) => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => takePhoto(options).then(options.onImageSelected) },
        { text: 'Gallery', onPress: () => pickImage(options).then(options.onImageSelected) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return {
    pickImage,
    takePhoto,
    showImagePickerOptions,
  };
};