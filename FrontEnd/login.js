import { createFieldError, validateEmailField, validatePasswordField } from "./validator.js"
import { loginUser } from "./data.js"

//Gestion du formulaire d'envoi
async function handleLoginFormSubmit() {

    const form = document.querySelector("#connect-form")

    togglePasswordView()

    const emailInput = form.querySelector('input[name="email"]')
    const passwordInput = form.querySelector('input[name="password"]')

    emailInput.addEventListener("blur", validateEmailField)
    passwordInput.addEventListener("blur", validatePasswordField)

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        if (!validateLoginFields()) return

        const email = emailInput.value
        const password = passwordInput.value
        const passwordContainer = document.querySelector(".password-container")

        const success = await loginUser(email, password)

        if (!success) {
            createFieldError(passwordContainer, "E-mail ou mot de passe incorrect.")
        } else {
            sessionStorage.setItem('token', success.token)
            window.location.href = "index.html"
        }

    })

}

function togglePasswordView() {
    const passwordInput = document.getElementById("password")
    const togglePassword = document.getElementById("toggle-password")

    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "texte"
            togglePassword.classList.remove("fa-eye")
            togglePassword.classList.add("fa-eye-slash")

        } else {
            passwordInput.type = "password"
            togglePassword.classList.add("fa-eye")
            togglePassword.classList.remove("fa-eye-slash")
        }
    })
}

function validateLoginFields() {
    let isValid = true

    if (!validateEmailField() || !validatePasswordField()) {
        isValid = false
    } 

    return isValid
}

//Gestion des évenements
document.addEventListener("DOMContentLoaded", () => {
    handleLoginFormSubmit()
})

