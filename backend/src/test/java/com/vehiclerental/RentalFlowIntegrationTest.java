package com.vehiclerental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.vehiclerental.dto.CreateRentalRequest;
import com.vehiclerental.exception.BusinessException;
import com.vehiclerental.model.Customer;
import com.vehiclerental.model.Rental;
import com.vehiclerental.model.Vehicle;
import com.vehiclerental.repository.CustomerRepository;
import com.vehiclerental.repository.RentalRepository;
import com.vehiclerental.repository.VehicleRepository;
import com.vehiclerental.service.RentalService;

@SpringBootTest
@ActiveProfiles("test")
class RentalFlowIntegrationTest extends MongoTestSupport {

        @Autowired
        private VehicleRepository vehicleRepository;

        @Autowired
        private CustomerRepository customerRepository;

        @Autowired
        private RentalRepository rentalRepository;

        @Autowired
        private RentalService rentalService;

        @BeforeEach
        void setup() {
                rentalRepository.deleteAll();
                customerRepository.deleteAll();
                vehicleRepository.deleteAll();

                Vehicle vehicle = new Vehicle();
                vehicle.setId(1);
                vehicle.setName("Creta");
                vehicle.setPrice_per_day(3000);
                vehicle.setAvailable(true);
                vehicleRepository.save(vehicle);

                Customer customer = new Customer();
                customer.setId(1);
                customer.setName("Ayush");
                customerRepository.save(customer);
        }

        @Test
        void shouldCreateRentalCalculateCostAndMarkVehicleUnavailable() {
                CreateRentalRequest request = new CreateRentalRequest();
                request.setVehicleId(1);
                request.setCustomerId(1);
                request.setDays(3);

                Rental rental = rentalService.createRental(request);
                Vehicle vehicle = vehicleRepository.findById(1).orElseThrow();

                assertThat(rental.getTotalCost()).isEqualTo(9000.0);
                assertThat(rental.isReturned()).isFalse();
                assertThat(vehicle.isAvailable()).isFalse();
        }

        @Test
        void shouldReturnRentalAndMarkVehicleAvailable() {
                CreateRentalRequest request = new CreateRentalRequest();
                request.setVehicleId(1);
                request.setCustomerId(1);
                request.setDays(2);

                Rental rental = rentalService.createRental(request);
                Rental returned = rentalService.returnRental(rental.getRentalId());
                Vehicle vehicle = vehicleRepository.findById(1).orElseThrow();

                assertThat(returned.isReturned()).isTrue();
                assertThat(vehicle.isAvailable()).isTrue();
        }

        @Test
        void shouldRejectReturningAlreadyReturnedRental() {
                CreateRentalRequest request = new CreateRentalRequest();
                request.setVehicleId(1);
                request.setCustomerId(1);
                request.setDays(1);

                Rental rental = rentalService.createRental(request);
                rentalService.returnRental(rental.getRentalId());

                assertThatThrownBy(() -> rentalService.returnRental(rental.getRentalId()))
                                .isInstanceOf(BusinessException.class)
                                .hasMessage("Rental is already returned");
        }
}
