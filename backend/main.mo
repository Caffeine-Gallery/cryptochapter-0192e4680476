import Bool "mo:base/Bool";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
    // Types
    type Book = {
        id: Nat;
        title: Text;
        author: Text;
        description: Text;
        content: Text;
        coverImage: Text;
    };

    type Rental = {
        bookId: Nat;
        userId: Principal;
        startTime: Time.Time;
        endTime: Time.Time;
    };

    // State
    private stable var nextBookId: Nat = 0;
    private stable var booksEntries: [(Nat, Book)] = [];
    private stable var rentalsEntries: [(Nat, Rental)] = [];
    
    private var books = HashMap.HashMap<Nat, Book>(10, Nat.equal, Hash.hash);
    private var rentals = HashMap.HashMap<Nat, Rental>(10, Nat.equal, Hash.hash);

    // Initialize with some Web3 books
    private func initBooks() {
        let initialBooks = [
            {
                id = nextBookId;
                title = "Mastering Ethereum";
                author = "Andreas M. Antonopoulos";
                description = "A comprehensive guide to smart contract programming on Ethereum";
                content = "Chapter 1: What is Ethereum?\n\nEthereum is a decentralized platform...";
                coverImage = "https://images.unsplash.com/photo-1622630998477-20aa696ecb05";
            },
            {
                id = nextBookId + 1;
                title = "Web3 Revolution";
                author = "Gavin Wood";
                description = "Understanding the future of the decentralized web";
                content = "Chapter 1: The Evolution of the Web\n\nWeb3 represents the next evolution...";
                coverImage = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0";
            },
        ];

        for (book in initialBooks.vals()) {
            books.put(book.id, book);
            nextBookId += 1;
        };
    };

    system func preupgrade() {
        booksEntries := Iter.toArray(books.entries());
        rentalsEntries := Iter.toArray(rentals.entries());
    };

    system func postupgrade() {
        for ((id, book) in booksEntries.vals()) {
            books.put(id, book);
        };
        for ((id, rental) in rentalsEntries.vals()) {
            rentals.put(id, rental);
        };
        if (books.size() == 0) { initBooks() };
    };

    // Query calls
    public query func getAllBooks() : async [Book] {
        Iter.toArray(books.vals())
    };

    public query func getBook(id: Nat) : async ?Book {
        books.get(id)
    };

    public query func getUserRentals(userId: Principal) : async [Rental] {
        Iter.toArray(
            Array.filter<Rental>(
                Iter.toArray(rentals.vals()),
                func (rental: Rental) : Bool {
                    rental.userId == userId
                }
            ).vals()
        )
    };

    // Update calls
    public shared(msg) func rentBook(bookId: Nat) : async ?Rental {
        let userId = msg.caller;
        
        switch (books.get(bookId)) {
            case (null) { null };
            case (?book) {
                let rental = {
                    bookId = bookId;
                    userId = userId;
                    startTime = Time.now();
                    endTime = Time.now() + 2_592_000_000_000_000; // 30 days in nanoseconds
                };
                rentals.put(bookId, rental);
                ?rental
            };
        }
    };

    public shared(msg) func returnBook(bookId: Nat) : async Bool {
        switch (rentals.get(bookId)) {
            case (null) { false };
            case (?rental) {
                if (rental.userId == msg.caller) {
                    rentals.delete(bookId);
                    true
                } else {
                    false
                }
            };
        }
    };
}
