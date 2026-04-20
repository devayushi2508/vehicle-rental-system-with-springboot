package com.vehiclerental.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.vehiclerental.model.Vehicle;

public interface VehicleRepository extends MongoRepository<Vehicle, Integer> {

	Optional<Vehicle> findTopByOrderByIdDesc();
}