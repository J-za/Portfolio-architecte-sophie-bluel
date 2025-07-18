//Création des messages d'erreur
export function createFieldError(field, message) {
    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains("error-message")) {
        const errorMessage = document.createElement("p")
        errorMessage.classList.add("error-message")
        errorMessage.textContent = message
        field.insertAdjacentElement("afterend", errorMessage)
    }
}

export function clearFieldError(field) {
    const next = field.nextElementSibling
    if (next && next.classList.contains("error-message")) {
        next.remove()
    }
}

// Validation champs Login
export function validateEmailField() {
    const form = document.querySelector("#connect-form")
    const emailInput = form.querySelector('input[name="email"]')

    if (!emailInput) return

    const emailOk = emailInput.value.trim() !== ""

    if (!emailOk) {
        createFieldError(emailInput, "L'email est obligatoire.")
    } else {
        clearFieldError(emailInput)
        return emailOk
    }
}

export function validatePasswordField() {
    const form = document.querySelector("#connect-form")
    const passwordInput = form.querySelector('input[name="password"]')
    const passwordContainer = document.querySelector(".password-container")

    if (!passwordInput) return

    const passwordOk = passwordInput.value.trim() !== ""

    if (!passwordOk) {
        createFieldError(passwordContainer, "Le mot de passe est obligatoire.")
    } else {
        clearFieldError(passwordContainer)
        return passwordOk
    }
}

//Validation champs Envoi 
export function validateImageField() {
    let imageOk = false
    const form = document.querySelector("#add-photo-form")
    const imageContent = document.querySelector(".upload-content")
    const imageInput = form.querySelector('input[name="image"]')

    if (!imageInput) return

    const image = imageInput.files[0]
    const acceptedTypes = imageInput.accept.split(",").map(type => type.trim())

    if (imageInput.files.length > 0) {
        clearFieldError(imageContent)

        const isImage = acceptedTypes.includes(image.type)
        const isUnder4MB = image.size <= 4 * 1024 * 1024

        if (!isImage) {
            createFieldError(imageContent, "Format non supporté. Veuillez choisir un fichier JPG ou PNG.")
            imageOk = false
        } else if (!isUnder4MB) {
            createFieldError(imageContent, "L'image est trop volumineuse (Max. 4Mo).")
            imageOk = false
        } else {
            clearFieldError(imageContent)
            imageOk = true
        }
    } else {
        createFieldError(imageContent, "Veuillez sélectionner une image.")
        imageOk = false
    }

    return imageOk
}

export function validateTitleField() {
    const form = document.querySelector("#add-photo-form")
    const titleInput = form.querySelector('input[name="title"]')

    if (!titleInput) return

    const titleOk = titleInput.value.trim() !== ""

    if (!titleOk) {
        createFieldError(titleInput, "Le titre est obligatoire.")
    } else {
        clearFieldError(titleInput)
    }

    return titleOk
}

export function validateCategoryField() {
    const form = document.querySelector("#add-photo-form")
    const categorySelect = form.querySelector('select[name="category"]')
    const categoryContainer = document.querySelector(".select-wrapper")

    if (!categorySelect) return

    const categoryOk = categorySelect.value !== ""

    if (!categoryOk) {
        createFieldError(categoryContainer, "Veuillez choisir une catégorie.")
    } else {
        clearFieldError(categoryContainer)
    }

    return categoryOk
}