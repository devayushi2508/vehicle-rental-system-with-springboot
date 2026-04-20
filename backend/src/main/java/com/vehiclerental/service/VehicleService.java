package com.vehiclerental.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.vehiclerental.exception.NotFoundException;
import com.vehiclerental.model.Vehicle;
import com.vehiclerental.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        vehicle.setId(nextVehicleId());
        return vehicleRepository.save(vehicle);
    }

    public Vehicle getVehicleById(int id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));
    }

    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    private int nextVehicleId() {
        Optional<Vehicle> latestVehicle = vehicleRepository.findTopByOrderByIdDesc();
        return latestVehicle.map(Vehicle::getId).orElse(0) + 1;
    }
}
