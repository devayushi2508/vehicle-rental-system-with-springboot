package com.vehiclerental.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.vehiclerental.model.Customer;

public interface CustomerRepository extends MongoRepository<Customer, Integer> {

	Optional<Customer> findTopByOrderByIdDesc();
}
