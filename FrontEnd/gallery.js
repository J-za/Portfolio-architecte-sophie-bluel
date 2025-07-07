// Get data from data.js
import { getWorks } from "./data.js"
import { openModal } from "./modal.js"

// Display works in the gallery
export function displayWorks(works) {
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

export function extractUniqueCategories(works) {

    //-----------------Retrieve the 3 categories (ID + Name)-----------------//


    const categories = works.map(work => {
        return work.category.name
    });
    return new Set(categories)

}

export function handleFilters(works) {

    const gallery = document.querySelector(".gallery")
    const categoryArray = extractUniqueCategories(works)

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
            button.textContent = category
            button.classList.add("button")
            divButtons.appendChild(button)

            button.addEventListener("click", () => {
                resetActiveButtons()
                button.classList.add("active")
                const worksFilters = works.filter(work => work.category.name === category)
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

        editButton.addEventListener("click", (event) => {
            event.preventDefault
            openModal()
        })
    } else {
        editlogin.innerText = "login"
        editlogin.setAttribute("href", "login.html")
    }
}

// Listen for DOM load and call functions
document.addEventListener("DOMContentLoaded", async () => {
    const data = await getWorks()
    displayWorks(data)
    handleFilters(data)
    EditMode()
})
