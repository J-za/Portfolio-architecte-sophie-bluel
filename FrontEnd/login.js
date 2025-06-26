async function handleLoginFormSubmit() {

    const form = document.querySelector("form")

    form.addEventListener("submit", async (event) => {
        event.preventDefault()
        const email = document.querySelector("#email").value
        const password = document.querySelector("#password").value

        await loginUser(email, password)
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
        sessionStorage.setItem('token', data.token)
        window.location.href ="index.html"
    } catch (error) {
        alert("E-mail ou mot de passe incorrect")
        console.error(error.message)
    }

}

document.addEventListener("DOMContentLoaded", () => {
    handleLoginFormSubmit()
})