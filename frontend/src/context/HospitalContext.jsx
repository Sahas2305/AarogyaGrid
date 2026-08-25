/**
 * HospitalContext.jsx — HealthcareOS Multi-Hospital & Geolocation Context
 * Manages active hospital state, live GPS / pincode detection, and proximity-based suggestions.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { HOSPITALS_INDIA, DEFAULT_HOSPITAL, calculateDistanceKm } from '../data/hospitalsData';

const HospitalContext = createContext(null);

const STORAGE_KEY = 'healthcare_selected_hospital_id';
const LOCATION_STORAGE_KEY = 'healthcare_user_location';

export const HospitalProvider = ({ children }) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_HOSPITAL.id;
  });

  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Active hospital object
  const selectedHospital = useMemo(() => {
    return (
      HOSPITALS_INDIA.find((h) => h.id === selectedHospitalId) || DEFAULT_HOSPITAL
    );
  }, [selectedHospitalId]);

  // Persist selected hospital
  useEffect(() => {
    if (selectedHospitalId) {
      localStorage.setItem(STORAGE_KEY, selectedHospitalId);
    }
  }, [selectedHospitalId]);

  // Persist location
  useEffect(() => {
    if (userLocation) {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(userLocation));
    }
  }, [userLocation]);

  // Compute distances for all hospitals based on current user coordinates
  const hospitalsWithDistance = useMemo(() => {
    const enriched = HOSPITALS_INDIA.map((hosp) => {
      let distanceKm = null;
      if (userLocation?.lat && userLocation?.lng) {
        distanceKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          hosp.lat,
          hosp.lng
        );
      }
      return {
        ...hosp,
        distanceKm,
      };
    });

    // If user location is known, sort by closest distance first; else sort by rating
    return enriched.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return b.rating - a.rating;
    });
  }, [userLocation]);

  // Select hospital handler
  const selectHospital = useCallback((hospitalOrId) => {
    const id = typeof hospitalOrId === 'string' ? hospitalOrId : hospitalOrId?.id;
    const target = HOSPITALS_INDIA.find((h) => h.id === id);
    if (target) {
      setSelectedHospitalId(target.id);
      toast.success(`Facility switched to ${target.name} (${target.city})`, {
        icon: '🏥',
        style: { background: '#0d2044', color: '#fff', border: '1px solid #00e5ff33' },
      });
      return target;
    }
    return null;
  }, []);

  // Browser GPS Geolocation detector
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return Promise.reject(new Error('Geolocation not supported'));
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locObj = {
            lat: latitude,
            lng: longitude,
            source: 'gps',
            timestamp: Date.now(),
          };
          setUserLocation(locObj);
          setIsLocating(false);

          // Find closest hospital
          let closest = null;
          let minDistance = Infinity;

          HOSPITALS_INDIA.forEach((h) => {
            const dist = calculateDistanceKm(latitude, longitude, h.lat, h.lng);
            if (dist !== null && dist < minDistance) {
              minDistance = dist;
              closest = h;
            }
          });

          if (closest) {
            toast.success(
              `📍 Nearest hospital detected: ${closest.name} (${minDistance} km away)`,
              {
                duration: 5000,
                icon: '📍',
                style: { background: '#0d2044', color: '#fff', border: '1px solid #00e5ff33' },
              }
            );
          }

          resolve({ location: locObj, closestHospital: closest, distanceKm: minDistance });
        },
        (err) => {
          setIsLocating(false);
          setLocationError(err.message);
          // Fallback to Bengaluru Dayananda Sagar as default
          toast('Could not access GPS. You can search by City or Pincode.', {
            icon: 'ℹ️',
          });
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  // Set location manually by city/pincode search
  const setManualLocation = useCallback((cityOrPincode) => {
    const q = cityOrPincode.trim().toLowerCase();
    const match = HOSPITALS_INDIA.find(
      (h) =>
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.pincode.includes(q)
    );

    if (match) {
      const locObj = {
        lat: match.lat,
        lng: match.lng,
        city: match.city,
        state: match.state,
        source: 'manual',
        timestamp: Date.now(),
      };
      setUserLocation(locObj);
      toast.success(`Location set to ${match.city}, ${match.state}`);
      return match;
    } else {
      toast.error('Location not found in directory. Showing top rated hospitals.');
      return null;
    }
  }, []);

  return (
    <HospitalContext.Provider
      value={{
        selectedHospital,
        selectedHospitalId,
        allHospitals: HOSPITALS_INDIA,
        hospitalsWithDistance,
        userLocation,
        isLocating,
        locationError,
        selectHospital,
        detectLocation,
        setManualLocation,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
