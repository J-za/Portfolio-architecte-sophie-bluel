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

function handleFilters(works) {

    const gallery = document.querySelector(".gallery")
    const categoryArray = extractUniqueCategories(works)

    //-----------------Create and manage filters-----------------//

    const divButtons = document.createElement("div")
    divButtons.classList.add("button-content")
    gallery.insertAdjacentElement("beforebegin", divButtons)

    const token = sessionStorage.getItem("token")
    if (!token) {
        function resetActiveButtons() {
            const allButtons = divButtons.querySelectorAll(".filter-button")
            allButtons.forEach(btn => btn.classList.remove("active"))
        }

        const showAllButton = document.createElement("button")
        showAllButton.textContent = "Tous"
        showAllButton.classList.add("filter-button", "active")
        divButtons.appendChild(showAllButton)

        showAllButton.addEventListener("click", function () {
            resetActiveButtons()
            showAllButton.classList.add("active")
            gallery.innerHTML = ""
            displayWorks(works)
        })


        categoryArray.forEach(category => {
            const button = document.createElement("button")
            button.textContent = category
            button.classList.add("filter-button")
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

function editMode() {

    const header = document.querySelector("header")
    const title = document.querySelector(".edit-mode h2")
    const editlogin = document.getElementById("edit-login")
    const token = sessionStorage.getItem("token")

    if (token) {

        document.body.classList.add("edit-body-active")

        //Création de la bannière d'édition
        const editBar = document.createElement("div")
        editBar.id = "edit-bar"
        editBar.classList.add("edit-bar-active")
        editBar.innerHTML = `
        <p id="edit-info-bar"><i class="fa-regular fa-pen-to-square"></i><span>Mode édition</span></p>
        `
        document.body.insertBefore(editBar, header)

        //création du bouton d'édition
        const editButton = document.createElement("button")
        editButton.id = "edit-button"
        editButton.classList.add("js-modal")
        editButton.dataset.target = "#modal"
        editButton.innerHTML = `
        <i class="fa-regular fa-pen-to-square"></i><span>modifier</span>
        `
        title.insertAdjacentElement("afterend", editButton)

        editlogin.innerText = "logout"


        editlogin.addEventListener("click", (event) => {
            event.preventDefault()
            sessionStorage.removeItem("token")
            window.location.href = "index.html"
        })

        editButton.addEventListener("click", (event) => {
            event.preventDefault
            editButton.classList.remove("edit-button-active")
            openModal()
        })
    } else {
        editlogin.innerText = "login"
    }
}

// Listen for DOM load and call functions
document.addEventListener("DOMContentLoaded", async () => {
    const data = await getWorks()
    displayWorks(data)
    handleFilters(data)
    editMode()
})
