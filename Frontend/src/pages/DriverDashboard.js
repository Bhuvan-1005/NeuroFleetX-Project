import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LocationTracker from "../components/LocationTracker";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { vehiclesAPI } from "../services/api";

const DriverDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [tripStatus, setTripStatus] = useState("idle"); // idle, active, break
  const [tripStartTime, setTripStartTime] = useState(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    // Get driver information from localStorage or API
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setDriverInfo(userData);
        // Load selected vehicle from localStorage
        const savedVehicle = localStorage.getItem("selectedVehicle");
        if (savedVehicle) {
          setSelectedVehicle(JSON.parse(savedVehicle));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    // Fetch available vehicles
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await vehiclesAPI.getAll();
      console.log("Vehicles response:", response);
      // Backend returns { success: true, data: [...vehicles] }
      const vehiclesList = response.data?.data || response.data || [];
      console.log("Vehicles list:", vehiclesList);
      setVehicles(vehiclesList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]); // Set empty array on error
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem("selectedVehicle", JSON.stringify(vehicle));
    setShowVehicleSelector(false);
  };

  const handleStartTrip = () => {
    if (!selectedVehicle) {
      alert("Please select a vehicle first!");
      setShowVehicleSelector(true);
      return;
    }
    setTripStatus("active");
    setTripStartTime(new Date());
    setTrackingEnabled(true);
  };

  const handleEndTrip = () => {
    setTripStatus("idle");
    setTripStartTime(null);
    setTrackingEnabled(false);
  };

  const handleTakeBreak = () => {
    setTripStatus("break");
  };

  const handleResumeTrip = () => {
    setTripStatus("active");
  };

  const handleLogout = () => {
    logout();
    navigate("/driver-login");
  };

  const getTripDuration = () => {
    if (!tripStartTime) return "0h 0m";
    const now = new Date();
    const diff = now - tripStartTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="landing-page bg-slate-950 min-h-screen">
      <Particles />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text mb-2">
              Driver Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome, {currentUser?.name || driverInfo?.name || "Driver"}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* GPS Tracking Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardSpotlight className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">📍</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      GPS Tracking
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Real-time location sharing
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackingEnabled}
                      onChange={(e) => setTrackingEnabled(e.target.checked)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="text-slate-300">
                      {trackingEnabled
                        ? "Tracking Enabled"
                        : "Enable GPS Tracking"}
                    </span>
                  </label>
                </div>

                <div className="text-sm text-slate-400 space-y-2">
                  <p>✓ Auto-updates every 30 seconds</p>
                  <p>✓ High accuracy GPS</p>
                  <p>✓ Speed monitoring</p>
                  <p>✓ Fleet manager can see your location</p>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Vehicle Selection Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardSpotlight className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">�</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Vehicle Selection
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Choose your vehicle
                    </p>
                  </div>
                </div>

                {selectedVehicle ? (
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400">
                        Selected Vehicle
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedVehicle.model}
                      </div>
                      <div className="text-sm text-slate-300">
                        VIN: {selectedVehicle.vin}
                      </div>
                      <div className="text-sm mt-1">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            selectedVehicle.status === "available"
                              ? "bg-green-600"
                              : selectedVehicle.status === "in_use"
                              ? "bg-blue-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {selectedVehicle.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        fetchVehicles(); // Refresh vehicles list
                        setShowVehicleSelector(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      Change Vehicle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-4 text-slate-400 text-sm">
                      No vehicle selected
                    </div>
                    <button
                      onClick={() => {
                        fetchVehicles(); // Refresh vehicles list
                        setShowVehicleSelector(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg transition-all"
                    >
                      Select a Vehicle
                    </button>
                  </div>
                )}
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Trip Control Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardSpotlight className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">⚡</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Trip Control
                    </h3>
                    <p className="text-slate-400 text-sm">Manage your trip</p>
                  </div>
                </div>

                <div className="mb-4 bg-slate-800/50 p-3 rounded-lg">
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>Status:</span>
                    <span
                      className={`font-semibold ${
                        tripStatus === "active"
                          ? "text-green-400"
                          : tripStatus === "break"
                          ? "text-orange-400"
                          : "text-slate-400"
                      }`}
                    >
                      {tripStatus === "active"
                        ? "🚦 Active"
                        : tripStatus === "break"
                        ? "☕ On Break"
                        : "⏸️ Idle"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-sm mt-2">
                    <span>Duration:</span>
                    <span className="font-semibold">{getTripDuration()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {tripStatus === "idle" && (
                    <button
                      onClick={handleStartTrip}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                    >
                      🚦 Start Trip
                    </button>
                  )}

                  {tripStatus === "active" && (
                    <>
                      <button
                        onClick={handleTakeBreak}
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                      >
                        ☕ Take Break
                      </button>
                      <button
                        onClick={handleEndTrip}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                      >
                        🛑 End Trip
                      </button>
                    </>
                  )}

                  {tripStatus === "break" && (
                    <>
                      <button
                        onClick={handleResumeTrip}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                      >
                        ▶️ Resume Trip
                      </button>
                      <button
                        onClick={handleEndTrip}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                      >
                        🛑 End Trip
                      </button>
                    </>
                  )}
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <CardSpotlight>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📱 How GPS Tracking Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
                <div>
                  <div className="text-3xl mb-2">1️⃣</div>
                  <h4 className="font-semibold text-white mb-2">
                    Enable Tracking
                  </h4>
                  <p className="text-sm text-slate-400">
                    Turn on GPS tracking to start sharing your location with the
                    fleet manager.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">2️⃣</div>
                  <h4 className="font-semibold text-white mb-2">
                    Auto Updates
                  </h4>
                  <p className="text-sm text-slate-400">
                    Your location is automatically sent every 30 seconds while
                    tracking is enabled.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">3️⃣</div>
                  <h4 className="font-semibold text-white mb-2">
                    Real-time Monitoring
                  </h4>
                  <p className="text-sm text-slate-400">
                    Fleet managers can see your position, speed, and route on
                    their dashboard map.
                  </p>
                </div>
              </div>
            </div>
          </CardSpotlight>
        </motion.div>
      </div>

      {/* Vehicle Selector Modal */}
      {showVehicleSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Select a Vehicle
              </h2>
              <button
                onClick={() => setShowVehicleSelector(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingVehicles ? (
                <div className="col-span-2 text-center py-8">
                  <div className="text-4xl mb-3">🔄</div>
                  <div className="text-slate-400">Loading vehicles...</div>
                </div>
              ) : vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id || vehicle._id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedVehicle?.id === vehicle.id ||
                      selectedVehicle?._id === vehicle._id
                        ? "border-purple-500 bg-purple-900/20"
                        : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">🚗</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {vehicle.model || "Unknown Model"}
                        </h3>
                        <p className="text-sm text-slate-400">
                          VIN: {vehicle.vin || "N/A"}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              vehicle.status === "available"
                                ? "bg-green-600 text-white"
                                : vehicle.status === "in_use"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-600 text-white"
                            }`}
                          >
                            {vehicle.status || "unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-400">
                  <div className="text-4xl mb-3">🚫</div>
                  <div className="text-lg mb-2">No vehicles available</div>
                  <div className="text-sm">
                    Please contact your fleet manager to add vehicles.
                  </div>
                  <button
                    onClick={fetchVehicles}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    🔄 Refresh
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Location Tracker Component */}
      {trackingEnabled && driverInfo && selectedVehicle && (
        <LocationTracker
          driverId={driverInfo.id || driverInfo._id || "demo-driver"}
          vehicleId={
            selectedVehicle.id || selectedVehicle._id || "demo-vehicle"
          }
          updateInterval={30000} // 30 seconds
          enabled={trackingEnabled}
        />
      )}
    </div>
  );
};

export default DriverDashboard;
