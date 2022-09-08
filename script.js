const books = [];
const RENDER_EVENT = 'render-book';
const searchResult = [];
const STORAGE_KEY = 'Bookshelf_APPS';
const RENDER_SEARCH_EVENT = 'render-search-result';

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputs');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
  const searchForm = document.getElementById('searchBookTitle');
  searchForm.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      searchItem(searchForm.value);
      e.preventDefault();
    }
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generatebookObject(generatedID, bookTitle, bookAuthor, bookYear, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generatebookObject(id, Title, Author, Year, isCompleted) {
  return {
    id,
    Title,
    Author,
    Year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedList = document.getElementById('books_uncompleted');
  const completedList = document.getElementById('books_completed');

  uncompletedList.innerHTML = '';
  completedList.innerHTML = '';

  for (const bookItem of books) {
    if (bookItem.isCompleted) {
      const bookElement = makeBook(bookItem);
      completedList.append(bookElement);
    } else {
      const bookElement = makeBook(bookItem);
      uncompletedList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.Title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = bookObject.Author;

  const textYear = document.createElement('p');
  textYear.innerText = bookObject.Year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const buttongrup = document.createElement('div');
    buttongrup.classList.add('button-grup');

    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.innerText = 'Undo';

    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerText = 'Delete';

    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(bookObject.id);
    });

    buttongrup.append(undoButton, trashButton);
    textContainer.append(buttongrup);
  } else {
    const buttongrup = document.createElement('div');
    buttongrup.classList.add('button-grup');

    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.innerText = 'Finished';

    checkButton.addEventListener('click', function () {
      addTaskToCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerText = 'Delete';

    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(bookObject.id);
    });

    buttongrup.append(checkButton, trashButton);
    textContainer.append(buttongrup);
  }
  return textContainer;
}
function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function searchItem(keyword) {
  if (searchResult.length !== 0) {
    searchResult.splice(0, searchResult.length);
  }

  if (keyword === '') {
    document.dispatchEvent(RENDER_EVENT);
  } else {
    for (const bookItem of books) {
      if (bookItem.title.toLowerCase().includes(keyword.toLowerCase()) || bookItem.author.toLowerCase().includes(keyword.toLowerCase())) {
        searchResult.push(bookItem);
      }
    }
    document.dispatchEvent(RENDER_SEARCH_EVENT);
  }
}
document.addEventListener('render-search-result', function () {
  const uncompleteBooksContainer = document.querySelector('.uncomplete-book-card');
  const completedBooksContainer = document.querySelector('.completed-book-card');

  uncompleteBooksContainer.innerHTML = '';
  completedBooksContainer.innerHTML = '';

  const titleUncomplete = document.createElement('h3');
  titleUncomplete.innerText = 'Uncomplete Books';

  const titleCompleted = document.createElement('h3');
  titleCompleted.innerText = 'Completed Books';

  completedBooksContainer.append(titleCompleted);
  uncompleteBooksContainer.append(titleUncomplete);

  for (const bookItem of searchResult) {
    bookStructure = generateBookStructure(bookItem);
    if (bookItem.isComplete) {
      completedBooksContainer.append(bookStructure);
    } else {
      uncompleteBooksContainer.append(bookStructure);
    }
  }
});
