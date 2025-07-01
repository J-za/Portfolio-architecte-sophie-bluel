async function handleLoginFormSubmit() {

    const form = document.querySelector("form")

    togglePasswordView()

    form.addEventListener("submit", async (event) => {
        event.preventDefault()
        const email = document.querySelector("#email").value
        const password = document.querySelector("#password").value
        const emailContent = document.querySelector("#email")
        const passwordContent = document.querySelector("#password")
        const errorMessage = document.querySelector(".error-message")

        const success = await loginUser(email, password)


        if (!success) {
            errorMessage.textContent = "E-mail ou mot de passe incorrect."
            emailContent.classList.add("error")
            passwordContent.classList.add("error")
        } else {
            sessionStorage.setItem('token', success.token)
            window.location.href = "index.html"
        }

    })

}

async function loginUser(email, password) {

    const payload = { email, password }

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        if (!response.ok) {
            throw new Error(`HTTP error : ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error.message)
    }

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

document.addEventListener("DOMContentLoaded", () => {
    handleLoginFormSubmit()
})