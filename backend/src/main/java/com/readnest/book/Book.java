package com.readnest.book;

import jakarta.persistence.Entity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OrderColumn;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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
    private LocalDate publishedDate;
    private String authorBio;
    private String previousWorks;

    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn(name = "review_order")
    private List<BookReview> reviews = new ArrayList<>();

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

    public LocalDate getPublishedDate() {
        return publishedDate;
    }

    public List<BookReview> getReviews() {
        return reviews;
    }

    public String getAuthorBio() {
        return authorBio;
    }

    public String getPreviousWorks() {
        return previousWorks;
    }

    public void setPublishedDate(LocalDate publishedDate) {
        this.publishedDate = publishedDate;
    }

    public void setReviews(List<BookReview> reviews) {
        this.reviews = new ArrayList<>(reviews);
    }

    public void setAuthorBio(String authorBio) {
        this.authorBio = authorBio;
    }

    public void setPreviousWorks(String previousWorks) {
        this.previousWorks = previousWorks;
    }
}
