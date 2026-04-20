package com.vehiclerental.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.vehiclerental.model.Customer;
import com.vehiclerental.model.Vehicle;
import com.vehiclerental.repository.CustomerRepository;
import com.vehiclerental.repository.VehicleRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    public DataInitializer(VehicleRepository vehicleRepository, CustomerRepository customerRepository) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public void run(String... args) {
        if (vehicleRepository.count() == 0) {
            Vehicle swift = new Vehicle();
            swift.setId(1);
            swift.setName("Swift");
            swift.setPrice_per_day(2000);
            swift.setAvailable(true);

            Vehicle thar = new Vehicle();
            thar.setId(2);
            thar.setName("Thar");
            thar.setPrice_per_day(4500);
            thar.setAvailable(true);

            Vehicle creta = new Vehicle();
            creta.setId(3);
            creta.setName("Creta");
            creta.setPrice_per_day(3500);
            creta.setAvailable(true);

            vehicleRepository.save(swift);
            vehicleRepository.save(thar);
            vehicleRepository.save(creta);
        }

        if (customerRepository.count() == 0) {
            Customer ayush = new Customer();
            ayush.setId(1);
            ayush.setName("Ayush");

            Customer rahul = new Customer();
            rahul.setId(2);
            rahul.setName("Rahul");

            customerRepository.save(ayush);
            customerRepository.save(rahul);
        }
    }
}