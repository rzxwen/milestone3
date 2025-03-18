import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// FIX THIS CODE!!!!!!! // FIX THIS CODE!!!!!!! // FIX THIS CODE!!!!!!! 
// FIX THIS CODE!!!!!!! // FIX THIS CODE!!!!!!! 

const API_URL = "https://hsr-api.vercel.app/api/v1/characters"; // API from: https://hsr-api.vercel.app/api/v1/characters
const STORAGE_KEY = "@saved_team"; // Key for AsyncStorage

const TeamBuilder = () => {
  const [characters, setCharacters] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch characters from API
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setCharacters(data);
      } catch (error) {
        console.error("Error fetching characters:", error);
        Alert.alert("Error", "Failed to load characters.");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
    loadTeam(); // Load saved team on app start
  }, []);

  // Load team from AsyncStorage
  const loadTeam = async () => {
    try {
      const savedTeam = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTeam) {
        setTeam(JSON.parse(savedTeam));
      }
    } catch (error) {
      console.error("Error loading team:", error);
    }
  };

  // Save team to AsyncStorage when user presses "Save Team" button
  const saveTeam = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(team));
      Alert.alert("Success", "Your team has been saved!");
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  // Add a character to the team
  const addToTeam = (character) => {
    if (team.length < 4) {
      setTeam([...team, character]);
    } else {
      Alert.alert("Team Full", "Your team can have only 4 members.");
    }
  };

  // Remove a character from the team
  const removeFromTeam = (id) => {
    setTeam(team.filter((member) => member.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Honkai: Star Rail Team Builder</Text>

      {loading ? <ActivityIndicator size="large" color="#007AFF" /> : null}

      {/* Character Selection */}
      <Text style={styles.subtitle}>Select Characters</Text>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.characterCard} onPress={() => addToTeam(item)}>
            <Image source={{ uri: item.image }} style={styles.characterImage} />
            <Text style={styles.characterName}>{item.name}</Text>
            <Text style={styles.characterRole}>{item.role}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Team Display */}
      <Text style={styles.subtitle}>Your Team</Text>
      <FlatList
        data={team}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.teamMember}>
            <Image source={{ uri: item.image }} style={styles.characterImage} />
            <View style={styles.teamMemberInfo}>
              <Text style={styles.characterName}>{item.name}</Text>
              <Text style={styles.characterRole}>{item.role}</Text>
              <TouchableOpacity onPress={() => removeFromTeam(item.id)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Save Team Button */}
      {team.length > 0 && (
        <TouchableOpacity style={styles.saveButton} onPress={saveTeam}>
          <Text style={styles.saveButtonText}>Save Team</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  characterCard: { backgroundColor: "#fff", padding: 10, marginRight: 10, alignItems: "center", borderRadius: 8, elevation: 2 },
  characterImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 5 },
  characterName: { fontSize: 16, fontWeight: "bold" },
  characterRole: { fontSize: 14, color: "gray" },
  teamMember: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 8, elevation: 2 },
  teamMemberInfo: { flex: 1, marginLeft: 10 },
  removeButton: { backgroundColor: "#ff4d4d", padding: 5, borderRadius: 5, marginTop: 5 },
  removeButtonText: { color: "white", fontWeight: "bold" },
  saveButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default TeamBuilder;

