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