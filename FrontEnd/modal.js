import { getWorks } from "./data.js"
import { extractUniqueCategories } from "./gallery.js"

let modal = null
const focusableSelector = "button, a, input, textarea"
let focusablesElement = []
let previouslyFocusedElement = null

async function openModal(event) {
    event.preventDefault()
    const target = event.currentTarget.getAttribute("data-target")
    modal = await loadModal(target)
    await renderGallery()
    focusablesElement = Array.from(modal.querySelectorAll(focusableSelector))
    previouslyFocusedElement = document.querySelector(":focus")
    modal.style.display = null
    focusablesElement[0].focus()
    modal.removeAttribute("aria-hidden")
    modal.setAttribute("aria-modal", "true")
    modal.addEventListener("click", closeModal)
    bindModalEvents()
}

function closeModal(event) {
    if (modal === null) {
        return
    }
    if (previouslyFocusedElement !== null) {
        previouslyFocusedElement.focus()
    }
    event.preventDefault()
    modal.setAttribute("aria-hidden", "true")
    modal.removeAttribute("aria-modal")
    modal.removeEventListener("click", closeModal)
    modal.querySelector(".js-modal-close").removeEventListener("click", closeModal)
    modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation)
    const hideModal = function () {
        modal.style.display = "none"
        modal.removeEventListener("animationend", hideModal)
        modal = null
    }
    modal.addEventListener("animationend", hideModal)
}

function stopPropagation(event) {
    event.stopPropagation()
}

function focusInModal(event) {
    event.preventDefault()
    let index = focusablesElement.findIndex(f => f === modal.querySelector(":focus"))
    if (event.shiftKey === true) {
        index--
    } else {
        index++
    }
    if (index >= focusablesElement.length) {
        index = 0
    }
    if (index < 0) {
        index = focusablesElement.length - 1
    }
    focusablesElement[index].focus()
}

function bindModalEvents() {
    modal.querySelector(".js-modal-close")?.addEventListener("click", closeModal)
    modal.querySelector(".js-modal-stop")?.addEventListener("click", stopPropagation)
}

async function loadModal(url) {
    const target = "#" + url.split("#")[1]
    const existingModal = document.querySelector(target)
    if (existingModal !== null) return existingModal
    const response = await fetch(url)
    const html = await response.text()
    const element = document.createRange().createContextualFragment(html).querySelector(target)
    if (element === null) throw new Error(`L'élément ${target} n'a pas été trouvé dans la page ${url}`)
    document.body.append(element)
    return element
}

function displayWorksModale(works) {
    const modalGallery = document.querySelector(".grid-content")

    modalGallery.innerHTML = ""

    works.forEach(work => {

        const workElement = document.createElement("article")
        workElement.classList.add("image-container")

        const workImage = document.createElement("img")
        workImage.classList.add("image-container")
        workImage.src = work.imageUrl
        workImage.alt = work.title

        const workButton = document.createElement("button")
        workButton.classList.add("delete-button")

        const iconButton = document.createElement("i")
        iconButton.classList.add("fa-solid")
        iconButton.classList.add("fa-trash-can")

        workElement.appendChild(workImage)
        workElement.appendChild(workButton)
        workButton.appendChild(iconButton)
        modalGallery.appendChild(workElement)
    })

}

async function renderGallery() {
    showGalleryView()
    const data = await getWorks()
    displayWorksModale(data)
}

function validateFormFields() {
    const form = document.getElementById("add-photo-form")
    const submitButton = document.getElementById("add-to-gallery")

    if (!form || !submitButton) return

    const imageInput = form.querySelector('input[name="image"]')
    const titleInput = form.querySelector('input[name="title"]')
    const categorySelect = form.querySelector('select[name="category"]')

    if (!imageInput || !titleInput || !categorySelect) return

    const image = imageInput.files.length > 0
    const title = titleInput.value.trim() !== ""
    const category = categorySelect.value !== ""

    submitButton.disabled = !(image && title && category)
}

function uploadImageViewer() {

    const fileInput = document.getElementById("upload-image")
    const uploadContent = document.querySelector(".upload-content")

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0]
        if (!file || !file.type.startsWith("image/")) return

        const label = document.querySelector(".custom-file-label")
        const infoText = uploadContent.querySelector("p")
        label.style.display = "none"
        infoText.style.display = "none"

        const previousPreview = uploadContent.querySelector("img.preview-image")
        if (previousPreview) {
            previousPreview.remove()
        }

        const reader = new FileReader()
        reader.onload = function (event) {
            const img = document.createElement("img")
            console.log(event.target.result)
            img.src = event.target.result
            img.alt = "Apercu de l'image"
            img.classList.add("preview-image")

            img.addEventListener("click", () => fileInput.click())

            uploadContent.appendChild(img)
        }

        reader.readAsDataURL(file)

    })
}

function showGalleryView() {
    document.getElementById("modal-gallery-view").style.display = "block"
    document.getElementById("modal-add-photo-view").style.display = "none"
    document.querySelector(".button-back").style.display = "none"
    document.getElementById("title-modal").textContent = "Galerie photo"
    document.getElementById("open-add-photo").addEventListener("click", showAddPhotoView)

    bindModalEvents()
}

async function showAddPhotoView() {
    document.getElementById("modal-gallery-view").style.display = "none"
    const modalContent = document.getElementById("modal-add-photo-view")
    modalContent.style.display = "block"
    document.querySelector(".button-back").style.display = "block"
    document.getElementById("title-modal").textContent = "Ajout photo"

    const works = await getWorks()
    const categories = extractUniqueCategories(works)

    const select = modalContent.querySelector("#category")

    const defaultOption = document.createElement("option")
    defaultOption.value = ""
    defaultOption.textContent = ""
    defaultOption.disabled = true
    defaultOption.selected = true
    select.appendChild(defaultOption)

    categories.forEach(category => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        select.appendChild(option)
    })

    document.querySelector(".button-back").addEventListener("click", renderGallery)

    const form = document.getElementById("add-photo-form")
    form.addEventListener("input", validateFormFields)
    form.addEventListener("change", validateFormFields)

    validateFormFields()

    uploadImageViewer()

    bindModalEvents()
}

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', openModal)
})

window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
        closeModal(event)
    }
    if (event.key === "Tab" && modal !== null) {
        focusInModal(event)
    }
})