import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { COLORS, SPACING } from '../constants/theme';
import { socialApi } from '../api/socialService';
import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.10.235:3007';

const PostCard = ({ post, onLike }: { post: any; onLike: (id: string) => void }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const likes = post?.likes || [];
  const comments = post?.comments || [];
  const creatorName = post?.creatorName || 'Anonymous';
  const isLiked = user?.id ? likes.includes(user.id) : false;

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          {/* FIX 2: Defensive check for creatorName string index */}
          <Text style={styles.avatarText}>{creatorName[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View>
          <Text style={styles.username}>{creatorName}</Text>
          <Text style={styles.timestamp}>
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
          </Text>
        </View>
      </View>

      <Text style={styles.postText}>{post.text || ''}</Text>

      {post.mediaUrl ? (
        <View style={styles.mediaPlaceholder}>
          <Text style={styles.mediaText}>MEDIA LINKED</Text>
        </View>
      ) : null}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(post._id || post.id)}
        >
          <Text style={[styles.actionIcon, isLiked && styles.activeIcon]}>❤️</Text>
          <Text style={[styles.actionCount, isLiked && styles.activeCount]}>{likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{comments.length}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function SocialFeedScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchFeed();

    const socket = io(SOCKET_URL, {
      transports: ['websocket'], // Force websocket
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Successfully connected to socket:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.log('Connection Error:', err.message);
    });

    socket.on('post-update', (updatedPost: any) => {
      if (!updatedPost) return;
      setPosts(prevPosts =>
        prevPosts.map(p => (p._id === updatedPost._id || p.id === updatedPost.id ? updatedPost : p))
      );
    });

    socket.on('new-post', (newPost: any) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    });

    return () => {
      socket.disconnect();
      console.log('Socket disconnected:', socket.connected);
    };
  }, []);

  const fetchFeed = async () => {
    try {
      const data = await socialApi.getFeed();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const updatedPost = await socialApi.likePost(postId, user.id);
      setPosts(posts.map(p => (p._id === postId || p.id === postId ? updatedPost : p)));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.arenaBlue} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.feedHeader}>
        <Text style={styles.headerTitle}>TACTICAL FEED</Text>
        <View style={styles.onlineBadge}>
          <Text style={styles.onlineText}>LIVE</Text>
        </View>
      </View>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: COLORS.foreground,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  onlineBadge: {
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  onlineText: {
    color: COLORS.error,
    fontSize: 8,
    fontWeight: '900',
  },
  flatListContent: {
    padding: SPACING.md,
  },
  postCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.arenaBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },
  username: {
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: '900',
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  postText: {
    color: COLORS.foreground,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  mediaPlaceholder: {
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  mediaText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.xl,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
    opacity: 0.6,
  },
  activeIcon: {
    opacity: 1,
  },
  actionCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '900',
  },
  activeCount: {
    color: COLORS.arenaOrange,
  },
});
