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

const CameraType = {
  back: 'back',
  front: 'front',
};

// sticker assets to place on pictures
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
  // get screen dimensions for boundary checking and full-screen display
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [facing, setFacing] = useState(CameraType.back);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  const [placedStickers, setPlacedStickers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [finalImageUri, setFinalImageUri] = useState(null);
  const [viewShotLayout, setViewShotLayout] = useState({ width: 0, height: 0 });
  const [showDeleteButtons, setShowDeleteButtons] = useState(true); // delete button visibility after taking a picture so it does not show in the final image
  
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);
  
  // permission handling
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Text style={styles.message}>Camera access is required for this feature</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // camera functions
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          skipProcessing: false, // process the image for better quality
        });
        setPhotoUri(photo.uri);
        setIsEditing(true); // enter editing mode with stickers
        setShowDeleteButtons(true); // show delete buttons while editing
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };
  
  const sharePhoto = async () => {
    // hide delete buttons before capturing the image
    setShowDeleteButtons(false);
    
    // wait a moment for the UI to update before capturing
    setTimeout(async () => {
      // ff we have stickers, capture the combined view first
      if (placedStickers.length > 0 && viewShotRef.current) {
        try {
          const capturedUri = await viewShotRef.current.capture();
          setFinalImageUri(capturedUri);
          
          // share the combined image
          const fileUrl = Platform.OS === 'ios' ? capturedUri : `file://${capturedUri}`;
          await Share.share({
            url: fileUrl,
            message: 'Check out my Star Rail journey!'
          });
          
          // how delete buttons again after sharing
          setShowDeleteButtons(true);
        } catch (error) {
          console.error('Error capturing or sharing edited photo:', error);
          Alert.alert('Error', 'Failed to share photo');
          setShowDeleteButtons(true);
        }
      } else {
        // if no stickers, share the original photo
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
    }, 100); // give UI time to update so the sticker is captured as well
  };

  // add a sticker to the image
  const handleStickerSelect = (sticker) => {
    // generate unique id for the placed sticker and place it in the center of the camera view 
    const centerX = viewShotLayout.width / 2 - 40; // accounting for sticker width
    const centerY = viewShotLayout.height / 2 - 40; 

    const newSticker = {
      id: Date.now(),
      sticker,
      position: { x: centerX, y: centerY },
      scale: 1, // Default scale for new stickers
    };
    
    setPlacedStickers([...placedStickers, newSticker]);
  };

  // update a sticker's position so when it is dragged with panResponder, it does not teleport back to the original position
  const updateStickerPosition = (id, newPosition) => {
    setPlacedStickers(currentStickers => 
      currentStickers.map(item => {
        if (item.id === id) {
          // code to update from previous state https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
          return { ...item, position: newPosition };
        }
        return item;
      })
    );
  };

  // updates the stickers scale based on pinch gesture and keeps it in sync with the parent component
  const updateStickerScale = (id, newScale) => {
    setPlacedStickers(currentStickers => 
      currentStickers.map(item => {
        if (item.id === id) {
          return { ...item, scale: newScale };
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
    // capture the final image with stickers and update the final uri
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

  const PlacedSticker = ({ sticker, position: initialPosition, id, scale = 1 }) => {
    // initialPosition directly in our local state
    const [position, setPosition] = useState(initialPosition);
    const [stickerScale, setStickerScale] = useState(scale);
    
    // use refs to track position during drag operations
    const positionRef = useRef(initialPosition);
    const lastGestureState = useRef({ dx: 0, dy: 0 });
    const initialDistanceRef = useRef(null);
    const currentScaleRef = useRef(scale);
    
    // this useEffect ensures our local state stays in sync with parent, also ensure proper functionality with drag gestures
    useEffect(() => {
      positionRef.current = initialPosition;
      setPosition(initialPosition);
      currentScaleRef.current = scale;
      setStickerScale(scale);
    }, [initialPosition, scale]);
    
    // create pan responder for dragging and pinch functionality, code from https://reactnative.dev/docs/panresponder
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          // reset gesture tracking at the start of a new drag
          lastGestureState.current = { dx: 0, dy: 0 };
          initialDistanceRef.current = null;
        },
        onPanResponderMove: (evt, gestureState) => {
          const touches = evt.nativeEvent.touches;
          
          // check for a pinch gesture from user
          if (touches.length === 2) {
            const dx = touches[0].pageX - touches[1].pageX;
            const dy = touches[0].pageY - touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (!initialDistanceRef.current) {
              initialDistanceRef.current = distance;
              return;
            }
            
            // scale the sticker based on the pinch distance
            let newScale = currentScaleRef.current * (distance / initialDistanceRef.current);
            
            // limit the scale so the sticker is not too big
            newScale = Math.max(0.5, Math.min(3, newScale));
            
            // update the scale ref and state
            currentScaleRef.current = newScale;
            setStickerScale(newScale);
            
            return;
          } else if (initialDistanceRef.current) {
            // if we were pinching and stopped to the reset initial distance
            initialDistanceRef.current = null;
          }
          
          // drag movement handling
          const newX = positionRef.current.x + (gestureState.dx - lastGestureState.current.dx);
          const newY = positionRef.current.y + (gestureState.dy - lastGestureState.current.dy);
          
          // boundary constraints for the sticker
          const stickerSize = 80 * stickerScale;
          const constrainedX = Math.max(0, Math.min(viewShotLayout.width - stickerSize, newX));
          const constrainedY = Math.max(0, Math.min(viewShotLayout.height - stickerSize, newY));
          
          // update the position ref and state
          const newPosition = { x: constrainedX, y: constrainedY };
          positionRef.current = newPosition;
          setPosition(newPosition);
          
          // keep track of the current gesture state for next move
          lastGestureState.current = { dx: gestureState.dx, dy: gestureState.dy };
        },
        onPanResponderRelease: () => {
          // when the gesture is finished, update the parent component state
          updateStickerPosition(id, positionRef.current);
          
          // always update the scale when the gesture ends
          updateStickerScale(id, currentScaleRef.current);
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
            transform: [{ scale: stickerScale }]
          }
        ]}
      >
        {/* image sticker */}
        <Image
          source={sticker.source}
          style={styles.placedStickerImage}
          resizeMode="contain"
        />
        
        {/* rmove button - only show when editing and taking pictures */}
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

  // sticker selector component
  const StickerSelector = () => {
    return (
      <View style={styles.stickerSelectorContainer}>        
        {/* sticker selection from horizontal menu */}
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
        
        {/* instruction text for pinch gesture */}
        <Text style={styles.gestureHint}>PanResponderinch to resize stickers!</Text>
      </View>
    );
  };

  // UI rendering
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      {photoUri ? (
        // photo preview with sticker editing
        <View style={styles.previewContainer}>
          <ViewShot 
            ref={viewShotRef} 
            style={styles.viewShot} 
            options={{ format: 'jpg', quality: 0.9 }}
            onLayout={handleViewShotLayout}
          >
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            
            {/* display all placed stickers */}
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
          
          {/* sticker selector - only show when in editing mode */}
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
        // full screen camera view settings
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
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    padding: 20,
    width: '80%',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  message: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#01DBC6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
    // full screen camera
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
    // full screen preview
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  viewShot: {
    // full screen viewshot
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    // cover to fill the screen completely with the preview for better viewing
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
  // sticker selector styling
  stickerSelectorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
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
  // placed sticker styling
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
  gestureHint: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 5,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
});

export default CameraScreen;