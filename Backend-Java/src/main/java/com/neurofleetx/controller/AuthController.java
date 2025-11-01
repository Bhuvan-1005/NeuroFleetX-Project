package com.neurofleetx.controller;

import com.neurofleetx.entity.User;
import com.neurofleetx.entity.Driver;
import com.neurofleetx.service.UserService;
import com.neurofleetx.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private DriverService driverService;
    
    // Fleet Manager Signup
    @PostMapping("/fleet-manager/signup")
    public ResponseEntity<Map<String, Object>> fleetManagerSignup(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            user.setRole("fleet_manager");
            User savedUser = userService.createUser(user);
            
            // Remove password from response
            savedUser.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Fleet manager registered successfully");
            response.put("user", savedUser);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Driver Signup
    @PostMapping("/driver/signup")
    public ResponseEntity<Map<String, Object>> driverSignup(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Driver signup request received: " + user.getEmail());
            
            // Set role to driver
            user.setRole("driver");
            
            // Create User entity for authentication
            User savedUser = userService.createUser(user);
            System.out.println("User created successfully with ID: " + savedUser.getId());
            
            // Also create a Driver entity so it appears in fleet manager dashboard
            Driver driver = new Driver();
            driver.setName(user.getName());
            driver.setEmail(user.getEmail());
            driver.setPhone(user.getPhone());
            driver.setLicenseNumber(user.getLicenseNumber());
            
            System.out.println("Creating driver entity: " + driver.getName());
            Driver savedDriver = driverService.createDriver(driver);
            System.out.println("Driver created successfully with ID: " + savedDriver.getId());
            
            // Remove password from response
            savedUser.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Driver registered successfully");
            response.put("user", savedUser);
            response.put("driver", savedDriver);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Driver signup error: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Fleet Manager Login
    @PostMapping("/fleet-manager/login")
    public ResponseEntity<Map<String, Object>> fleetManagerLogin(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        
        String email = loginData.get("email");
        String password = loginData.get("password");
        
        User user = userService.authenticate(email, password);
        
        if (user != null && "fleet_manager".equals(user.getRole())) {
            // Remove password from response
            user.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", user);
            response.put("token", "dummy-token-" + user.getId()); // Simple token for demo
            
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid credentials or not a fleet manager");
            return ResponseEntity.status(401).body(response);
        }
    }
    
    // Driver Login
    @PostMapping("/driver/login")
    public ResponseEntity<Map<String, Object>> driverLogin(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        
        String email = loginData.get("email");
        String password = loginData.get("password");
        
        User user = userService.authenticate(email, password);
        
        if (user != null && "driver".equals(user.getRole())) {
            // Remove password from response
            user.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", user);
            response.put("token", "dummy-token-" + user.getId()); // Simple token for demo
            
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid credentials or not a driver");
            return ResponseEntity.status(401).body(response);
        }
    }
    
    // Get all fleet managers
    @GetMapping("/fleet-managers")
    public ResponseEntity<Map<String, Object>> getAllFleetManagers() {
        List<User> fleetManagers = userService.getUsersByRole("fleet_manager");
        
        // Remove passwords from response
        fleetManagers.forEach(user -> user.setPassword(null));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", fleetManagers);
        
        return ResponseEntity.ok(response);
    }
    
    // Get all drivers
    @GetMapping("/drivers")
    public ResponseEntity<Map<String, Object>> getAllDrivers() {
        List<User> drivers = userService.getUsersByRole("driver");
        
        // Remove passwords from response
        drivers.forEach(user -> user.setPassword(null));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", drivers);
        
        return ResponseEntity.ok(response);
    }
    
    // Change Password
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> passwordData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = passwordData.get("email");
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            // Validate input
            if (email == null || email.isEmpty() || 
                currentPassword == null || currentPassword.isEmpty() || 
                newPassword == null || newPassword.isEmpty()) {
                response.put("success", false);
                response.put("message", "Email, current password, and new password are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Validate new password length
            if (newPassword.length() < 8) {
                response.put("success", false);
                response.put("message", "New password must be at least 8 characters long");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Change password
            boolean success = userService.changePassword(email, currentPassword, newPassword);
            
            if (success) {
                response.put("success", true);
                response.put("message", "Password changed successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Current password is incorrect");
                return ResponseEntity.status(401).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
