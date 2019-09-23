//refactored this to make a single fetch GET request and render each book's show and then control what the user sees with a CSS class toggle
//the book objects from the db are stored in a datastore array upon page load --the only time you get book info from the db is on page load
//the patch update could run into a race condition if multiple users are liking/unliking at the same time since I no longer make
// a fetch GET request before the patch to make sure I have the most up to date version of the book's users
// in a real world model, you'd likely have a join table of BookUser rather than the users stored in an object in the Book table so you'd be 
// deleting the row from the join table instead

document.addEventListener("DOMContentLoaded", function() {

  const bookList = document.getElementById("list");
  const showPanel = document.getElementById("show-panel");
  let bookData = [];

  //show all books
  fetch("http://localhost:3000/books")
    .then(resp => resp.json())
    .then(books => {
      bookData = books
      bookData.forEach(renderBookIndex)
      bookData.forEach(renderBook)
    })


  bookList.addEventListener("click", e => {
    const id = e.target.dataset.id

    //finds book object in datastore array
    let foundBook = bookData.find(book => book.id.toString() === id)
    console.log(foundBook)

    // toggles CSS class 
    books = showPanel.querySelectorAll(".book")
    books.forEach(book => {
      book.classList.toggle("active", book.dataset.id === id)
    })

  })
  
  function renderBookIndex(book) {
    bookList.insertAdjacentHTML('beforeend', `
      <li data-id=${book.id}>${book.title}</li>
    `)
  }

  function usersLiFunction(user, id) {
    const renderedBook = showPanel.querySelector(`[data-id="${id}"]`)
    const userList = renderedBook.querySelector("#users-list")

    userList.insertAdjacentHTML('beforeend', `
      <li data-userId=${user.id}>${user.username}</li>
    `)
  }
  
  function renderBook(book) {
    const id = book.id
    const title = book.title
    const image = book.img_url
    const desc = book.description
    const usersArr = book.users
    
    let buttonText;
    
    if (usersArr.filter(user => (user.username === "pouros")).length) {
      buttonText = "Unlike this book"
    } else {
      buttonText = "Like this book"
    }

    showPanel.insertAdjacentHTML('beforeend', `
      <div class="book" data-id=${id}>
        <h2>${title}</h2>
        <img src="${image}">
        <p>${desc}</p>
        <ul id="users-list">
          
        </ul>
        <button data-action="like" data-id=${id}>${buttonText}</button>
      </div>
      `)
    
    usersArr.forEach(user => {
      usersLiFunction(user, id)
    })
  }

  //update user likes
  showPanel.addEventListener("click", e => {
    // figure out how to get the id of the book that's been clicked, as well as find its object in the datastore
    const id = e.target.dataset.id
    //finds book object in datastore array
    let foundBook = bookData.find(book => book.id.toString() === id)
    let usersArr = foundBook.users
    const button = showPanel.querySelector("button")

    // make sure the user is clicking the button
    if (e.target.dataset.action === "like") {
      console.log("liking")
      console.log(usersArr)
      let index = bookData.indexOf(foundBook)
      
    //   // if/else to for patch request to db
    //   // re-render the like button text and the list of users (find book by class===active)
      if (usersArr.filter(user => (user.username === "pouros")).length) {
        usersArr = usersArr.filter(user => (user.username !== "pouros"))
        fetch(`http://localhost:3000/books/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({users: usersArr})
        }).then(resp => resp.json())
        .then(book => {
          // update the book's object in the datastore
          bookData[index].users = usersArr
          console.log(bookData[index].users)
          // re-render the like button text and the list of users (find book by class===active)
          const renderedBook = showPanel.querySelector(`[data-id="${id}"]`)
          const userList = renderedBook.querySelector("#users-list")
          button.innerText = "Like this book"
          userList.innerHTML = ""
          usersArr.forEach(user => {
            usersLiFunction(user, id)
          })
        })
      } else {
        usersArr.push({"id":1, "username":"pouros"})
        fetch(`http://localhost:3000/books/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({users: usersArr})
        }).then(resp => resp.json())
        .then(book => {
          // update the book's object in the datastore
          bookData[index].users = usersArr
          console.log(bookData[index].users)
          // re-render the like button text and the list of users (find book by class===active)
          const renderedBook = showPanel.querySelector(`[data-id="${id}"]`)
          const userList = renderedBook.querySelector("#users-list")
          button.innerText = "Unike this book"
          userList.innerHTML = ""
          usersArr.forEach(user => {
            usersLiFunction(user, id)
          })
        })
      }
    } //closes event delegation if

  })
  



});
