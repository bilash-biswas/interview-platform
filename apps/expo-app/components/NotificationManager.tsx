import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { initNotificationSocket, disconnectNotificationSocket } from '../redux/services/notificationSocket';
import { Bell } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const NotificationManager = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const [notification, setNotification] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const socket = initNotificationSocket(user.id);

      socket.on('notification', (data: any) => {
        console.log('Received notification (Expo):', data);
        setNotification(data);

        // Slide in
        Animated.spring(slideAnim, {
          toValue: 20,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();

        // Auto-hide after 5 seconds
        setTimeout(() => {
          hideNotification();
        }, 5000);
      });
    } else {
      disconnectNotificationSocket();
    }
  }, [isAuthenticated, user]);

  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotification(null);
    });
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={hideNotification}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Bell size={24} color="#3B82F6" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
        </View>
        <TouchableOpacity onPress={hideNotification} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    zIndex: 9999,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  iconContainer: {
    marginRight: 12,
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  body: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  closeButton: {
    padding: 5,
    marginLeft: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
  }
});

export default NotificationManager;
