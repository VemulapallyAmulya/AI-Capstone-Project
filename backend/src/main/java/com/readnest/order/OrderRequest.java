package com.readnest.order;

import java.util.List;

public class OrderRequest {

    private String customerName;
    private String address;
    private String paymentMethod;
    private List<OrderItem> items;

    public String getCustomerName() {
        return customerName;
    }

    public String getAddress() {
        return address;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}
