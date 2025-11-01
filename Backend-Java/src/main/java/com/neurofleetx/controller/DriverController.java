package com.neurofleetx.controller;

import com.neurofleetx.entity.Driver;
import com.neurofleetx.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriverController {
    
    @Autowired
    private DriverService driverService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", drivers);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDriverById(@PathVariable String id) {
        return driverService.getDriverById(id)
                .map(driver -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", driver);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createDriver(@RequestBody Driver driver) {
        Driver savedDriver = driverService.createDriver(driver);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", savedDriver);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDriver(@PathVariable String id, @RequestBody Driver driver) {
        Driver updatedDriver = driverService.updateDriver(id, driver);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updatedDriver);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDriver(@PathVariable String id) {
        driverService.deleteDriver(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Driver deleted");
        return ResponseEntity.ok(response);
    }
}
