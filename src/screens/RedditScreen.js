// since this uses Reddit's public JSON API it needs no authentication to fetch and display posts

import React, { useState, useEffect, useRef } from 'react'; // added useRef
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview'; // added import

// list of Star Rail character subreddits
const CHARACTER_SUBREDDITS = [
  { name: 'Kafka', subreddit: 'KafkaMains' },
  { name: 'Silver Wolf', subreddit: 'SilverWolfMains' },
  { name: 'Blade', subreddit: 'BladeMains' },
  { name: 'Seele', subreddit: 'SeeleMains' },
  { name: 'Bronya', subreddit: 'BronyaMains' },
  { name: 'Himeko', subreddit: 'HimekoMains' },
  { name: 'Welt', subreddit: 'WeltMains' },
  { name: 'Jing Yuan', subreddit: 'JingYuanMains' },
  { name: 'Fu Xuan', subreddit: 'FuXuanMains' },
  { name: 'Yanqing', subreddit: 'YanqingMains' },
  { name: 'Luocha', subreddit: 'LuochaMains' },
  { name: 'Gepard', subreddit: 'GepardMains' },
  { name: 'Bailu', subreddit: 'BailuMains' },
  { name: 'Clara', subreddit: 'ClaraMains' },
  { name: 'Sushang', subreddit: 'SushangMains' },
  { name: 'Qingque', subreddit: 'QingqueMains' },
  { name: 'General', subreddit: 'HonkaiStarRail' }
];


// state management for all the posts data  and UI controls
const RedditScreen = () => {
  const [selectedSubreddit, setSelectedSubreddit] = useState('HonkaiStarRail');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('hot'); // Default sort order
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [showWebview, setShowWebview] = useState(false);       // new state for modal visibility
  const [webviewUrl, setWebviewUrl] = useState('');              // new state for URL
  const [canGoBack, setCanGoBack] = useState(false); // new state for webview history
  const webViewRef = useRef(null);                  // new WebView ref

  // fetch posts from selected subreddit, code taken from https://www.reddit.com/dev/api/
  const fetchPosts = async (subreddit, sort = sortBy) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/${sort}.json?limit=25`);

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      // process the data to extract only what we need
      const processedPosts = data.data.children.map(post => ({
        id: post.data.id,
        title: post.data.title,
        author: post.data.author,
        score: post.data.score,
        numComments: post.data.num_comments,
        created: post.data.created_utc,
        permalink: post.data.permalink,
        url: post.data.url,
        thumbnail: post.data.thumbnail,
        isVideo: post.data.is_video,
        selftext: post.data.selftext
      }));

      setPosts(processedPosts);
    } catch (err) {
      console.error('Error fetching Reddit posts:', err);
      setError(`Failed to load posts: ${err.message}`);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // filter subreddits based on search query
  const filteredSubreddits = CHARACTER_SUBREDDITS.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subreddit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // initial fetch and when subreddit/sort changes
  useEffect(() => {
    fetchPosts(selectedSubreddit, sortBy);
  }, [selectedSubreddit, sortBy]);

  // handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(selectedSubreddit, sortBy);
  };

  // change sort order
  const changeSortOrder = (newSort) => {
    setSortBy(newSort);
  };

  // format timestamp to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) !== 1 ? 's' : ''} ago`; // in minutes
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) !== 1 ? 's' : ''} ago`; // 24 hours
    if (diff < 2592000) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) !== 1 ? 's' : ''} ago`; // 5 days
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) !== 1 ? 's' : ''} ago`; // month
    return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) !== 1 ? 's' : ''} ago`; // year 
  };

  // open post inside in-app webview modal, gets the permalink from the Reddit API response
  const openPostInBrowser = (permalink) => {
    setWebviewUrl(`https://reddit.com${permalink}`);
    setShowWebview(true);
  };

  // webview modal for displaying Reddit posts
  const renderWebviewModal = () => (
    <Modal
      visible={showWebview}
      animationType="slide"
      onRequestClose={() => setShowWebview(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#272729' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 }}>
          <TouchableOpacity 
            onPress={() => {
              if (canGoBack && webViewRef.current) {
                webViewRef.current.goBack();
              } else {
                setShowWebview(false);
              }
            }}
            style={{ padding: 8 }} // added padding to back button
          >
            <Ionicons name="arrow-back" size={24} color="#D7DADC" />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', color: '#D7DADC', fontSize: 18 }}>Viewing Post</Text>
        </View>
        <WebView 
          ref={webViewRef}
          source={{ uri: webviewUrl }} 
          style={{ flex: 1 }}
          onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        />
      </SafeAreaView>
    </Modal>
  );

  // reddit post rendering
  const renderPostItem = ({ item }) => {
    // determine if thumbnail should be shown
    const showThumbnail = item.thumbnail &&
      item.thumbnail !== 'self' &&
      item.thumbnail !== 'default' &&
      item.thumbnail !== 'nsfw';

    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => openPostInBrowser(item.permalink)}
        activeOpacity={0.7}
      >
        <View style={styles.postContent}>
          <View style={styles.postHeader}>
            <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.postTime}>{formatRelativeTime(item.created)}</Text>
          </View>

          <View style={styles.postDetails}>
            <Text style={styles.postAuthor}>Posted by u/{item.author}</Text>
            <View style={styles.postStats}>
              <View style={styles.statItem}>
                <Ionicons name="arrow-up" size={14} color="#FF4500" />
                <Text style={styles.statText}>{item.score}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={14} color="#878A8C" />
                <Text style={styles.statText}>{item.numComments}</Text>
              </View>
            </View>
          </View>

          {item.selftext && (
            <Text style={styles.postSummary} numberOfLines={2}>
              {item.selftext}
            </Text>
          )}
        </View>

        {showThumbnail && (
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    );
  };

  // render a subreddit button
  const renderSubredditButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.subredditButton,
        selectedSubreddit === item.subreddit && styles.selectedSubreddit
      ]}
      onPress={() => setSelectedSubreddit(item.subreddit)}
    >
      <Text
        style={[
          styles.subredditButtonText,
          selectedSubreddit === item.subreddit && styles.selectedSubredditText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {renderWebviewModal()}
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Star Rail Reddit</Text>
          </View>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#878A8C" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search characters..."
              placeholderTextColor="#878A8C"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#878A8C" />
              </TouchableOpacity>
            )}
          </View>

          {/* subreddit selection */}
          <View style={styles.subredditSelection}>
            <FlatList
              data={filteredSubreddits}
              renderItem={renderSubredditButton}
              keyExtractor={(item) => item.subreddit}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subredditList}
            />
          </View>

          {/* sort options */}
          <View style={styles.sortOptions}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'hot' && styles.activeSortButton]}
              onPress={() => changeSortOrder('hot')}
            >
              <Ionicons
                name="flame"
                size={16}
                color={sortBy === 'hot' ? '#FF4500' : '#878A8C'}
              />
              <Text style={[styles.sortButtonText, sortBy === 'hot' && styles.activeSortText]}>
                Hot
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'new' && styles.activeSortButton]}
              onPress={() => changeSortOrder('new')}
            >
              <Ionicons
                name="time"
                size={16}
                color={sortBy === 'new' ? '#FF4500' : '#878A8C'}
              />
              <Text style={[styles.sortButtonText, sortBy === 'new' && styles.activeSortText]}>
                New
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'top' && styles.activeSortButton]}
              onPress={() => changeSortOrder('top')}
            >
              <Ionicons
                name="trophy"
                size={16}
                color={sortBy === 'top' ? '#FF4500' : '#878A8C'}
              />
              <Text style={[styles.sortButtonText, sortBy === 'top' && styles.activeSortText]}>
                Top
              </Text>
            </TouchableOpacity>
          </View>

          {/* error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#FF4500" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* posts list */}
          {loading && posts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#01DBC6" />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.postsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#01DBC6']}
                />
              }
              ListEmptyComponent={
                !loading && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={48} color="#878A8C" />
                    <Text style={styles.emptyText}>No posts found</Text>
                  </View>
                )
              }
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A1B',
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
    backgroundColor: '#1A1A1B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D7DADC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#272729',
    margin: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#D7DADC',
    fontSize: 16,
  },
  subredditSelection: {
    marginBottom: 8,
  },
  subredditList: {
    paddingHorizontal: 12,
  },
  subredditButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#343536',
  },
  selectedSubreddit: {
    backgroundColor: 'rgba(1, 219, 198, 0.2)',
    borderColor: '#01DBC6',
  },
  subredditButtonText: {
    color: '#D7DADC',
    fontSize: 14,
  },
  selectedSubredditText: {
    color: '#01DBC6',
    fontWeight: 'bold',
  },
  sortOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    borderRadius: 16,
  },
  activeSortButton: {
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
  },
  sortButtonText: {
    color: '#878A8C',
    marginLeft: 4,
    fontSize: 14,
  },
  activeSortText: {
    color: '#FF4500',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D7DADC',
    marginTop: 10,
    fontSize: 16,
  },
  postsList: {
    paddingHorizontal: 12,
  },
  postItem: {
    flexDirection: 'row',
    backgroundColor: '#272729',
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#343536',
  },
  postContent: {
    flex: 1,
    padding: 12,
  },
  postHeader: {
    marginBottom: 6,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D7DADC',
    marginBottom: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#878A8C',
  },
  postDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAuthor: {
    fontSize: 12,
    color: '#878A8C',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statText: {
    fontSize: 12,
    color: '#878A8C',
    marginLeft: 2,
  },
  postSummary: {
    fontSize: 14,
    color: '#D7DADC',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    margin: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#878A8C',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    margin: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF4500',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default RedditScreen;