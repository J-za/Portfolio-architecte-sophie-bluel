let worksCache = null

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

export async function deleteWork(id) {

    const token = sessionStorage.getItem("token")

    try{
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "*/*"
            }
        })
        if(!response.ok) {
            throw new Error("Echec de la suppression")
        }
        worksCache = null
        return response
    } catch (error) {
        console.error(error.message)
    }
}