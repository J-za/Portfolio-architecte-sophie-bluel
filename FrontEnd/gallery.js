// Fetch work data from the API

async function loadWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works")
        if (!response.ok) {
            throw new Error(`HTTP error : ${response.status}`)
        }
        const datas = await response.json()
        return datas
    } catch (error) {
        console.error(error.message)
    }

}

// Display works in the gallery
function displayWorks(works) {
    const gallery = document.querySelector(".gallery")

    gallery.innerHTML = ""

    works.forEach(work => {

        const workElement = document.createElement("figure")

        const workImage = document.createElement("img")
        workImage.src = work.imageUrl
        workImage.alt = work.title

        const workCaption = document.createElement("figcaption")
        workCaption.innerText = work.title

        workElement.appendChild(workImage)
        workElement.appendChild(workCaption)
        gallery.appendChild(workElement)
    })

}

// Create buttons and handle filters

function handleFilters(works) {

    const gallery = document.querySelector(".gallery")

    //-----------------Retrieve the 3 categories (ID + Name)-----------------//

    const categories = works.map(work => {
        return {
            id: work.category.id,
            name: work.category.name
        }
    });
    const categoryArray = [...new Map(categories.map(cat => [cat.id, cat])).values()]


    //-----------------Create and manage filters-----------------//

    const divButtons = document.createElement("div")
    divButtons.classList.add("button-content")
    gallery.insertAdjacentElement("beforebegin", divButtons)

    const token = sessionStorage.getItem("token")
    if (!token) {
        function resetActiveButtons() {
            const allButtons = divButtons.querySelectorAll(".button")
            allButtons.forEach(btn => btn.classList.remove("active"))
        }

        const allButton = document.createElement("button")
        allButton.textContent = "Tous"
        allButton.classList.add("button", "active")
        divButtons.appendChild(allButton)

        allButton.addEventListener("click", function () {
            resetActiveButtons()
            allButton.classList.add("active")
            gallery.innerHTML = ""
            displayWorks(works)
        })


        categoryArray.forEach(category => {
            const button = document.createElement("button")
            button.textContent = category.name
            button.classList.add("button")
            divButtons.appendChild(button)

            button.addEventListener("click", () => {
                resetActiveButtons()
                button.classList.add("active")
                const worksFilters = works.filter(work => work.category.id === category.id)
                gallery.innerHTML = ""
                displayWorks(worksFilters)
            })
        })
    }
}

function EditMode() {

    const editBar = document.getElementById("edit-bar")
    const editButton = document.getElementById("edit-button")
    const editlogin = document.getElementById("edit-login")
    const token = sessionStorage.getItem("token")

    if (token) {

        document.body.classList.add("edit-body-active")
        editBar.classList.add("edit-bar-active")
        editButton.classList.add("edit-button-active")
        editlogin.innerText = "logout"


        editlogin.addEventListener("click", (event) => {
            event.preventDefault()
            sessionStorage.removeItem("token")
            editButton.classList.remove("edit-button-active")
            window.location.href = "index.html"
        })
    } else {
        editlogin.innerText = "login"
        editlogin.setAttribute("href", "login.html")
    }
}

// Listen for DOM load and call functions
document.addEventListener("DOMContentLoaded", async () => {
    const data = await loadWorks()
    displayWorks(data)
    handleFilters(data)
    EditMode()
})
