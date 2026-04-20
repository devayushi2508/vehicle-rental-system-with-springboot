package com.vehiclerental.dto;

import jakarta.validation.constraints.Min;

public class CreateRentalRequest {

    @Min(value = 1, message = "vehicleId must be greater than 0")
    private int vehicleId;

    @Min(value = 1, message = "customerId must be greater than 0")
    private int customerId;

    @Min(value = 1, message = "days must be at least 1")
    private int days;

    public int getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(int vehicleId) {
        this.vehicleId = vehicleId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public int getDays() {
        return days;
    }

    public void setDays(int days) {
        this.days = days;
    }
}
