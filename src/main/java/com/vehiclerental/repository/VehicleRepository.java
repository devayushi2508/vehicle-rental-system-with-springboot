package com.vehiclerental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.vehiclerental.model.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
}