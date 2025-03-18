import React, { useState, useRef, useEffect } from 'react';
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
  PanResponder,
  Dimensions,
  StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';

// Define camera types as constants
const CameraType = {
  back: 'back',
  front: 'front',
};

// Using your existing sticker assets
const STICKERS = [
    { id: 1, source: require('../../assets/stickers/pompom1.png') },
    { id: 2, source: require('../../assets/stickers/pompom2.png') },
    { id: 3, source: require('../../assets/stickers/pompom3.png') },
    { id: 4, source: require('../../assets/stickers/pompom4.png') },
    { id: 5, source: require('../../assets/stickers/sparkle1.png') },
    { id: 6, source: require('../../assets/stickers/sparkle2.png') },
    { id: 7, source: require('../../assets/stickers/sparkle3.png') },
    { id: 8, source: require('../../assets/stickers/sparkle4.png') },
];

const CameraScreen = () => {
  // Get screen dimensions for boundary checking and full-screen display
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // State management
  const [facing, setFacing] = useState(CameraType.back);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  const [placedStickers, setPlacedStickers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [finalImageUri, setFinalImageUri] = useState(null);
  const [selectedStickerSize, setSelectedStickerSize] = useState(1); // Scale factor for stickers
  const [viewShotLayout, setViewShotLayout] = useState({ width: 0, height: 0 });
  const [showDeleteButtons, setShowDeleteButtons] = useState(true); // Control delete button visibility
  
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
        // Take a full-resolution photo
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          skipProcessing: false, // Process the image for better quality
        });
        setPhotoUri(photo.uri);
        setIsEditing(true); // Enter editing mode with stickers
        setShowDeleteButtons(true); // Show delete buttons while editing
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };
  
  const sharePhoto = async () => {
    // Hide delete buttons before capturing the image
    setShowDeleteButtons(false);
    
    // Wait a moment for the UI to update before capturing
    setTimeout(async () => {
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
          
          // Show delete buttons again after sharing
          setShowDeleteButtons(true);
        } catch (error) {
          console.error('Error capturing or sharing edited photo:', error);
          Alert.alert('Error', 'Failed to share photo');
          setShowDeleteButtons(true);
        }
      } else {
        // If no stickers, share the original photo
        try {
          const fileUrl = Platform.OS === 'ios' ? photoUri : `file://${photoUri}`;
          await Share.share({
            url: fileUrl,
            message: 'Check out my Star Rail journey!'
          });
          setShowDeleteButtons(true);
        } catch (error) {
          console.error('Error sharing photo:', error);
          Alert.alert('Error', 'Failed to share photo');
          setShowDeleteButtons(true);
        }
      }
    }, 100); // Give UI time to update
  };

  // Add a sticker to the image
  const handleStickerSelect = (sticker) => {
    // Generate unique id for the placed sticker and place it in the center of the viewshot area
    const centerX = viewShotLayout.width / 2 - 40; // Accounting for sticker width
    const centerY = viewShotLayout.height / 2 - 40; // Accounting for sticker height
    
    const newSticker = {
      id: Date.now(),
      sticker,
      position: { x: centerX, y: centerY },
      scale: selectedStickerSize,
    };
    
    setPlacedStickers([...placedStickers, newSticker]);
  };

  // Update a sticker's position in the main array
  const updateStickerPosition = (id, newPosition) => {
    // Use the functional form of setState to avoid closure problems
    setPlacedStickers(currentStickers => 
      currentStickers.map(item => {
        if (item.id === id) {
          return { ...item, position: newPosition };
        }
        return item;
      })
    );
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
    setShowDeleteButtons(true);
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

  const handleViewShotLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setViewShotLayout({ width, height });
  };

  // PlacedSticker component - internal to CameraScreen
  const PlacedSticker = ({ sticker, position: initialPosition, id, scale = 1 }) => {
    // We need to use initialPosition directly in our local state
    const [position, setPosition] = useState(initialPosition);
    
    // Use refs to track position during drag operations
    const positionRef = useRef(initialPosition);
    const lastGestureState = useRef({ dx: 0, dy: 0 });
    
    // This useEffect ensures our local state stays in sync with parent props
    useEffect(() => {
      positionRef.current = initialPosition;
      setPosition(initialPosition);
    }, [initialPosition]);
    
    // Create pan responder for dragging functionality with boundary checks
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // Reset gesture tracking at the start of a new drag
          lastGestureState.current = { dx: 0, dy: 0 };
        },
        onPanResponderMove: (evt, gestureState) => {
          // Calculate the new position based on the gesture deltas
          const newX = positionRef.current.x + (gestureState.dx - lastGestureState.current.dx);
          const newY = positionRef.current.y + (gestureState.dy - lastGestureState.current.dy);
          
          // Constrain to viewShot boundaries
          const stickerSize = 80 * scale;
          const constrainedX = Math.max(0, Math.min(viewShotLayout.width - stickerSize, newX));
          const constrainedY = Math.max(0, Math.min(viewShotLayout.height - stickerSize, newY));
          
          // Update the position ref and state
          const newPosition = { x: constrainedX, y: constrainedY };
          positionRef.current = newPosition;
          setPosition(newPosition);
          
          // Keep track of the current gesture state for next move
          lastGestureState.current = { dx: gestureState.dx, dy: gestureState.dy };
        },
        onPanResponderRelease: () => {
          // When the drag is finished, update the parent component state
          // This is crucial - we must sync our final position with the parent
          updateStickerPosition(id, positionRef.current);
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
            transform: [{ scale: scale }]
          }
        ]}
      >
        {/* Image sticker */}
        <Image
          source={sticker.source}
          style={styles.placedStickerImage}
          resizeMode="contain"
        />
        
        {/* Remove button - only show when editing and showDeleteButtons is true */}
        {isEditing && showDeleteButtons && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => {
              setPlacedStickers(current => current.filter(s => s.id !== id));
            }}
          >
            <Ionicons name="close-circle" size={20} color="#FF4500" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Sticker selector component - internal to CameraScreen
  const StickerSelector = () => {
    return (
      <View style={styles.stickerSelectorContainer}>
        {/* Size selector */}
        <View style={styles.sizeSelector}>
          <TouchableOpacity 
            style={[styles.sizeButton, selectedStickerSize === 0.75 && styles.selectedSize]} 
            onPress={() => setSelectedStickerSize(0.75)}
          >
            <Text style={styles.sizeButtonText}>S</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sizeButton, selectedStickerSize === 1 && styles.selectedSize]} 
            onPress={() => setSelectedStickerSize(1)}
          >
            <Text style={styles.sizeButtonText}>M</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sizeButton, selectedStickerSize === 1.5 && styles.selectedSize]} 
            onPress={() => setSelectedStickerSize(1.5)}
          >
            <Text style={styles.sizeButtonText}>L</Text>
          </TouchableOpacity>
        </View>
        
        {/* Sticker options */}
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
              <Image 
                source={sticker.source} 
                style={styles.stickerPreview} 
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // UI Rendering
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      {photoUri ? (
        // Photo preview with sticker editing - Full screen
        <View style={styles.previewContainer}>
          <ViewShot 
            ref={viewShotRef} 
            style={styles.viewShot} 
            options={{ format: 'jpg', quality: 0.9 }}
            onLayout={handleViewShotLayout}
          >
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            
            {/* Display all placed stickers */}
            {placedStickers.map((item) => (
              <PlacedSticker 
                key={item.id}
                id={item.id}
                sticker={item.sticker}
                position={item.position}
                scale={item.scale}
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
        // Camera view - Full screen
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
    // Remove any constraints to make camera full screen
    width: '100%',
    height: '100%',
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
    // Make preview container take up full screen
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  viewShot: {
    // Make viewShot take up full screen
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    // Changed from 'contain' to 'cover' to fill the screen completely
    resizeMode: 'cover',
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
  // Sticker selector container and styles
  stickerSelectorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  sizeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sizeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888',
  },
  selectedSize: {
    borderColor: '#01DBC6',
    borderWidth: 2,
    backgroundColor: 'rgba(1, 219, 198, 0.3)',
  },
  sizeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stickerSelector: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
  },
  stickerOption: {
    marginHorizontal: 8,
    borderRadius: 8,
    padding: 5,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerPreview: {
    width: 50,
    height: 50,
  },
  // Placed sticker styles
  placedSticker: {
    position: 'absolute',
    width: 80,
    height: 80,
    zIndex: 999,
  },
  placedStickerImage: {
    width: '100%',
    height: '100%',
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
    zIndex: 1000,
  },
});

export default CameraScreen;