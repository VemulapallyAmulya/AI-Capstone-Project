package com.readnest.config;

import com.readnest.book.Book;
import com.readnest.book.BookRepository;
import com.readnest.book.BookReview;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DataLoader implements CommandLineRunner {

    private static final int CATALOG_SIZE = 100;
    private static final String[] TITLE_OPENINGS = {
            "The Amber Map", "The Borrowed Hour", "The Blue Orchard", "The Brass Compass",
            "The Quiet Archive", "The Paper Kingdom", "The Glass Harbor", "The Hidden Season",
            "The Distant Shore", "The Last Lantern"
    };
    private static final String[] TITLE_ENDINGS = {
            "First Light", "Lost Things", "Small Wonders", "Winter Stars", "Wild Rivers",
            "Secret Names", "Open Roads", "Forgotten Songs", "Faraway Homes", "New Beginnings"
    };
    private static final String[] AUTHORS = {
            "Anika Sen", "Dev Malhotra", "Leela Kapoor", "Rohan Mehta", "Tara Iyer",
            "Kabir Anand", "Mira Thomas", "Aarav Nair", "Sana Qureshi", "Ishaan Bose",
            "Nisha Menon", "Arjun Das", "Meera Shah", "Rehan Ali", "Diya Krishnan",
            "Kavya Rao", "Neil Fernandes", "Asha Pillai", "Vivaan Roy", "Noor Banerjee"
    };
    private static final String[] CATEGORIES = {
            "Fiction", "Mystery", "Science Fiction", "Science", "Self Help"
    };
    private static final String[] READERS = {
            "Aditi M.", "Ravi K.", "Samira P.", "Neil D.", "Ira S.",
            "Dev A.", "Maya T.", "Kiran R.", "Anya B.", "Arun V."
    };
    private static final String[][] SAMPLE_COMMENTS = {
            {
                    "A thoughtful, absorbing read. I wanted to stay in this world a little longer.",
                    "Warm, well-paced, and full of little details that stayed with me."
            },
            {
                    "A clever page-turner with just enough clues to keep me guessing.",
                    "I kept changing my mind about what would happen next. A fun read."
            },
            {
                    "A vivid journey with an imaginative world and a hopeful heart.",
                    "The big ideas and personal moments worked beautifully together."
            },
            {
                    "Clear, approachable, and full of ideas that made me curious.",
                    "I learned something new and found myself thinking about it afterward."
            },
            {
                    "Encouraging without feeling preachy. I marked a few pages to revisit.",
                    "A practical, kind read that gave me a fresh perspective."
            }
    };

    private final BookRepository repository;

    public DataLoader(BookRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        seedOriginalBooksWhenEmpty();

        List<Book> existingBooks = repository.findAll();
        Set<String> existingTitles = existingBooks.stream()
                .map(book -> book.getTitle().trim().toLowerCase())
                .collect(Collectors.toSet());
        List<Book> changedBooks = new ArrayList<>();

        for (int index = 0; index < existingBooks.size(); index++) {
            Book book = existingBooks.get(index);
            boolean changed = addDemoDetailsWhenMissing(book, index);
            if (changed) {
                changedBooks.add(book);
            }
        }
        repository.saveAll(changedBooks);

        long catalogSize = existingBooks.size();
        int generatedIndex = 0;
        List<Book> newBooks = new ArrayList<>();
        for (String opening : TITLE_OPENINGS) {
            for (String ending : TITLE_ENDINGS) {
                if (catalogSize >= CATALOG_SIZE) {
                    repository.saveAll(newBooks);
                    return;
                }

                String title = opening + " of " + ending;
                if (!existingTitles.add(title.toLowerCase())) {
                    continue;
                }

                newBooks.add(createBook(title, generatedIndex));
                generatedIndex++;
                catalogSize++;
            }
        }
        repository.saveAll(newBooks);
    }

    private void seedOriginalBooksWhenEmpty() {
        if (repository.count() > 0) {
            return;
        }

        repository.saveAll(List.of(
                new Book(
                        "The Quiet Morning",
                        "Maya Rao",
                        "Fiction",
                        299,
                        "A short story about starting again and finding confidence in small steps.",
                        "/book-covers/the-quiet-morning.svg"
                ),
                new Book(
                        "Learn Better",
                        "Arun Dev",
                        "Self Help",
                        249,
                        "Simple ideas for building a better study routine without burning out.",
                        "/book-covers/learn-better.svg"
                ),
                new Book(
                        "Beyond the Stars",
                        "Nina Joseph",
                        "Science Fiction",
                        399,
                        "A young engineer discovers a signal that changes her plans for the future.",
                        "/book-covers/beyond-the-stars.svg"
                ),
                new Book(
                        "The Last Train Home",
                        "Vikram Sen",
                        "Mystery",
                        329,
                        "A missing passenger and one final train create a mystery that needs solving.",
                        "/book-covers/the-last-train-home.svg"
                ),
                new Book(
                        "Small Habits",
                        "Riya Das",
                        "Self Help",
                        199,
                        "A practical guide to making useful habits one small change at a time.",
                        "/book-covers/small-habits.svg"
                ),
                new Book(
                        "The Green Planet",
                        "Kiran Paul",
                        "Science",
                        279,
                        "An easy introduction to the science behind our changing planet.",
                        "/book-covers/the-green-planet.svg"
                )
        ));
    }

    private boolean addDemoDetailsWhenMissing(Book book, int index) {
        boolean changed = false;
        LocalDate publishedDate = publicationDate(index);

        if (book.getPublishedDate() == null) {
            book.setPublishedDate(publishedDate);
            changed = true;
        }
        if (book.getAuthorBio() == null || book.getPreviousWorks() == null) {
            setAuthorProfile(book, index);
            changed = true;
        }
        if (book.getReviews().isEmpty()) {
            book.setReviews(sampleReviews(index, book.getPublishedDate()));
            changed = true;
        }

        return changed;
    }

    private Book createBook(String title, int index) {
        String category = CATEGORIES[index % CATEGORIES.length];
        LocalDate publishedDate = publicationDate(index + 6);
        int price = 179 + (index % 15) * 20;
        String description = descriptionFor(category, title);

        Book book = new Book(
                title,
                AUTHORS[index % AUTHORS.length],
                category,
                price,
                description,
                ""
        );
        book.setPublishedDate(publishedDate);
        book.setReviews(sampleReviews(index + 6, publishedDate));
        setAuthorProfile(book, index + 6);
        return book;
    }

    private void setAuthorProfile(Book book, int index) {
        String style = switch (book.getCategory()) {
            case "Mystery" -> "character-led mysteries and quietly surprising endings";
            case "Science Fiction" -> "imaginative futures grounded in human stories";
            case "Science" -> "curious, accessible journeys through big ideas";
            case "Self Help" -> "gentle, practical ideas for everyday growth";
            default -> "warm, thoughtful stories about change and connection";
        };
        String[] sampleWorkA = {
                "A Map of Borrowed Light", "The Little Hours", "Every Quiet Thing",
                "Notes from Elsewhere", "The Shape of a Beginning"
        };
        String[] sampleWorkB = {
                "Small Fires at Dawn", "A Pocketful of Seasons", "The Long Way In",
                "Field Notes for Tomorrow", "Where the Roads Meet"
        };

        book.setAuthorBio(book.getAuthor() + " is a fictional ReadNest author profile, known in this demo collection for " + style + ".");
        book.setPreviousWorks(sampleWorkA[index % sampleWorkA.length] + ", " + sampleWorkB[index % sampleWorkB.length]);
    }

    private List<BookReview> sampleReviews(int index, LocalDate publishedDate) {
        int categoryIndex = index % CATEGORIES.length;
        LocalDate reviewDate = publishedDate.plusDays(17 + index % 90);
        return List.of(
                new BookReview(
                        READERS[index % READERS.length],
                        5,
                        SAMPLE_COMMENTS[categoryIndex][0],
                        reviewDate
                ),
                new BookReview(
                        READERS[(index + 3) % READERS.length],
                        4 + index % 2,
                        SAMPLE_COMMENTS[categoryIndex][1],
                        reviewDate.plusDays(9)
                )
        );
    }

    private LocalDate publicationDate(int index) {
        return LocalDate.of(
                2018 + index % 9,
                1 + index % 12,
                1 + index % 26
        );
    }

    private String descriptionFor(String category, String title) {
        return switch (category) {
            case "Mystery" -> title + " opens a trail of small clues, unexpected allies, and a secret worth uncovering.";
            case "Science Fiction" -> title + " follows an unlikely crew as a distant discovery reshapes their future.";
            case "Science" -> title + " offers a curious, clear-eyed look at the ideas changing how we see our world.";
            case "Self Help" -> title + " shares gentle, practical ideas for building a more intentional everyday life.";
            default -> title + " is a richly imagined story about finding courage, connection, and a place to belong.";
        };
    }
}
