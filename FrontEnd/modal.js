import { getWorks, deleteWork, sendNewWork, getCategories } from "./data.js"
import { displayWorks } from "./gallery.js"

let modal = null
let errorMessage = null
let cachedWorks = []

export function openModal() {
    modal = document.getElementById("modal")
    modal.style.display = "flex"
    modal.setAttribute("aria-hidden", "false")
    renderModalGallery()
}

function closeModal() {
    if (!modal) {
        return
    }
    window.setTimeout(function () {
        modal.style.display = "none"
        modal = null
    }, 500)
    modal.setAttribute("aria-hidden", "true")
    modal.innerHTML = ""
}

function createModalShell(innerContent, includeBackButton = false) {
    const backButtonHTML = includeBackButton ? `
    <button class="js-modal-back button-back"><i class="fa-solid fa-arrow-left"></i></button>
    ` : ""
    modal.innerHTML = `
    <section id="modal-wrapper" class="modal-wrapper js-modal-stop">
            <button class="js-modal-close button-close"><i class="fa-solid fa-xmark"></i></button>
            ${backButtonHTML}
            ${innerContent}
    </section>
    `
}

async function renderModalGallery() {
    const galleryHTML = `
            <h1 id="title-modal">Galerie photo</h1>
            <div class="grid-content">
            </div>
            <div class="add-button-content">
                <button id="open-add-photo" class="add-button">Ajouter une photo</button>
            </div>
    `
    createModalShell(galleryHTML)


    if (cachedWorks.length === 0) {
        cachedWorks = await getWorks()
    }

    const modalGallery = document.querySelector(".grid-content")

    modalGallery.innerHTML = ""

    cachedWorks.forEach(work => {

        const workElement = document.createElement("article")
        workElement.classList.add("image-container")

        const workImage = document.createElement("img")
        workImage.classList.add("image-container")
        workImage.src = work.imageUrl
        workImage.alt = work.title

        const workButton = document.createElement("button")
        workButton.classList.add("delete-button")
        workButton.addEventListener("click", () => deleteWorks(work.id))

        const iconButton = document.createElement("i")
        iconButton.classList.add("fa-solid")
        iconButton.classList.add("fa-trash-can")

        workElement.appendChild(workImage)
        workElement.appendChild(workButton)
        workButton.appendChild(iconButton)
        modalGallery.appendChild(workElement)
    })

    bindGalleryEvents()
}

async function deleteWorks(id) {
    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce travail ?");
    if (!confirmation) return;
    
    try {
        await deleteWork(id)
        cachedWorks = cachedWorks.filter(work => work.id !== id)
        renderModalGallery()
        displayWorks(cachedWorks)
    } catch (error) {
        console.error(error.message)
        alert("Erreur lors de la suppression")
    }
}

async function renderModalUpload() {

    const uploadHTML = `
                <h1 id="title-modal">Ajout photo</h1>
            <form action="#" id="add-photo-form">
                <div class="upload-content">
                    <label for="upload-image" class="custom-file-label">
                        <i class="fa-regular fa-image"></i>
                        <span>+ Ajouter photo</span>
                    </label>
                    <input type="file" id="upload-image" name="image" accept="image/jpeg, image/png" required>
                    <p>.jpg, .png - 4mo max</p>
                </div>
                <label for="title">Titre</label>
                <input type="text" name="title" required>
                <label for="category">Catégorie</label>
                <select name="category" id="category">

                </select>
            </form>
            <div class="add-button-content">
                <button type="submit" form="add-photo-form" id="add-to-gallery" class="add-button" disabled>Valider</button>
            </div>
    `
    createModalShell(uploadHTML, true)

    const categories = await getCategories()

    const select = modal.querySelector("#category")

    const wrapper = document.createElement("div");
    wrapper.classList.add("select-wrapper")

    const icon = document.createElement("i")
    icon.classList.add("fa-solid", "fa-chevron-down")

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select)
    wrapper.appendChild(icon)

    select.innerHTML = ""

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

    bindUploadEvents()
}

function showImagePreview(event) {
    const fileInput = modal.querySelector("#upload-image")
    const uploadContent = modal.querySelector(".upload-content")

    const file = event.target.files[0]
    if (!file || !file.type.startsWith("image/")) return

    const label = modal.querySelector(".custom-file-label")
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
        img.src = event.target.result
        img.alt = "Apercu de l'image"
        img.classList.add("preview-image")

        img.addEventListener("click", () => fileInput.click())

        uploadContent.appendChild(img)
    }
    reader.readAsDataURL(file)
}

function validateFormFields() {

    let imageOk = false
    const form = document.querySelector("#add-photo-form")
    const submitButton = modal.querySelector("#add-to-gallery")
    const imageContent = document.querySelector(".upload-content")


    if (!form || !submitButton) return

    const imageInput = form.querySelector('input[name="image"]')
    const titleInput = form.querySelector('input[name="title"]')
    const categorySelect = form.querySelector('select[name="category"]')

    if (!imageInput || !titleInput || !categorySelect) return

    const image = imageInput.files[0]
    const acceptedTypes = imageInput.accept.split(",").map(type => type.trim())

    if (imageInput.files.length > 0) {
        const isImage = acceptedTypes.includes(image.type)
        const isUnder4MB = image.size <= 4 * 1024 * 1024
        if (errorMessage) errorMessage.remove()
        if (!isImage) {
            errorMessage = document.createElement("p")
            errorMessage.classList.add("error-message")
            errorMessage.textContent = "Format non supporté. Veuillez choisir un fichier JPG ou PNG."
            imageContent.insertAdjacentElement("afterend", errorMessage)
            imageOk = false
        } else if (!isUnder4MB) {
            errorMessage = document.createElement("p")
            errorMessage.classList.add("error-message")
            errorMessage.textContent = "L'image est trop volumineuse (Max. 4Mo)."
            imageContent.insertAdjacentElement("afterend", errorMessage)
            imageOk = false
        } else {
            if (errorMessage) errorMessage.remove()
            imageOk = true
        }
    } else {
        return
    }

    const titleOk = titleInput.value.trim() !== ""
    const categoryOk = categorySelect.value !== ""

    submitButton.disabled = !(imageOk && titleOk && categoryOk)
}

async function handleSubmitForm(event) {

    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)

    try {
        await sendNewWork(formData)
        cachedWorks = await getWorks()
        displayWorks(cachedWorks)
        closeModal()
    } catch (error) {
        console.error(error.message)
        alert("Erreur lors de l'ajout'")
    }
}

//Gestion des évenements

function bindGalleryEvents() {
    modal.addEventListener("click", closeModal)
    modal.querySelector(".js-modal-close").addEventListener("click", closeModal)
    modal.querySelector(".js-modal-stop").addEventListener("click", event => event.stopPropagation())
    modal.querySelector("#open-add-photo").addEventListener("click", renderModalUpload)
}

function bindUploadEvents() {
    modal.querySelector(".js-modal-close").addEventListener("click", closeModal)
    modal.querySelector(".js-modal-back").addEventListener("click", renderModalGallery)
    modal.querySelector(".js-modal-stop").addEventListener("click", e => e.stopPropagation())

    const form = modal.querySelector("#add-photo-form")
    const fileInput = form.querySelector("#upload-image")
    fileInput.addEventListener("change", showImagePreview)
    form.addEventListener("change", validateFormFields)
    form.addEventListener("submit", handleSubmitForm)
}