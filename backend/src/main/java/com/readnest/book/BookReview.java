package com.readnest.book;

import jakarta.persistence.Embeddable;

import java.time.LocalDate;

@Embeddable
public class BookReview {

    private String customerName;
    private int rating;
    private String comment;
    private LocalDate reviewDate;

    protected BookReview() {
    }

    public BookReview(String customerName, int rating, String comment, LocalDate reviewDate) {
        this.customerName = customerName;
        this.rating = rating;
        this.comment = comment;
        this.reviewDate = reviewDate;
    }

    public String getCustomerName() {
        return customerName;
    }

    public int getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public LocalDate getReviewDate() {
        return reviewDate;
    }
}
