package com.vehiclerental;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.vehiclerental.model.Vehicle;
import com.vehiclerental.repository.VehicleRepository;
import com.vehiclerental.service.VehicleService;

@SpringBootTest
@ActiveProfiles("test")
class VehicleControllerIntegrationTest extends MongoTestSupport {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleService vehicleService;

    @BeforeEach
    void setup() {
        vehicleRepository.deleteAll();

        Vehicle v1 = new Vehicle();
        v1.setId(1);
        v1.setName("Swift");
        v1.setPrice_per_day(2000);
        v1.setAvailable(true);

        Vehicle v2 = new Vehicle();
        v2.setId(2);
        v2.setName("Thar");
        v2.setPrice_per_day(4500);
        v2.setAvailable(true);

        vehicleRepository.save(v1);
        vehicleRepository.save(v2);
    }

    @Test
    void shouldLoadAllVehiclesFromService() {
        List<Vehicle> vehicles = vehicleService.getAllVehicles();

        assertThat(vehicles).hasSize(2);
        assertThat(vehicles).extracting(Vehicle::getName).contains("Swift", "Thar");
    }
}
