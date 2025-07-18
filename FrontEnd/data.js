let worksCache = null
let categoriesCache = null
const token = sessionStorage.getItem("token")

//Appel API
export async function getWorks() {
    if (worksCache) {
        return worksCache
    }
    try {
        const response = await fetch("http://localhost:5678/api/works")
        if (!response.ok) {
            throw new Error(`HTTP error : ${response.status}`)
        }
        worksCache = await response.json()
        return worksCache
    } catch (error) {
        console.error(error.message)
    }

}

export async function getCategories() {
    if (categoriesCache) {
        return categoriesCache
    }
    try {
        const response = await fetch("http://localhost:5678/api/categories")
        if(!response.ok) {
            throw new Error(`HTTP error : ${response.status}`)
        }
        categoriesCache = await response.json()
        return categoriesCache
    } catch (error) {
        console.error(error.message)
    }
}

export async function loginUser(email, password) {

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

export async function deleteWork(id) {

    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "*/*"
            }
        })
        if (!response.ok) {
            throw new Error("Echec de la suppression")
        }
        return response
    } catch (error) {
        console.error(error.message)
    }
}

export async function sendNewWork(formData) {

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "*/*"
            },
            body: formData
        })
        if (!response.ok) {
            throw new Error("Echec de l'envoi")
        }
        categoriesCache = null
        worksCache = null
        const newWork = await response.json()
        console.log("Nouveau projet ajouté :", newWork)
        return newWork
    } catch (error) {
        console.error(error.message)
    }
}