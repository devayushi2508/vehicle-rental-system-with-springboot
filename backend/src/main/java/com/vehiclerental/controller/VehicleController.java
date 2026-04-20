package com.vehiclerental.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.vehiclerental.dto.CreateVehicleRequest;
import com.vehiclerental.model.Vehicle;
import com.vehiclerental.service.VehicleService;

import jakarta.validation.Valid;

@RestController
@Validated
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping("/")
    public String home() {
        return "Vehicle Rental System Running";
    }

    @GetMapping("/vehicles")
    public List<Vehicle> getVehicles() {
        return vehicleService.getAllVehicles();
    }

    @PostMapping("/vehicles")
    public Vehicle createVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setName(request.getName());
        vehicle.setPrice_per_day(request.getPricePerDay());
        vehicle.setAvailable(request.isAvailable());
        vehicle.setImageUrl(request.getImageUrl());
        return vehicleService.createVehicle(vehicle);
    }
}