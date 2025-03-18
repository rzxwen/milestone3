import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  Share,
  Platform,
  ScrollView,
  PanResponder
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';

// Define camera types as constants
const CameraType = {
  back: 'back',
  front: 'front',
};

// This will be updated with your actual sticker assets
const STICKERS = [
  { id: 1, source: require('../stickers/pompom1.png') },
  { id: 2, source: require('../stickers/pompom2.png') },
  { id: 3, source: require('../stickers/pompom3.png') },
  { id: 4, source: require('../stickers/pompom4.png') },
  { id: 5, source: require('../stickers/sparkle1.png') },
  { id: 6, source: require('../stickers/sparkle2.png') },
  { id: 7, source: require('../stickers/sparkle3.png') },
  { id: 8, source: require('../stickers/sparkle4.png') },
];

const CameraScreen = () => {
  // State management
  const [facing, setFacing] = useState(CameraType.back);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  const [placedStickers, setPlacedStickers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [finalImageUri, setFinalImageUri] = useState(null);
  
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);

  // Permission handling
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access is required for this feature</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera functions
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo.uri);
        setIsEditing(true); // Enter editing mode with stickers
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };
  
  const sharePhoto = async () => {
    // If we have stickers, capture the combined view first
    if (placedStickers.length > 0 && viewShotRef.current) {
      try {
        const capturedUri = await viewShotRef.current.capture();
        setFinalImageUri(capturedUri);
        
        // Share the composite image
        const fileUrl = Platform.OS === 'ios' ? capturedUri : `file://${capturedUri}`;
        await Share.share({
          url: fileUrl,
          message: 'Check out my Star Rail journey!'
        });
      } catch (error) {
        console.error('Error capturing or sharing edited photo:', error);
        Alert.alert('Error', 'Failed to share photo');
      }
    } else {
      // If no stickers, share the original photo
      try {
        const fileUrl = Platform.OS === 'ios' ? photoUri : `file://${photoUri}`;
        await Share.share({
          url: fileUrl,
          message: 'Check out my Star Rail journey!'
        });
      } catch (error) {
        console.error('Error sharing photo:', error);
        Alert.alert('Error', 'Failed to share photo');
      }
    }
  };

  // Add a sticker to the image
  const handleStickerSelect = (sticker) => {
    // Generate unique id for the placed sticker
    const newSticker = {
      id: Date.now(),
      sticker,
      position: { x: 100, y: 100 }  // Default initial position
    };
    
    setPlacedStickers([...placedStickers, newSticker]);
  };

  const toggleCameraFacing = () => {
    setFacing(facing === CameraType.back ? CameraType.front : CameraType.back);
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  const discardPhoto = () => {
    setPhotoUri(null);
    setPlacedStickers([]);
    setIsEditing(false);
    setFinalImageUri(null);
  };

  const finishEditing = () => {
    // Capture the final image with stickers
    if (viewShotRef.current) {
      viewShotRef.current.capture().then(uri => {
        setFinalImageUri(uri);
        setIsEditing(false);
      }).catch(error => {
        console.error("Error capturing final image:", error);
        Alert.alert("Error", "Failed to save edited image");
      });
    }
  };

  // PlacedSticker component - now internal to CameraScreen
  const PlacedSticker = ({ sticker, position: initialPosition, id }) => {
    const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
    
    // Create pan responder for dragging functionality
    const panResponder = React.useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
          // Update sticker position based on drag
          setPosition({
            x: position.x + gestureState.dx,
            y: position.y + gestureState.dy
          });
        },
        onPanResponderRelease: () => {
          // You could add more logic here when the user stops dragging
          // For example, snap to grid or boundaries
        },
      })
    ).current;

    return (
      <View
        {...panResponder.panHandlers}
        style={[
          styles.placedSticker,
          {
            left: position.x,
            top: position.y,
          }
        ]}
      >
        <Image source={sticker.source} style={styles.placedStickerImage} />
        {/* Optional: Add a remove button on long press or with a small X icon */}
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => {
            // Remove this sticker from the placed stickers array
            setPlacedStickers(placedStickers.filter(s => s.id !== id));
          }}
        >
          <Ionicons name="close-circle" size={20} color="#FF4500" />
        </TouchableOpacity>
      </View>
    );
  };

  // Sticker selector component - now internal to CameraScreen
  const StickerSelector = () => {
    return (
      <ScrollView 
        horizontal 
        style={styles.stickerSelector}
        showsHorizontalScrollIndicator={false}
      >
        {STICKERS.map((sticker) => (
          <TouchableOpacity 
            key={sticker.id} 
            style={styles.stickerOption}
            onPress={() => handleStickerSelect(sticker)}
          >
            <Image source={sticker.source} style={styles.stickerImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // UI Rendering
  return (
    <View style={styles.container}>
      {photoUri ? (
        // Photo preview with sticker editing
        <View style={styles.previewContainer}>
          <ViewShot ref={viewShotRef} style={styles.viewShot} options={{ format: 'jpg', quality: 0.9 }}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            
            {/* Display all placed stickers */}
            {placedStickers.map((item) => (
              <PlacedSticker 
                key={item.id}
                id={item.id}
                sticker={item.sticker}
                position={item.position}
              />
            ))}
          </ViewShot>
          
          {/* Sticker selector - only show when in editing mode */}
          {isEditing && <StickerSelector />}
          
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={discardPhoto}>
              <Ionicons name="close-circle" size={32} color="#FFFFFF" />
              <Text style={styles.buttonText}>Discard</Text>
            </TouchableOpacity>
            
            {isEditing ? (
              <TouchableOpacity style={styles.actionButton} onPress={finishEditing}>
                <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionButton} onPress={sharePhoto}>
                <Ionicons name="share-social" size={32} color="#FFFFFF" />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        // Camera view
        <CameraView 
          ref={cameraRef} 
          style={styles.camera} 
          facing={facing}
          flashMode={flashMode}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Star Rail Camera</Text>
            <Text style={styles.headerSubtitle}>Capture your journey through the cosmos</Text>
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
              <Ionicons 
                name={flashMode === 'off' ? "flash-off" : "flash"} 
                size={28} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#01DBC6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginTop: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewShot: {
    width: '100%',
    height: '80%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 40,
  },
  actionButton: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  // Sticker selector styles
  stickerSelector: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
  },
  stickerOption: {
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  stickerImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  // Placed sticker styles
  placedSticker: {
    position: 'absolute',
    width: 100,
    height: 100,
    zIndex: 999,
  },
  placedStickerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScreen;