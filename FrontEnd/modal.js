import { getWorks, deleteWork, sendNewWork, getCategories } from "./data.js"
import { displayWorks } from "./gallery.js"
import { validateImageField, validateTitleField, validateCategoryField} from "./validator.js"

let modal = null
let confirmPopUp = null
let cachedWorks = []

//Ouverture/fermeture de la modale
export function openModal() {
    modal = document.getElementById("modal")
    renderModalGallery()
    modal.showModal()
    modal.classList.remove("fade-out")
    modal.classList.add("fade-in")

    modal.addEventListener("animationend", function handleOpen() {
        modal.classList.remove("fade-in")
        modal.removeEventListener("animationend", handleOpen)
    })
}

function closeModal() {
    if (!modal) {
        return
    }

    modal.classList.remove("fade-in")
    modal.classList.add("fade-out")

    modal.addEventListener("animationend", function handleClose() {
        modal.close()
        modal.classList.remove("fade-out")
        modal.removeEventListener("animationend", handleClose)
        modal.innerHTML = ""
        modal = null
    })
}

//Création du rendu modale
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

//Affichage et action modale Galerie
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
        workElement.setAttribute("data-id", work.id)

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

function createConfirmModal() {
    confirmPopUp = document.createElement("div")
    confirmPopUp.id = "confirm-popup"
    confirmPopUp.innerHTML = `
    <div class="confirm-box js-confirm-stop">
        <p>Êtes-vous sur de vouloir supprimer ce projet ?</p>
        <div class="confirm-button">
            <button id="confirm-yes">Confirmer</button>
            <button id="confirm-no">Annuler</button>
        </div>
    </div>
    `
    modal.appendChild(confirmPopUp)

    bindConfirmEvents()
}

function deleteConfirmModal() {
    if (confirmPopUp) {
        confirmPopUp.remove()
    }
}

async function deleteWorks(id) {

    createConfirmModal()

    const userConfirmed = await new Promise((resolve) => {
        const confirmYes = document.getElementById("confirm-yes")
        const confirmNo = document.getElementById("confirm-no")

        confirmYes.addEventListener("click", (event) => {
            event.stopPropagation()
            resolve(true)
        })

        confirmNo.addEventListener("click", (event) => {
            event.stopPropagation()
            resolve(false)
        })
    })

    if (!userConfirmed) {
        deleteConfirmModal()
        return
    }

    try {
        await deleteWork(id)
        cachedWorks = cachedWorks.filter(work => work.id !== id)
        const delElemGallery = document.querySelector(`figure[data-id="${id}"]`)
        const delElemModal = document.querySelector(`article[data-id="${id}"]`)
        delElemGallery.remove()
        delElemModal.remove()
        deleteConfirmModal()
    } catch (error) {
        console.error(error.message)
        alert("Erreur lors de la suppression")
    }
}

//Affichage et action modale Nouveau travail
async function renderModalUpload() {

    const uploadHTML = `
                <h1 id="title-modal">Ajout photo</h1>
            <form action="#" id="add-photo-form">
                <div class="upload-content">
                    <label for="upload-image" class="custom-file-label">
                        <i class="fa-regular fa-image"></i>
                        <span>+ Ajouter photo*</span>
                    </label>
                    <input type="file" id="upload-image" name="image" accept="image/jpeg, image/png">
                    <p>.jpg, .png - 4mo max</p>
                </div>
                <label for="title">Titre*</label>
                <input type="text" name="title">
                <label for="category">Catégorie*</label>
                <select name="category" id="category">

                </select>
            </form>
            <div class="add-button-content">
                <button type="submit" form="add-photo-form" id="add-to-gallery" class="add-button inactive">Valider</button>
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
    const form = document.querySelector("#add-photo-form")
    const submitButton = modal.querySelector("#add-to-gallery")

    if (!form || !submitButton) return

    const imageOk = validateImageField()

    const titleOk = validateTitleField()

    const categoryOk = validateCategoryField()

    const isValid = imageOk && titleOk && categoryOk

    submitButton.classList.toggle("inactive", !isValid)

    return isValid;
}

async function handleSubmitForm(event) {

    event.preventDefault()

    const isFormValid = validateFormFields();

    if (!isFormValid) {
        return;
    }

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

function bindConfirmEvents() {
    confirmPopUp.querySelector(".js-confirm-stop").addEventListener("click", event => event.stopPropagation())
}

function bindUploadEvents() {
    modal.querySelector(".js-modal-close").addEventListener("click", closeModal)
    modal.querySelector(".js-modal-back").addEventListener("click", renderModalGallery)
    modal.querySelector(".js-modal-stop").addEventListener("click", e => e.stopPropagation())

    const form = modal.querySelector("#add-photo-form")
    const fileInput = form.querySelector("#upload-image")
    const imageInput = form.querySelector('input[name="image"]')
    const titleInput = form.querySelector('input[name="title"]')
    const categorySelect = form.querySelector('select[name="category"]')

    fileInput.addEventListener("change", showImagePreview)
    form.addEventListener("submit", handleSubmitForm)
    imageInput.addEventListener("change", validateImageField)
    titleInput.addEventListener("blur", validateTitleField)
    categorySelect.addEventListener("blur", validateCategoryField)
}