package com.readnest.book;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;
    private String category;
    private double price;
    private String description;
    private String cover;

    public Book() {
    }

    public Book(String title, String author, String category, double price,
                String description, String cover) {
        this.title = title;
        this.author = author;
        this.category = category;
        this.price = price;
        this.description = description;
        this.cover = cover;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getCategory() {
        return category;
    }

    public double getPrice() {
        return price;
    }

    public String getDescription() {
        return description;
    }

    public String getCover() {
        return cover;
    }
}
