import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics"; // Import Haptics
import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function GameScreen() {
  const [clicks, setClicks] = useState(0);
  const [username, setUsername] = useState("");
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const checkUser = async () => {
      const savedName = await AsyncStorage.getItem("username");
      if (!savedName) setModalVisible(true);
      else setUsername(savedName);
    };
    checkUser();
  }, []);

  // Update Rank logic: Count how many people have a higher score than current clicks
  useEffect(() => {
    const updateLiveRank = async () => {
      if (clicks === 0) return;

      const { count, error } = await supabase
        .from("leaderboard")
        .select("*", { count: "exact", head: true })
        .gt("high_score", clicks);

      if (!error && count !== null) {
        setCurrentRank(count + 1); // +1 because if 0 people are higher, you are #1
      }
    };

    // Debounce rank updates slightly so we don't spam Supabase on every single click
    const timer = setTimeout(updateLiveRank, 500);
    return () => clearTimeout(timer);
  }, [clicks]);

  const handlePress = () => {
    setClicks((c) => c + 1);
    // Trigger Haptic Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [clicks, username]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
      if (username && clicks > 0) {
        await handleScoreSubmission(username, clicks);
        setClicks(0);
        setCurrentRank(null);
      }
    }
    appState.current = nextAppState;
  };

  const handleScoreSubmission = async (name: string, sessionScore: number) => {
    const { data } = await supabase
      .from("leaderboard")
      .select("high_score")
      .eq("username", name)
      .maybeSingle();
    const previousBest = data?.high_score || 0;

    if (sessionScore > previousBest) {
      await supabase
        .from("leaderboard")
        .upsert(
          { username: name, high_score: sessionScore },
          { onConflict: "username" },
        );
    }
  };

  const handleSaveUsername = async () => {
    if (tempName.trim()) {
      await AsyncStorage.setItem("username", tempName.trim());
      setUsername(tempName.trim());
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userLabel}>PLAYER: {username}</Text>
        {currentRank && (
          <Text style={styles.rankText}>Current Rank: #{currentRank}</Text>
        )}
      </View>

      <View style={styles.clickArea}>
        <Text style={styles.counter}>{clicks}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.clickerButton}
          onPress={handlePress}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.buttonText}>TAP</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose Username</Text>
            <TextInput
              style={styles.input}
              onChangeText={setTempName}
              placeholder="Name"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveUsername}
            >
              <Text style={styles.saveBtnText}>START</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center" },
  header: { marginTop: 60, alignItems: "center" },
  userLabel: { color: "#888", fontSize: 14, fontWeight: "bold" },
  rankText: {
    color: "#f1c40f",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  clickArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  counter: {
    fontSize: 120,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 20,
  },
  clickerButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#444",
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    elevation: 20,
  },
  buttonText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    padding: 40,
  },
  modalBox: {
    backgroundColor: "#111",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: { color: "#fff", fontSize: 22, marginBottom: 20 },
  input: {
    width: "100%",
    backgroundColor: "#222",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  saveBtn: {
    backgroundColor: "#e74c3c",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
});
