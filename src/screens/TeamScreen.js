import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  TextInput,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebase_auth } from '../firebaseConfig';
import { firestore_db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';

// Character data with actual image imports since files are now in place
const CHARACTERS = [
  { id: '1', name: 'Silver Wolf', element: 'Quantum', path: 'Nihility', rarity: 5, image: require('../../assets/characters/silverwolf.png') },
  { id: '2', name: 'Kafka', element: 'Lightning', path: 'Nihility', rarity: 5, image: require('../../assets/characters/kafka.png') },
  { id: '3', name: 'Blade', element: 'Wind', path: 'Destruction', rarity: 5, image: require('../../assets/characters/blade.png') },
  { id: '4', name: 'March 7th', element: 'Ice', path: 'Preservation', rarity: 4, image: require('../../assets/characters/march7th.png') },
  { id: '5', name: 'Dan Heng', element: 'Wind', path: 'Hunt', rarity: 4, image: require('../../assets/characters/danheng.png') },
  { id: '6', name: 'Himeko', element: 'Fire', path: 'Erudition', rarity: 5, image: require('../../assets/characters/himeko.png') },
  { id: '7', name: 'Welt', element: 'Imaginary', path: 'Nihility', rarity: 5, image: require('../../assets/characters/welt.png') },
  { id: '8', name: 'Bronya', element: 'Wind', path: 'Harmony', rarity: 5, image: require('../../assets/characters/bronya.png') },
];

const TeamScreen = () => {
  const [team, setTeam] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamName, setTeamName] = useState('My Team');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const currentUser = firebase_auth.currentUser;

  // Load team data from Firestore when component mounts
  useEffect(() => {
    loadTeamData();
  }, []);

  // Function to load team data from Firestore
  const loadTeamData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(firestore_db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().team) {
        const userData = userDoc.data();
        setTeamName(userData.team.name || 'My Team');
        setTeam(userData.team.members || []);
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      Alert.alert("Error", "Failed to load your team data");
    } finally {
      setLoading(false);
    }
  };

  // Function to save team data to Firestore
  const saveTeamData = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to save a team");
      return;
    }

    if (team.length === 0) {
      Alert.alert("Empty Team", "Please add at least one character to your team");
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(firestore_db, "users", currentUser.uid);
      
      // Check if user document exists and then update the entire team object
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          team: {
            name: teamName,  
            members: team,
            lastUpdated: serverTimestamp()
          }
        });
      } else {
        await setDoc(userRef, {
          email: currentUser.email,
          displayName: currentUser.email.split('@')[0],
          createdAt: serverTimestamp(),
          team: {
            name: teamName,   
            members: team,
            lastUpdated: serverTimestamp()
          }
        });
      }
      
      Alert.alert("Success", "Team saved successfully!");
    } catch (error) {
      console.error("Error saving team:", error);
      Alert.alert("Error", "Failed to save your team");
    } finally {
      setSaving(false);
    }
  };

  // Function to add a character to the team
  const addToTeam = (character) => {
    if (team.length >= 4) {
      Alert.alert("Team Full", "You can only have up to 4 characters in your team");
      return;
    }
    
    // Check if character is already in the team
    if (team.some(member => member.id === character.id)) {
      Alert.alert("Already Added", `${character.name} is already in your team`);
      return;
    }
    
    setTeam([...team, character]);
    setModalVisible(false);
  };

  // Function to remove a character from the team
  const removeFromTeam = (characterId) => {
    setTeam(team.filter(character => character.id !== characterId));
  };

  // Filtered characters based on search query
  const filteredCharacters = CHARACTERS.filter(character => 
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.element.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Character selection modal
  const CharacterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Character</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search characters..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <FlatList
            data={filteredCharacters}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.characterListItem}
                onPress={() => addToTeam(item)}
              >
                <Image source={item.image} style={styles.characterListImage} />
                <View style={styles.characterListInfo}>
                  <Text style={styles.characterListName}>{item.name}</Text>
                  <View style={styles.characterListDetails}>
                    <Text style={styles.characterListElement}>{item.element}</Text>
                    <Text style={styles.characterListPath}>{item.path}</Text>
                  </View>
                </View>
                <View style={styles.rarityContainer}>
                  {[...Array(item.rarity)].map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#FFD700" />
                  ))}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Team name editor
  const EditableName = () => (
    <View style={styles.teamNameContainer}>
      <TextInput
        style={styles.teamNameInput}
        defaultValue={teamName}
        placeholder="Enter team name"
        placeholderTextColor="#999"
        onBlur={(e) => setTeamName(e.nativeEvent.text)}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#01DBC6" />
        <Text style={styles.loadingText}>Loading your team...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CharacterModal />
      
      <View style={styles.header}>
        <Text style={styles.title}>Team Builder</Text>
      </View>
      
      <EditableName />
      
      <View style={styles.teamContainer}>
        {team.length === 0 ? (
          <View style={styles.emptyTeam}>
            <Text style={styles.emptyTeamText}>Your team is empty</Text>
            <Text style={styles.emptyTeamSubtext}>Add up to 4 characters to your team</Text>
          </View>
        ) : (
          <FlatList
            data={team}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.teamMember}>
                <Image source={item.image} style={styles.teamMemberImage} />
                <View style={styles.teamMemberInfo}>
                  <Text style={styles.teamMemberName}>{item.name}</Text>
                  <View style={styles.teamMemberDetails}>
                    <Text style={styles.teamMemberElement}>{item.element}</Text>
                    <Text style={styles.teamMemberPath}>{item.path}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromTeam(item.id)}
                >
                  <Ionicons name="close-circle" size={22} color="#FF4500" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setSearchQuery('');
            setModalVisible(true);
          }}
          disabled={team.length >= 4}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Add Character</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.savingButton]}
          onPress={saveTeamData}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Save Team</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    marginTop: 50,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#01DBC6',
  },
  teamNameContainer: {
    marginBottom: 16,
  },
  teamNameInput: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    fontSize: 18,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  teamContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emptyTeam: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTeamText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyTeamSubtext: {
    fontSize: 14,
    color: '#999',
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  teamMemberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  teamMemberDetails: {
    flexDirection: 'row',
  },
  teamMemberElement: {
    color: '#01DBC6',
    fontSize: 14,
    marginRight: 8,
  },
  teamMemberPath: {
    color: '#999',
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#01DBC6',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
  },
  savingButton: {
    backgroundColor: '#018a79',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    height: '80%',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#252525',
    color: '#FFFFFF',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  characterListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  characterListImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  characterListInfo: {
    flex: 1,
  },
  characterListName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  characterListDetails: {
    flexDirection: 'row',
    marginTop: 4,
  },
  characterListElement: {
    color: '#01DBC6',
    fontSize: 14,
    marginRight: 8,
  },
  characterListPath: {
    color: '#999',
    fontSize: 14,
  },
  rarityContainer: {
    flexDirection: 'row',
  },
});

export default TeamScreen;