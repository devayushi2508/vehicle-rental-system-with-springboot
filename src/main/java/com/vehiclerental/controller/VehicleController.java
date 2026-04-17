package com.vehiclerental.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vehiclerental.model.Vehicle;
import com.vehiclerental.repository.VehicleRepository;

@RestController
public class VehicleController {

    @Autowired
    VehicleRepository repo;

    @GetMapping("/")
    public String home() {
        return "Vehicle Rental System Running";
    }

    @GetMapping("/vehicles")
    public List<Vehicle> getVehicles() {
        return repo.findAll();
    }
}