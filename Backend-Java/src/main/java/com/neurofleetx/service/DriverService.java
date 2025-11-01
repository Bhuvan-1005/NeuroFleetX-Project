package com.neurofleetx.service;

import com.neurofleetx.entity.Driver;
import com.neurofleetx.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DriverService {
    
    @Autowired
    private DriverRepository driverRepository;
    
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }
    
    public Optional<Driver> getDriverById(String id) {
        return driverRepository.findById(id);
    }
    
    public Driver createDriver(Driver driver) {
        return driverRepository.save(driver);
    }
    
    public Driver updateDriver(String id, Driver driverDetails) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
        
        driver.setName(driverDetails.getName());
        driver.setLicenseNumber(driverDetails.getLicenseNumber());
        driver.setPhone(driverDetails.getPhone());
    // update newly added fields if present
    driver.setEmail(driverDetails.getEmail());
    driver.setLatitude(driverDetails.getLatitude());
    driver.setLongitude(driverDetails.getLongitude());
        
        return driverRepository.save(driver);
    }
    
    public void deleteDriver(String id) {
        driverRepository.deleteById(id);
    }
}
