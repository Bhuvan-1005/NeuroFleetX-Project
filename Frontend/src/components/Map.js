import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom vehicle icon with status colors
const createVehicleIcon = (status = "active", speed = 0) => {
  const colors = {
    active: "#4CAF50",
    maintenance: "#FF9800",
    inactive: "#9E9E9E",
  };
  const color = colors[status] || colors.active;
  const isMoving = speed > 5;

  return new L.DivIcon({
    className: "custom-vehicle-marker",
    html: `<div style="
      position: relative;
      font-size: 32px;
      text-align: center;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    ">
      🚗
      <div style="
        position: absolute;
        bottom: -8px;
        right: -8px;
        width: 12px;
        height: 12px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 ${isMoving ? "8px" : "4px"} ${color};
        ${isMoving ? "animation: pulse 1.5s infinite;" : ""}
      "></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Custom driver icon
const createDriverIcon = (status = "active") => {
  const colors = {
    active: "#2196F3",
    "on-break": "#FF9800",
    inactive: "#9E9E9E",
  };
  const color = colors[status] || colors.active;

  return new L.DivIcon({
    className: "custom-driver-marker",
    html: `<div style="
      position: relative;
      font-size: 28px;
      text-align: center;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    ">
      👤
      <div style="
        position: absolute;
        bottom: -6px;
        right: -6px;
        width: 10px;
        height: 10px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 4px ${color};
      "></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Custom user location icon - Google Maps style blue dot with pulse
const userLocationIcon = new L.DivIcon({
  className: "custom-location-marker",
  html: `
    <div class="location-marker-container">
      <div class="location-pulse"></div>
      <div class="location-pulse-ring"></div>
      <div class="location-dot"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Component to recenter map when user location is found
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

// Map tile styles
const tileStyles = {
  standard: {
    name: "🗺️ Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  dark: {
    name: "🌙 Dark Mode",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  light: {
    name: "☀️ Light Mode",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    name: "🛰️ Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  terrain: {
    name: "⛰️ Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap",
  },
};

// Default center - Chennai, Tamil Nadu, India
const defaultCenter = {
  lat: 13.0827, // Chennai latitude
  lng: 80.2707, // Chennai longitude
};

const FleetMap = ({ vehicles = [], drivers = [], telemetryRecords = [] }) => {
  const [selectedStyle, setSelectedStyle] = useState("standard");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDrivers, setShowDrivers] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mapContainerRef = useRef(null);

  // Get user's current location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Auto-refresh location every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // In production, this would fetch new telemetry data
        console.log("Auto-refreshing vehicle locations...");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get vehicle locations from telemetry data or use real/demo data
  const vehicleLocations =
    telemetryRecords && telemetryRecords.length > 0
      ? telemetryRecords
          .filter((t) => t.latitude && t.longitude)
          .map((t) => {
            const vehicle = vehicles.find((v) => v.id === t.vehicleId);
            const driver = drivers.find((d) => d.id === t.driverId);

            return {
              id: t.id,
              position: [parseFloat(t.latitude), parseFloat(t.longitude)],
              vehicleInfo: vehicle,
              driverInfo: driver,
              speed: t.speed,
              recordedAt: t.recordedAt,
            };
          })
      : vehicles.map((vehicle, index) => {
          // Use real coordinates if driver updated them, otherwise use demo data
          let lat, lng;
          if (vehicle.latitude && vehicle.longitude) {
            // Use real coordinates from vehicle data
            lat = parseFloat(vehicle.latitude);
            lng = parseFloat(vehicle.longitude);
          } else {
            // Demo data: Place vehicles randomly around Chennai
            const offsetLat = (Math.random() - 0.5) * 0.1;
            const offsetLng = (Math.random() - 0.5) * 0.1;
            lat = defaultCenter.lat + offsetLat;
            lng = defaultCenter.lng + offsetLng;
          }

          return {
            id: vehicle.id || `vehicle-${index}`,
            position: [lat, lng],
            vehicleInfo: vehicle,
            driverInfo: drivers[index] || null,
            speed: Math.floor(Math.random() * 80) + 20,
            recordedAt: new Date().toISOString(),
          };
        });

  // Get driver locations (use real coordinates when available)
  const driverLocations = drivers.map((driver, index) => {
    let lat, lng;
    if (driver.latitude && driver.longitude) {
      // Use real coordinates updated by driver
      lat = parseFloat(driver.latitude);
      lng = parseFloat(driver.longitude);
    } else {
      // Demo data: Place drivers randomly around Chennai
      const offsetLat = (Math.random() - 0.5) * 0.08;
      const offsetLng = (Math.random() - 0.5) * 0.08;
      lat = defaultCenter.lat + offsetLat;
      lng = defaultCenter.lng + offsetLng;
    }

    return {
      id: driver.id || `driver-${index}`,
      position: [lat, lng],
      driverInfo: driver,
    };
  });

  // Filter locations based on search
  const filteredVehicleLocations = vehicleLocations.filter((loc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      loc.vehicleInfo?.model?.toLowerCase().includes(query) ||
      loc.vehicleInfo?.vin?.toLowerCase().includes(query) ||
      loc.driverInfo?.name?.toLowerCase().includes(query)
    );
  });

  // Determine map center
  const mapCenter =
    vehicleLocations.length > 0
      ? vehicleLocations[0].position
      : [defaultCenter.lat, defaultCenter.lng];

  const currentStyle = tileStyles[selectedStyle];

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Map Controls Panel */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          maxWidth: "300px",
        }}
      >
        {/* Search Bar */}
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search vehicles, drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          {searchQuery && (
            <small style={{ color: "#666", fontSize: "12px" }}>
              Showing {filteredVehicleLocations.length} of{" "}
              {vehicleLocations.length} vehicles
            </small>
          )}
        </div>

        {/* Toggle Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={showVehicles}
              onChange={(e) => setShowVehicles(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            🚗 Show Vehicles ({vehicleLocations.length})
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={showDrivers}
              onChange={(e) => setShowDrivers(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            👤 Show Drivers ({driverLocations.length})
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              disabled={!selectedVehicle}
              style={{ marginRight: "8px" }}
            />
            🗺️ Show Route {selectedVehicle ? "(to selected)" : ""}
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            🔄 Auto-refresh (30s)
          </label>
        </div>

        {selectedVehicle && (
          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              backgroundColor: "#e3f2fd",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <strong>Selected:</strong>{" "}
            {selectedVehicle.vehicleInfo?.model || "Vehicle"}
            <button
              onClick={() => setSelectedVehicle(null)}
              style={{
                marginLeft: "10px",
                padding: "2px 6px",
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Map Style Switcher */}
      <div className="map-style-switcher">
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="map-style-select"
          title="Change map style"
        >
          {Object.entries(tileStyles).map(([key, style]) => (
            <option key={key} value={key}>
              {style.name}
            </option>
          ))}
        </select>
      </div>

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullScreen}
        style={{
          position: "absolute",
          top: "60px",
          right: "10px",
          zIndex: 1000,
          backgroundColor: "white",
          border: "2px solid rgba(0,0,0,0.2)",
          borderRadius: "4px",
          padding: "8px",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
        title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullScreen ? "⛶" : "⛶"}
      </button>

      {/* Get My Location Button - Google Maps Style */}
      <button
        onClick={getUserLocation}
        disabled={isLoadingLocation}
        className="google-location-button"
        title="Get my location"
        aria-label="Get my location"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={
            isLoadingLocation ? "location-icon-loading" : "location-icon"
          }
        >
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </button>

      {/* Location Error Message */}
      {locationError && (
        <div
          style={{
            position: "absolute",
            top: "110px",
            right: "10px",
            zIndex: 1000,
            backgroundColor: "rgba(244, 67, 54, 0.95)",
            color: "white",
            padding: "10px 15px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            maxWidth: "250px",
            fontSize: "13px",
          }}
        >
          <strong>⚠️ Error:</strong>
          <br />
          {locationError}
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        {/* Recenter map when user location is found */}
        {userLocation && (
          <RecenterMap center={[userLocation.lat, userLocation.lng]} />
        )}

        {/* Dynamic Tile Layer based on selected style */}
        <TileLayer
          key={selectedStyle}
          attribution={currentStyle.attribution}
          url={currentStyle.url}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div
                style={{ minWidth: "200px", fontFamily: "Arial, sans-serif" }}
              >
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "#1a1a1a",
                    fontSize: "16px",
                    borderBottom: "2px solid #2196F3",
                    paddingBottom: "5px",
                  }}
                >
                  📍 Your Location
                </h3>
                <div style={{ fontSize: "13px", color: "#333" }}>
                  <p style={{ margin: "8px 0" }}>
                    <strong style={{ color: "#555" }}>Latitude:</strong>{" "}
                    {userLocation.lat.toFixed(6)}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong style={{ color: "#555" }}>Longitude:</strong>{" "}
                    {userLocation.lng.toFixed(6)}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong style={{ color: "#555" }}>Accuracy:</strong> ±
                    {Math.round(userLocation.accuracy)}m
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "11px",
                      color: "#666",
                      paddingTop: "8px",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    This is your current location
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vehicle Markers */}
        {showVehicles &&
          filteredVehicleLocations.map((location) => (
            <Marker
              key={location.id}
              position={location.position}
              icon={createVehicleIcon(
                location.vehicleInfo?.status || "active",
                location.speed || 0
              )}
              eventHandlers={{
                click: () => setSelectedVehicle(location),
              }}
            >
              <Popup>
                <div
                  style={{ minWidth: "200px", fontFamily: "Arial, sans-serif" }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "#1a1a1a",
                      fontSize: "16px",
                      borderBottom: "2px solid #4CAF50",
                      paddingBottom: "5px",
                    }}
                  >
                    🚗 Vehicle Information
                  </h3>
                  <div style={{ fontSize: "13px", color: "#333" }}>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>Vehicle:</strong>{" "}
                      {location.vehicleInfo?.model || "Unknown"}
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>VIN:</strong>{" "}
                      {location.vehicleInfo?.vin || "N/A"}
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>Driver:</strong>{" "}
                      {location.driverInfo?.name || "Unknown"}
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>Speed:</strong>{" "}
                      <span style={{ color: "#2196F3", fontWeight: "bold" }}>
                        {location.speed || 0} km/h
                      </span>
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>Status:</strong>
                      <span
                        style={{
                          color:
                            location.vehicleInfo?.status === "active"
                              ? "#4CAF50"
                              : "#FF9800",
                          fontWeight: "bold",
                          marginLeft: "5px",
                        }}
                      >
                        {location.vehicleInfo?.status || "Active"}
                      </span>
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "11px",
                        color: "#666",
                        paddingTop: "8px",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <strong>Last updated:</strong>
                      <br />
                      {location.recordedAt
                        ? new Date(location.recordedAt).toLocaleString()
                        : "N/A"}
                    </p>
                    {userLocation && (
                      <p
                        style={{
                          margin: "8px 0 0 0",
                          fontSize: "11px",
                          color: "#2196F3",
                        }}
                      >
                        <strong>Distance from you:</strong>{" "}
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          location.position[0],
                          location.position[1]
                        ).toFixed(2)}{" "}
                        km
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Driver Markers */}
        {showDrivers &&
          driverLocations.map((location) => (
            <Marker
              key={location.id}
              position={location.position}
              icon={createDriverIcon(location.driverInfo?.status || "active")}
            >
              <Popup>
                <div
                  style={{ minWidth: "200px", fontFamily: "Arial, sans-serif" }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "#1a1a1a",
                      fontSize: "16px",
                      borderBottom: "2px solid #2196F3",
                      paddingBottom: "5px",
                    }}
                  >
                    👤 Driver Information
                  </h3>
                  <div style={{ fontSize: "13px", color: "#333" }}>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>Name:</strong>{" "}
                      {location.driverInfo?.name || "Unknown"}
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>License:</strong>{" "}
                      {location.driverInfo?.licenseNumber || "N/A"}
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>Status:</strong>
                      <span
                        style={{
                          color:
                            location.driverInfo?.status === "active"
                              ? "#4CAF50"
                              : "#FF9800",
                          fontWeight: "bold",
                          marginLeft: "5px",
                        }}
                      >
                        {location.driverInfo?.status || "Active"}
                      </span>
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <strong style={{ color: "#555" }}>Rating:</strong>{" "}
                      <span style={{ color: "#FF9800" }}>
                        {location.driverInfo?.rating || "N/A"} ⭐
                      </span>
                    </p>
                    {userLocation && (
                      <p
                        style={{
                          margin: "8px 0 0 0",
                          fontSize: "11px",
                          color: "#2196F3",
                        }}
                      >
                        <strong>Distance from you:</strong>{" "}
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          location.position[0],
                          location.position[1]
                        ).toFixed(2)}{" "}
                        km
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Route line from user to selected vehicle */}
        {showRoutes && selectedVehicle && userLocation && (
          <Polyline
            positions={[
              [userLocation.lat, userLocation.lng],
              selectedVehicle.position,
            ]}
            color="#2196F3"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default FleetMap;
