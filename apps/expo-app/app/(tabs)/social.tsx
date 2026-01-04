import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, SPACING } from '@/constants/theme';
import {
  useGetFeedQuery,
  useLikePostMutation,
  useAddCommentMutation,
  useAddReplyMutation,
  useGetStoriesQuery
} from '@/redux/services/socialApi';

// -- COMPONENT: ReplyItem --
const ReplyItem = ({ reply }: { reply: any }) => (
  <View style={styles.replyItem}>
    <View style={styles.smallAvatar}>
      <Text style={styles.smallAvatarText}>{reply.username?.[0]?.toUpperCase()}</Text>
    </View>
    <View style={styles.replyContent}>
      <Text style={styles.replyUser}>{reply.username}</Text>
      <Text style={styles.replyText}>{reply.text}</Text>
    </View>
  </View>
);

// -- COMPONENT: CommentItem --
const CommentItem = ({ comment, postId, onReply }: { comment: any; postId: string; onReply: (cid: string) => void }) => {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentMain}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>{comment.username?.[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.commentBody}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentUser}>{comment.username}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
          </View>
          <View style={styles.commentFooter}>
            <Text style={styles.commentTime}>
              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <TouchableOpacity onPress={() => onReply(comment._id || comment.id)}>
              <Text style={styles.replyBtnText}>RESPOND</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {comment.replies?.length > 0 && (
        <View style={styles.repliesContainer}>
          {!showReplies ? (
            <TouchableOpacity onPress={() => setShowReplies(true)}>
              <Text style={styles.viewRepliesText}>View {comment.replies.length} responses...</Text>
            </TouchableOpacity>
          ) : (
            comment.replies.map((r: any, idx: number) => <ReplyItem key={idx} reply={r} />)
          )}
        </View>
      )}
    </View>
  );
};

// -- COMPONENT: PostCard --
const PostCard = ({
  post,
  userId,
  onLike,
  onAddComment,
  onAddReply
}: {
  post: any;
  userId?: string;
  onLike: (id: string) => void;
  onAddComment: (pid: string, text: string) => void;
  onAddReply: (pid: string, cid: string, text: string) => void;
}) => {
  const [showComms, setShowComms] = useState(false);
  const [comText, setComText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const likes = post?.likes || [];
  const comments = post?.comments || [];
  const isLiked = userId ? likes.includes(userId) : false;
  const pType = post.type || 'post';

  const typeColor = pType === 'reel' ? COLORS.arenaPurple : pType === 'quote' ? COLORS.arenaOrange : COLORS.arenaBlue;

  const handleSendComm = () => {
    if (!comText.trim()) return;
    if (replyingTo) {
      onAddReply(post.id, replyingTo, comText);
      setReplyingTo(null);
    } else {
      onAddComment(post.id, comText);
    }
    setComText('');
  };

  return (
    <View style={[styles.postCard, { borderLeftColor: typeColor, borderLeftWidth: 4 }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: typeColor }]}>
          <Text style={styles.avatarText}>{post.creatorName?.[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.username}>{post.creatorName}</Text>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>{pType.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>Sector Entry: {new Date(post.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={[styles.contentArea, pType === 'quote' && styles.quoteContainer]}>
        {pType === 'quote' && <Text style={styles.quoteMark}>"</Text>}
        <Text style={[styles.postText, pType === 'quote' && styles.quoteText]}>
          {post.content}
        </Text>
        {pType === 'quote' && <Text style={[styles.quoteMark, { alignSelf: 'flex-end', marginTop: -20 }]}>"</Text>}
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onLike(post.id)}>
          <Text style={[styles.actionIcon, isLiked && { opacity: 1 }]}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionCount, isLiked && { color: COLORS.arenaOrange }]}>{likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowComms(!showComms)}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]}>
          <Text style={styles.actionIcon}>🚀</Text>
          <Text style={styles.actionCount}>Relay</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComms && (
        <View style={styles.commsSection}>
          <View style={styles.commInputRow}>
            <TextInput
              style={styles.commInput}
              placeholder={replyingTo ? "Transmission response..." : "Add frequency analysis..."}
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={comText}
              onChangeText={setComText}
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: typeColor }]} onPress={handleSendComm}>
              <Text style={styles.sendIcon}>📡</Text>
            </TouchableOpacity>
          </View>
          {replyingTo && (
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 8, color: COLORS.arenaPurple, fontWeight: '900' }}>CANCEL REPLY X</Text>
            </TouchableOpacity>
          )}

          <View style={styles.commList}>
            {comments.map((c: any, idx: number) => (
              <CommentItem
                key={idx}
                comment={c}
                postId={post.id}
                onReply={(cid) => {
                  setReplyingTo(cid);
                }}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// -- MAIN: SocialFeedScreen --
export default function SocialFeedScreen() {
  const { user } = useAuth();
  const { data: posts = [], isLoading, refetch } = useGetFeedQuery();
  const { data: stories } = useGetStoriesQuery();

  const [likePost] = useLikePostMutation();
  const [addComment] = useAddCommentMutation();
  const [addReply] = useAddReplyMutation();

  const handleLike = (postId: string) => {
    if (user) likePost({ postId, userId: user.id });
  };

  const handleAddComment = (postId: string, text: string) => {
    if (user) addComment({ postId, body: { userId: user.id, username: user.username, text } });
  };

  const handleAddReply = (postId: string, commentId: string, text: string) => {
    if (user) addReply({ postId, commentId, body: { userId: user.id, username: user.username, text } });
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
      {/* Header */}
      <View style={styles.feedHeader}>
        <Text style={styles.headerTitle}>TACTICAL FEED</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={() => (
          <View style={{ marginBottom: SPACING.lg }}>
            {/* Stories Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesBar}>
              <TouchableOpacity style={styles.addStory}>
                <View style={styles.addStoryCircle}>
                  <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
                </View>
                <Text style={styles.storyUser}>Add Intel</Text>
              </TouchableOpacity>
              {stories?.map((s: any) => (
                <View key={s.id} style={styles.storyItem}>
                  <View style={styles.storyCircle}>
                    <Text style={styles.avatarText}>{s.username?.[0]}</Text>
                  </View>
                  <Text style={styles.storyUser} numberOfLines={1}>{s.username}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            userId={user?.id}
            onLike={handleLike}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },

  feedHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, justifyContent: 'space-between' },
  headerTitle: { color: COLORS.foreground, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  liveBadge: { backgroundColor: 'rgba(255, 75, 75, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: COLORS.error },
  liveText: { color: COLORS.error, fontSize: 8, fontWeight: '900' },

  storiesBar: { paddingLeft: SPACING.md, marginBottom: 10 },
  addStory: { alignItems: 'center', marginRight: 20 },
  addStoryCircle: { width: 60, height: 60, borderRadius: 22, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  storyItem: { alignItems: 'center', marginRight: 16 },
  storyCircle: { width: 60, height: 60, borderRadius: 22, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.arenaBlue, justifyContent: 'center', alignItems: 'center' },
  storyUser: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '900', marginTop: 8, letterSpacing: 1, width: 60, textAlign: 'center' },

  flatListContent: { padding: SPACING.md },
  postCard: { backgroundColor: COLORS.card, borderRadius: 30, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },

  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  username: { color: COLORS.foreground, fontSize: 15, fontWeight: '900' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontSize: 8, fontWeight: '900' },
  timestamp: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', opacity: 0.4, marginTop: 2 },

  contentArea: { marginBottom: 20 },
  postText: { color: COLORS.foreground, fontSize: 16, lineHeight: 24, fontWeight: '500' },

  quoteContainer: { padding: 30, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  quoteText: { fontStyle: 'italic', textAlign: 'center', fontSize: 20, fontWeight: '800' },
  quoteMark: { color: COLORS.arenaOrange, fontSize: 40, opacity: 0.2, fontWeight: '900' },

  postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 30 },
  actionIcon: { fontSize: 20, marginRight: 8, opacity: 0.4 },
  actionCount: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '800' },

  commsSection: { marginTop: 24, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20, padding: 16 },
  commInputRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  commInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 12, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { fontSize: 18 },

  commList: { gap: 16 },
  commentItem: { marginBottom: 10 },
  commentMain: { flexDirection: 'row', gap: 10 },
  commentAvatar: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  commentBody: { flex: 1 },
  commentBubble: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 16, borderTopLeftRadius: 4 },
  commentUser: { color: COLORS.arenaBlue, fontSize: 11, fontWeight: '900', marginBottom: 2 },
  commentText: { color: COLORS.foreground, fontSize: 13, fontWeight: '500' },
  commentFooter: { flexDirection: 'row', gap: 15, marginTop: 6, paddingLeft: 4 },
  commentTime: { color: COLORS.textSecondary, fontSize: 9, opacity: 0.4, fontWeight: '800' },
  replyBtnText: { color: COLORS.arenaPurple, fontSize: 9, fontWeight: '900' },

  repliesContainer: { marginLeft: 40, marginTop: 10, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.05)', paddingLeft: 12 },
  replyItem: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  smallAvatar: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  smallAvatarText: { fontSize: 10, color: '#fff', fontWeight: '900' },
  replyContent: { flex: 1 },
  replyUser: { color: COLORS.arenaPurple, fontSize: 10, fontWeight: '900' },
  replyText: { color: COLORS.foreground, fontSize: 12, opacity: 0.8 },
  viewRepliesText: { fontSize: 10, color: COLORS.textSecondary, opacity: 0.4, fontWeight: '900' }
});
