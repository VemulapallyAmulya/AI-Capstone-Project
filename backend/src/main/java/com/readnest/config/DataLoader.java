package com.readnest.config;

import com.readnest.book.Book;
import com.readnest.book.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final BookRepository repository;

    public DataLoader(BookRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        repository.save(new Book(
                "The Quiet Morning",
                "Maya Rao",
                "Fiction",
                299,
                "A short story about starting again and finding confidence in small steps.",
                "https://placehold.co/240x340?text=Quiet+Morning"
        ));

        repository.save(new Book(
                "Learn Better",
                "Arun Dev",
                "Self Help",
                249,
                "Simple ideas for building a better study routine without burning out.",
                "https://placehold.co/240x340?text=Learn+Better"
        ));

        repository.save(new Book(
                "Beyond the Stars",
                "Nina Joseph",
                "Science Fiction",
                399,
                "A young engineer discovers a signal that changes her plans for the future.",
                "https://placehold.co/240x340?text=Beyond+Stars"
        ));

        repository.save(new Book(
                "The Last Train Home",
                "Vikram Sen",
                "Mystery",
                329,
                "A missing passenger and one final train create a mystery that needs solving.",
                "https://placehold.co/240x340?text=Last+Train"
        ));

        repository.save(new Book(
                "Small Habits",
                "Riya Das",
                "Self Help",
                199,
                "A practical guide to making useful habits one small change at a time.",
                "https://placehold.co/240x340?text=Small+Habits"
        ));

        repository.save(new Book(
                "The Green Planet",
                "Kiran Paul",
                "Science",
                279,
                "An easy introduction to the science behind our changing planet.",
                "https://placehold.co/240x340?text=Green+Planet"
        ));
    }
}
