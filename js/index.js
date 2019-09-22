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
      console.log(bookData)
      
      // console.log(bookData[0])
      let foundBook = bookData.find(book => book.id === 1)
      console.log(foundBook.users)
    })


  bookList.addEventListener("click", e => {
    const id = e.target.dataset.id
    fetch(`http://localhost:3000/books/${id}`)
      .then(resp => resp.json())
      .then(showBook)
  })
  
  function renderBookIndex(book) {
    bookList.insertAdjacentHTML('beforeend', `
      <li data-id=${book.id}>${book.title}</li>
    `)
  }

  function usersLi(user) {
    const userList = document.getElementById("users-list")
    userList.insertAdjacentHTML('beforeend', `
      <li data-id=${user.id}>${user.username}</li>
    `)
  }
  
  function showBook(book) {
    const id = book.id
    const title = book.title
    const image = book.img_url
    const desc = book.description
    const usersArr = book.users
    // console.log(usersArr)
    let buttonText;

    if (usersArr.filter(user => (user.username === "pouros")).length) {
      buttonText = "Unlike this book"
    } else {
      buttonText = "Like this book"
    }

    showPanel.innerHTML = `
      <h2>${title}</h2>
      <img src="${image}">
      <p>${desc}</p>
      <ul id="users-list">
        
      </ul>
      <button data-action="like" data-id=${id}>${buttonText}</button>
      `
    usersArr.forEach(usersLi)
  }

  //update user likes
  showPanel.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
      const id = e.target.dataset.id

      fetch(`http://localhost:3000/books/${id}`)
        .then(resp => resp.json())
        .then(book => {
          let usersArr = book.users

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
            .then(showBook)
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
            .then(showBook)
          }
        })
    } //end of if statement
  }) 






});
