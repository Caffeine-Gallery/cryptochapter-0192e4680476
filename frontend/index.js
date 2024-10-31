import { AuthClient } from "@dfinity/auth-client";
import { backend } from "declarations/backend";

let authClient;
let isAuthenticated = false;
let modal;

async function init() {
    authClient = await AuthClient.create();
    isAuthenticated = await authClient.isAuthenticated();
    
    modal = new bootstrap.Modal(document.getElementById('readerModal'));
    updateLoginButton();
    if (isAuthenticated) {
        loadBooks();
    }

    document.getElementById('loginBtn').onclick = login;
}

async function login() {
    if (isAuthenticated) {
        await authClient.logout();
        isAuthenticated = false;
        document.getElementById('bookshelf').innerHTML = '';
    } else {
        await authClient.login({
            identityProvider: "https://identity.ic0.app",
            onSuccess: () => {
                isAuthenticated = true;
                loadBooks();
            }
        });
    }
    updateLoginButton();
}

function updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.textContent = isAuthenticated ? 'Logout' : 'Login';
}

async function loadBooks() {
    showLoading(true);
    try {
        const books = await backend.getAllBooks();
        const rentals = await backend.getUserRentals(authClient.getIdentity().getPrincipal());
        
        const bookshelf = document.getElementById('bookshelf');
        bookshelf.innerHTML = books.map(book => createBookCard(book, rentals)).join('');
        
        // Add event listeners
        books.forEach(book => {
            const isRented = rentals.some(rental => rental.bookId === book.id);
            document.getElementById(`book-${book.id}`).onclick = () => handleBookClick(book, isRented);
        });
    } catch (error) {
        console.error('Error loading books:', error);
    }
    showLoading(false);
}

function createBookCard(book, rentals) {
    const isRented = rentals.some(rental => rental.bookId === book.id);
    return `
        <div class="col-md-4 col-lg-3">
            <div class="card h-100" id="book-${book.id}" style="cursor: pointer;">
                <img src="${book.coverImage}" class="card-img-top" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">${book.author}</p>
                    <p class="card-text"><small>${book.description}</small></p>
                    <button class="btn btn-${isRented ? 'success' : 'primary'} w-100">
                        ${isRented ? 'Read Now' : 'Rent Book'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function handleBookClick(book, isRented) {
    if (!isRented) {
        showLoading(true);
        try {
            await backend.rentBook(book.id);
            await loadBooks();
        } catch (error) {
            console.error('Error renting book:', error);
        }
        showLoading(false);
    } else {
        document.getElementById('readerTitle').textContent = book.title;
        document.getElementById('readerContent').textContent = book.content;
        modal.show();
    }
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('d-none', !show);
}

init();
