package com.neurofleetx.repository;

import com.neurofleetx.entity.Driver;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends MongoRepository<Driver, String> {
}
