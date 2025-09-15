import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { appService, VersionCheckResponse } from "../services/app";
import { Platform } from "react-native";
// Import version directly from app.json
import packageInfo from "../../app.json";

interface VersionCheckerProps {
  children: React.ReactNode;
}

export default function VersionChecker({ children }: VersionCheckerProps) {
  const [versionInfo, setVersionInfo] = useState<VersionCheckResponse | null>(
    null
  );
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    checkAppVersion();
  }, []);

  const checkAppVersion = async () => {
    try {
      const currentVersion = packageInfo.expo.version || "1.0.0";
      
      const platform = Platform.OS === "ios" ? "ios" : "android";

      const response = await appService.checkVersion(currentVersion, platform);

      setVersionInfo(response);

      if (response.forceUpdate) {
        setShowUpdateModal(true);
      } else if (response.updateRequired) {
        setShowUpdateModal(true);
      }
    } catch (error) {
      console.log("Version check failed (non-critical):", error);
    }
  };

  const handleUpdate = () => {
    if (versionInfo?.downloadUrl) {
      Linking.openURL(versionInfo.downloadUrl);
    }
  };

  const handleDismiss = () => {
    if (versionInfo?.forceUpdate) {
      return;
    }
    setShowUpdateModal(false);
  };

  return (
    <>
      {children}

      <Modal
        visible={showUpdateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>
              {versionInfo?.forceUpdate
                ? "Update Required"
                : "Update Available"}
            </Text>

            <Text style={styles.message}>
              {versionInfo?.updateMessage || "A new version is available!"}
            </Text>

            {versionInfo && (
              <Text style={styles.versionInfo}>
                Current: {versionInfo.currentVersion} → Latest:{" "}
                {versionInfo.latestVersion}
              </Text>
            )}

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.updateButtonText}>Update Now</Text>
              </TouchableOpacity>

              {!versionInfo?.forceUpdate && (
                <TouchableOpacity
                  style={[styles.button, styles.laterButton]}
                  onPress={handleDismiss}
                >
                  <Text style={styles.laterButtonText}>Later</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  versionInfo: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "column",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#cb5b23",
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  laterButton: {
    backgroundColor: "#f5f5f5",
  },
  laterButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
});
