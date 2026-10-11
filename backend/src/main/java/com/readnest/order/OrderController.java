package com.readnest.order;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @PostMapping
    public String createOrder(@RequestBody OrderRequest request) {
        return "RN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
