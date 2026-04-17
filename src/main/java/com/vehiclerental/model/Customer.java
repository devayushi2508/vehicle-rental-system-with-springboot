package com.vehiclerental.model;

import jakarta.persistence.*;

@Entity
public class Customer {

    @Id
    private int id;

    private String name;

    public Customer() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}