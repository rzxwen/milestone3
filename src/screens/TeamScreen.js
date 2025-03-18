import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://hsr-api.vercel.app/api/v1/characters"; // API from: https://hsr-api.vercel.app/api/v1/characters
const STORAGE_KEY = "@hsr_saved_team"; //key for storing and retrieving team data in async 

//main component 
const TeamBuilder = () => {
  //state variables 
  const [characters, setCharacters] = useState([]);
  const [team, setTeam] = useState([]); //initally empty array to store the team 
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // array of element paths for characters Honkai: Star Rail
  const paths = ["All", "Destruction", "Hunt", "Erudition", "Harmony", "Nihility", "Preservation", "Abundance"];

  useEffect(() => {
    const fetchCharacters = async () => { //async function to get character data 
      try { //try catch for error handling 
        const response = await fetch(API_URL); //fetch the api data 
        const data = await response.json(); // wait for response from fetching 
        
        // Sort characters alphabetically
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setCharacters(sortedData); //sort the data 
      } catch (error) {
        console.error("error fetching characters:", error); //catch the error and 
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters(); //call fetchCharacters function 
    loadTeam(); //call load team 
  }, []);

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
      Alert.alert("Team Full", " Team can only have 4 members");
    }
  };

  const removeFromTeam = (character) => { //function to remove character 
    setTeam(team.filter((member) => member.id !== character.id)); //create new array without character
  };

  // Filter characters by path
  const filteredCharacters = filter === "All" 
    ? characters 
    : characters.filter(char => char.path === filter); //filters characters based on path 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HSR Team Builder</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading characters...</Text>
        </View>
      ) : (
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

          {/* Team Display section */}
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
    </View>
  );
};

// dark style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212", 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3498db", // Blue accent
    textAlign: "center",
    marginTop: 100,
    marginBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
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
    backgroundColor: "#3498db", 
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
    marginTop: 10,
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
    color: "#3498db", // Blue accent
    marginBottom: 2,
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
    color: "#3498db", 
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
    backgroundColor: "#3498db", 
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TeamBuilder;