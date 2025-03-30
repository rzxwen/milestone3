import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://hsr-api.vercel.app/api/v1/characters"; // API from: https://hsr-api.vercel.app/api/v1/characters
const STORAGE_KEY = "@hsr_saved_team"; //key for storing and retrieving team data in async 

// Recommended team compositions
const RECOMMENDED_TEAMS = [
  {
    id: 1,
    name: "Freeze Core",
    description: "A team focused on Freeze reactions and crowd control",
    members: ["Gepard", "Tingyun", "Pela", "March 7th"]
  },
  {
    id: 2,
    name: "Fire Strike",
    description: "High damage fire-based team with strong buffing",
    members: ["Himeko", "Asta", "Bennett", "Silver Wolf"]
  },
  {
    id: 3,
    name: "Lightning Surge",
    description: "Fast-attacking team with high energy generation",
    members: ["Jing Yuan", "Kafka", "Bailu", "Tingyun"]
  },
  {
    id: 4,
    name: "Quantum Control",
    description: "Team with strong debuffing and Quantum damage",
    members: ["Seele", "Silver Wolf", "Bronya", "Luocha"]
  }
];

//main component 
const TeamBuilder = () => {
  //state variables 
  const [characters, setCharacters] = useState([]);
  const [team, setTeam] = useState([]); //initally empty array to store the team 
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [recommendedTeams, setRecommendedTeams] = useState([]);
  const [showRecommended, setShowRecommended] = useState(false);

  // array of element paths for characters Honkai: Star Rail
  const paths = ["All", "Destruction", "Hunt", "Erudition", "Harmony", "Nihility", "Preservation", "Abundance"];

  useEffect(() => { //hook for fetching and updating data
    const fetchCharacters = async () => { //async function to get character data 
      try { //try catch for error handling 
        const response = await fetch(API_URL); //fetch the api data 
        const data = await response.json(); // wait for response from fetching, parse to json

        // Sort characters alphabetically
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setCharacters(sortedData); //sort the data 

        // Process recommended teams after loading characters
        processRecommendedTeams(sortedData);
      } catch (error) {
        console.error("error fetching characters:", error); //catch the error and 
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters(); //call fetchCharacters function 
    loadTeam(); //call load team 
  }, []);

  // Process recommended teams by matching character names to actual character objects
  const processRecommendedTeams = (charactersList) => {
    const processed = RECOMMENDED_TEAMS.map(team => {
      const teamMembers = team.members.map(memberName => {
        // Find character by name (case insensitive partial match)
        return charactersList.find(char =>
          char.name.toLowerCase().includes(memberName.toLowerCase())
        );
      }).filter(member => member !== undefined);

      return {
        ...team,
        memberObjects: teamMembers
      };
    });

    setRecommendedTeams(processed);
  };

  const loadTeam = async () => {
    try {
      const savedTeam = await AsyncStorage.getItem(STORAGE_KEY); //get data from async
      if (savedTeam) { //if there is a saved team 
        setTeam(JSON.parse(savedTeam)); //update the state, turn the json into object 
      }
    } catch (error) {
      console.error("Error loading team:", error);
    }
  };

  //function for saving team 
  const saveTeam = async () => {
    try { //try catch to handle errors
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(team)); //convert array to json string
      Alert.alert("Success", "Team saved successfully");
    } catch (error) { //catch the errors 
      console.error("Error saving team:", error);
    }
  };

  //function to add characters into team 
  const addToTeam = (character) => {
    if (team.length < 4) { //teams can max be 4 characters
      // check if character is already in team
      if (team.some(member => member.id === character.id)) { //check if character has already been selected 
        Alert.alert("Character Already Selected", `${character.name} is already in your team`);
        return;
      }

      setTeam([...team, character]); //save the character to team by creating new array
    } else {
      Alert.alert("Team Full", "Team can only have 4 members");
    }
  };

  const removeFromTeam = (character) => { //function to remove character 
    setTeam(team.filter((member) => member.id !== character.id)); //create new array without character
  };

  // Apply recommended team to current team
  const applyRecommendedTeam = (recommendedTeam) => {
    if (team.length > 0) {
      Alert.alert(
        "Replace Current Team",
        "This will replace your current team. Continue?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Replace",
            onPress: () => {
              setTeam(recommendedTeam.memberObjects);
            }
          }
        ]
      );
    } else {
      setTeam(recommendedTeam.memberObjects);
    }
  };

  // Filter characters by path
  const filteredCharacters = filter === "All"
    ? characters
    : characters.filter(char => char.path === filter); //filters characters based on path 

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>HSR Team Builder</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading characters...</Text>
        </View>
      ) : (
        <>
          {/* Toggle between character selection and recommended teams */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !showRecommended && styles.toggleButtonActive]}
              onPress={() => setShowRecommended(false)}
            >
              <Text style={styles.toggleButtonText}>Character Selection</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, showRecommended && styles.toggleButtonActive]}
              onPress={() => setShowRecommended(true)}
            >
              <Text style={styles.toggleButtonText}>Recommended Teams</Text>
            </TouchableOpacity>
          </View>

          {!showRecommended ? (
            <>
              {/* Path filter section */}
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by Path:</Text>
                <FlatList
                  data={paths}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        filter === item && styles.filterButtonActive,
                      ]}
                      onPress={() => setFilter(item)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        filter === item && styles.filterButtonTextActive
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Character Selection */}
              <Text style={styles.sectionTitle}>Characters</Text>
              <FlatList //flatlist to display characters
                data={filteredCharacters}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.characterCard}
                    onPress={() => addToTeam(item)}
                  >
                    <View style={styles.characterContent}>
                      <Image source={{ uri: item.image }} style={styles.characterImage} />
                      <Text style={styles.characterName}>{item.name}</Text>
                      <View style={styles.characterDetails}>
                        <Text style={styles.characterDetail}>{item.element}</Text>
                        <Text style={styles.characterDetail}>{item.path}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            <>
              {/* Recommended Teams Section */}
              <Text style={styles.sectionTitle}>Recommended Teams</Text>
              <Text style={styles.recommendedDescription}>
                Select one of these pre-built teams optimized for different playstyles
              </Text>

              {recommendedTeams.map((recTeam) => (
                <View key={recTeam.id} style={styles.recommendedTeamCard}>
                  <View style={styles.recommendedTeamHeader}>
                    <Text style={styles.recommendedTeamName}>{recTeam.name}</Text>
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={() => applyRecommendedTeam(recTeam)}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.recommendedTeamDescription}>{recTeam.description}</Text>

                  <View style={styles.recommendedTeamMembers}>
                    {recTeam.memberObjects.map((character, index) => (
                      character && (
                        <View key={index} style={styles.recommendedTeamMember}>
                          <Image
                            source={{ uri: character.image }}
                            style={styles.recommendedMemberImage}
                          />
                          <Text style={styles.recommendedMemberName}>{character.name}</Text>
                        </View>
                      )
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Team Display section - always shown */}
          <Text style={styles.sectionTitle}>Your Team</Text>
          {team.length === 0 ? (
            <View style={styles.emptyTeamContainer}>
              <Text style={styles.emptyTeamText}>Your team is empty. Select characters to build your team.</Text>
            </View>
          ) : (
            <FlatList
              data={team}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.teamMember}>
                  <Image source={{ uri: item.image }} style={styles.teamMemberImage} />
                  <View style={styles.teamMemberInfo}>
                    <Text style={styles.teamMemberName}>{item.name}</Text>
                    <View style={styles.teamMemberDetails}>
                      <Text style={styles.teamMemberDetail}>{item.element}</Text>
                      <Text style={styles.teamMemberDetail}>{item.path}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromTeam(item)} //when click remove from team 
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* Save Team Button */}
          {team.length > 0 && (
            <TouchableOpacity style={styles.saveButton} onPress={saveTeam}>
              <Text style={styles.saveButtonText}>Save Team</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
};

// Updated dark style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#01DBC6", // Blue accent
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  toggleButtonActive: {
    backgroundColor: "rgba(1, 219, 198, 0.2)",
    borderWidth: 1,
    borderColor: '#01DBC6',
  },
  toggleButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterLabel: {
    color: "#ffffff",
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: "#1e1e1e",
  },
  filterButtonActive: {
    borderWidth: 1,
    borderColor: '#01DBC6',
    backgroundColor: "rgba(1, 219, 198, 0.2)",
  },
  filterButtonText: {
    color: "#ffffff",
  },
  filterButtonTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    marginTop: 20,
  },
  characterCard: {
    width: 120,
    height: 180,
    marginRight: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 6,
    overflow: "hidden",
  },
  characterContent: {
    padding: 10,
    alignItems: "center",
  },
  characterImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  characterName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 4,
  },
  characterDetails: {
    flexDirection: "column",
    alignItems: "center",
  },
  characterDetail: {
    fontSize: 12,
    color: "#01DBC6", // Blue accent
    marginBottom: 2,
  },
  recommendedDescription: {
    color: "#cccccc",
    marginBottom: 16,
    fontSize: 14,
  },
  recommendedTeamCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  recommendedTeamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendedTeamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  applyButton: {
    backgroundColor: "#01DBC6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  applyButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  recommendedTeamDescription: {
    color: "#cccccc",
    marginBottom: 16,
  },
  recommendedTeamMembers: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recommendedTeamMember: {
    alignItems: "center",
    width: "22%",
  },
  recommendedMemberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  recommendedMemberName: {
    color: "#ffffff",
    fontSize: 12,
    textAlign: "center",
  },
  emptyTeamContainer: {
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTeamText: {
    color: "#ffffff",
    textAlign: "center",
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  teamMemberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teamMemberInfo: {
    flex: 1,
    marginLeft: 10,
  },
  teamMemberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  teamMemberDetails: {
    flexDirection: "row",
    marginTop: 4,
  },
  teamMemberDetail: {
    fontSize: 12,
    color: "#01DBC6",
    marginRight: 10,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#02baa9", //darker colour
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TeamBuilder;