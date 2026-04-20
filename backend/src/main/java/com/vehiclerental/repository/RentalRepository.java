package com.vehiclerental.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.vehiclerental.model.Rental;

public interface RentalRepository extends MongoRepository<Rental, Integer> {

	Optional<Rental> findTopByOrderByRentalIdDesc();
}
