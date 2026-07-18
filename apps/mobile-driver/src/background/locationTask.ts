import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { apiClient } from '../api/client';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Error in background location task:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      try {
        // Enviar al backend vía API REST como fallback seguro por si WebSocket está cerrado en background
        await apiClient.post('/logistics/driver/location', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          heading: location.coords.heading,
          speed: location.coords.speed
        });
      } catch (err) {
        console.error('Failed to send background location', err);
      }
    }
  }
});
