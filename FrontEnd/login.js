let errorMessage = null

async function handleLoginFormSubmit() {

    const form = document.querySelector("form")

    togglePasswordView()

    form.addEventListener("submit", async (event) => {
        event.preventDefault()
        const email = document.querySelector("#email").value
        const password = document.querySelector("#password").value
        const passwordContainer = document.querySelector(".password-container")

        const success = await loginUser(email, password)


        if (!success) {
            if(errorMessage) return
            errorMessage = document.createElement("p")
            errorMessage.innerText = "E-mail ou mot de passe incorrect."
            errorMessage.classList.add("error-message")
            passwordContainer.insertAdjacentElement("afterend", errorMessage)
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