package com.vehiclerental.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vehiclerental.dto.CreateRentalRequest;
import com.vehiclerental.model.Rental;
import com.vehiclerental.repository.RentalRepository;
import com.vehiclerental.service.RentalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/rentals")
@Validated
public class RentalController {

    private final RentalService rentalService;
    private final RentalRepository rentalRepository;

    public RentalController(RentalService rentalService, RentalRepository rentalRepository) {
        this.rentalService = rentalService;
        this.rentalRepository = rentalRepository;
    }

    @GetMapping
    public List<Rental> getRentals() {
        return rentalRepository.findAll();
    }

    @PostMapping
    public Rental createRental(@Valid @RequestBody CreateRentalRequest request) {
        return rentalService.createRental(request);
    }

    @PostMapping("/{rentalId}/return")
    public Rental returnRental(@PathVariable int rentalId) {
        return rentalService.returnRental(rentalId);
    }
}
