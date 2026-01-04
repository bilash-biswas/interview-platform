import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { getNotificationSocket } from '@/redux/services/notificationSocket';
interface UserLocation {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function MapTab() {
  const { user } = useSelector((state: any) => state.auth);
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(null);
  const [userLocations, setUserLocations] = useState<{ [userId: string]: UserLocation }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setMyLocation(location);
        setLoading(false);

        const socket = getNotificationSocket();
        console.log('MapTab: Socket instance:', socket?.connected ? 'Connected' : 'Disconnected', socket?.id);
        if (socket) {
          // Start watching location
          const subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 5,
            },
            (newLocation) => {
              setMyLocation(newLocation);
              console.log('Sending location update:', newLocation.coords);
              socket.emit('location_update', {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              });
            }
          );

          socket.on('user_location', (data: UserLocation) => {
            setUserLocations((prev) => ({
              ...prev,
              [data.userId]: data,
            }));
          });

          return () => {
            subscription.remove();
            socket.off('user_location');
          };
        }
      } catch (error) {
        console.error('Error in MapScreen:', error);
        setErrorMsg('Failed to initialize location services');
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Fetching your location...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: myLocation?.coords.latitude || 51.505,
          longitude: myLocation?.coords.longitude || -0.09,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
      >
        {myLocation && (
          <Marker
            coordinate={{
              latitude: myLocation.coords.latitude,
              longitude: myLocation.coords.longitude,
            }}
            title="You"
            description="Your current location"
            pinColor="green"
          />
        )}
        {Object.values(userLocations).map((userLoc) => (
          <Marker
            key={userLoc.userId}
            coordinate={{
              latitude: userLoc.location.latitude,
              longitude: userLoc.location.longitude,
            }}
            title={`User: ${userLoc.userId}`}
            description="Live tracking active"
            pinColor="blue"
          />
        ))}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Tracking Active</Text>
          <Text style={styles.statsSubtitle}>
            {Object.keys(userLocations).length} other users online
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    color: '#374151',
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
