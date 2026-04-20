package com.vehiclerental.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.vehiclerental.dto.CreateRentalRequest;
import com.vehiclerental.exception.BusinessException;
import com.vehiclerental.exception.NotFoundException;
import com.vehiclerental.model.Customer;
import com.vehiclerental.model.Rental;
import com.vehiclerental.model.Vehicle;
import com.vehiclerental.repository.CustomerRepository;
import com.vehiclerental.repository.RentalRepository;
import com.vehiclerental.repository.VehicleRepository;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    public RentalService(
            RentalRepository rentalRepository,
            VehicleRepository vehicleRepository,
            CustomerRepository customerRepository) {
        this.rentalRepository = rentalRepository;
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
    }

    public Rental createRental(CreateRentalRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new NotFoundException("Customer not found with id: " + request.getCustomerId()));

        if (!vehicle.isAvailable()) {
            throw new BusinessException("Vehicle is not available for rent");
        }

        Rental rental = new Rental();
        rental.setRentalId(nextRentalId());
        rental.setVehicleId(vehicle.getId());
        rental.setCustomerId(customer.getId());
        rental.setDays(request.getDays());
        rental.setTotalCost(vehicle.getPrice_per_day() * request.getDays());
        rental.setReturned(false);
        rental.setCreatedAt(LocalDateTime.now());

        vehicle.setAvailable(false);
        vehicleRepository.save(vehicle);

        return rentalRepository.save(rental);
    }

    public Rental returnRental(int rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new NotFoundException("Rental not found with id: " + rentalId));

        if (rental.isReturned()) {
            throw new BusinessException("Rental is already returned");
        }

        Vehicle vehicle = vehicleRepository.findById(rental.getVehicleId())
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + rental.getVehicleId()));

        rental.setReturned(true);
        vehicle.setAvailable(true);

        vehicleRepository.save(vehicle);
        return rentalRepository.save(rental);
    }

    private int nextRentalId() {
        Optional<Rental> latestRental = rentalRepository.findTopByOrderByRentalIdDesc();
        return latestRental.map(Rental::getRentalId).orElse(0) + 1;
    }
}
