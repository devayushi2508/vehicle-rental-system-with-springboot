package com.vehiclerental.model;

import jakarta.persistence.*;

@Entity
public class Rental {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int rentalId;
	
	private int vehicleId;
	private int customerId;
	private int days;
	private double totalCost;
	
	public Rental() {}
	
	public int getRentalId() {
		return rentalId;
		
	}
	public int getVehicleId() {
		return vehicleId;
	}
	public void setVehicleId(int vehicleId) {
		this.vehicleId = vehicleId;
	}
	
	public int getCustomerId() {
		return customerId;
	}
	
	public int getDays() {
		return days;
	}
	public void setDays(int days) {
		this.days = days;
	}
	public double getTotalCost() {
		return totalCost;
	}
	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}

}
