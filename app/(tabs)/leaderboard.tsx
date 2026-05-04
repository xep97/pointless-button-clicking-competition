import { useFocusEffect } from "expo-router"; // or '@react-navigation/native'
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

interface Entry {
  username: string;
  high_score: number;
}

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaders = async () => {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("username, high_score")
      .order("high_score", { ascending: false })
      .limit(20);

    if (data) {
      setLeaders(data);
    }
    if (error) {
      console.error("Leaderboard fetch error:", error.message);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // This hook runs every single time the user navigates TO this tab
  useFocusEffect(
    useCallback(() => {
      fetchLeaders();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaders();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Global Rankings</Text>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#e74c3c"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.username}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e74c3c"
            />
          }
          renderItem={({ item, index }) => (
            <View style={[styles.row, index === 0 && styles.firstPlace]}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {item.username}
              </Text>
              <Text style={styles.score}>
                {item.high_score.toLocaleString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingHorizontal: 15 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  listContent: { paddingBottom: 40 },
  row: {
    flexDirection: "row",
    backgroundColor: "#111",
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  firstPlace: {
    borderColor: "#f1c40f",
    backgroundColor: "#1a1600",
    borderWidth: 2,
  },
  rankBadge: { width: 45 },
  rankText: { color: "#888", fontWeight: "bold", fontSize: 16 },
  name: { flex: 1, fontSize: 18, color: "#fff", fontWeight: "500" },
  score: { fontSize: 20, fontWeight: "900", color: "#e74c3c" },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
  },
});
