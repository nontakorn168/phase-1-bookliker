document.addEventListener("DOMContentLoaded", function() {
    fetch('http://localhost:3000/books')
    .then(response => response.json())
    .then(books => {  
        const bookList = document.getElementById('list-panel');
        books.forEach(book => {
            const ul = document.createElement('ul');
            ul.innerHTML = `<li data-id="${book.id}">${book.title}</li>`;
            bookList.appendChild(ul);
        });
    });

    const bookList = document.getElementById('list-panel');
    bookList.addEventListener('click', event => {
        if (event.target.tagName === 'LI') {  
            const bookId = event.target.dataset.id;
            const bookDetail = document.getElementById('show-panel');
            fetch(`http://localhost:3000/books/${bookId}`)
                .then(response => response.json())
                .then(book => {
                    // Render book details along with a LIKE button and list of users who liked the book
                    bookDetail.innerHTML = `
                    <img src="${book.img_url}">
                    <p><strong>Title:</strong> ${book.title}</p>
                    <p><strong>Subtitle:</strong> ${book.subtitle}</p>
                    <p><strong>Description:</strong> ${book.describe}</p>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <ul id="users-list">${book.users.map(user => `<li>${user.username}</li>`).join('')}</ul>
                    <button id="like-button">${isUserInList(book.users, currentUser) ? 'UNLIKE' : 'LIKE'}</button>
                    `;
                    addLikeButtonListener(book, bookId);
                });
        }
    });

    const currentUser = { id: 1, username: "pouros" }; // Example current user

    function isUserInList(users, user) {
        return users.some(u => u.id === user.id);
    }

    function addLikeButtonListener(book, bookId) {
        const likeButton = document.getElementById('like-button');
        
        likeButton.addEventListener('click', (event) => {
            event.preventDefault();
            const users = book.users;
            const userIndex = users.findIndex(user => user.id === currentUser.id);

            if (userIndex === -1) {
                // If the user has not liked the book yet, add the user
                users.push(currentUser);
            } else {
                // If the user has already liked the book, remove the user
                users.splice(userIndex, 1);
            }

            fetch(`http://localhost:3000/books/${bookId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ users: users })
            })
            .then(response => response.json())
            .then(updatedBook => {
                const usersList = document.getElementById('users-list');
                usersList.innerHTML = updatedBook.users.map(user => `<li>${user.username}</li>`).join('');
                // Update button text
                likeButton.textContent = isUserInList(updatedBook.users, currentUser) ? 'UNLIKE' : 'LIKE';
            });
        });
    }
});
