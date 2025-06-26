//Récupération des données travaux à partir de l'API

async function loadWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works")
        if(!response.ok) {
            throw new Error(`HTTP error : ${response.status}`)
        }
        const datas = await response.json()
        return datas
    } catch (error) {
        console.error(error.message)
    }

}

//Affichage des travaux dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector(".gallery")

    gallery.innerHTML =""

    works.forEach(work => {

        const workElement = document.createElement("figure")         //Création d'une balise figure

        const workImage = document.createElement("img")              //Création d'une balise img et récupération des informations associées
        workImage.src = work.imageUrl
        workImage.alt = work.title

        const workCaption = document.createElement("figcaption")       //Création d'une balise figcaption et récupération des informations associées 
        workCaption.innerText = work.title

        workElement.appendChild(workImage)                        //Rattachement des balises aux parents
        workElement.appendChild(workCaption)
        gallery.appendChild(workElement)
    })

}

//Création des boutons et gestion des filtres

function handleFilters(works) {

    const gallery = document.querySelector(".gallery")

    //-----------------Récupération des 3 catégories-----------------//

    const names = works.map(work => work.category.name);
    const setCategorie = new Set(names);
    const tableCategorie = [...setCategorie]


    //-----------------Création des boutons-----------------//

    const divButtons = document.createElement("div")
    divButtons.classList.add("button-content")

    const allButton = document.createElement("button")
    allButton.textContent = "Tous"
    allButton.classList.add("button")

    const objectsButton = document.createElement("button")
    objectsButton.textContent = tableCategorie[0]
    objectsButton.classList.add("button")

    const apartmentsButton = document.createElement("button")
    apartmentsButton.textContent = tableCategorie[1]
    apartmentsButton.classList.add("button")

    const hotelButton = document.createElement("button")
    hotelButton.textContent = tableCategorie[2]
    hotelButton.classList.add("button")

    divButtons.appendChild(allButton)
    divButtons.appendChild(objectsButton)
    divButtons.appendChild(apartmentsButton)
    divButtons.appendChild(hotelButton)
    gallery.insertAdjacentElement("beforebegin", divButtons)

    //-----------------Gestion des filtres-----------------//

    allButton.addEventListener("click", function () {
        gallery.innerHTML = ""
        displayWorks(works)
    })
    objectsButton.addEventListener("click", function () {
        const worksFilters = works.filter(work => work.category.id === 1)
        gallery.innerHTML = ""
        displayWorks(worksFilters)
    })
    apartmentsButton.addEventListener("click", function () {
        const worksFilters = works.filter(work => work.category.id === 2)
        gallery.innerHTML = ""
        displayWorks(worksFilters)
    })
    hotelButton.addEventListener("click", function () {
        const worksFilters = works.filter(work => work.category.id === 3)
        gallery.innerHTML = ""
        displayWorks(worksFilters)
    })
}

// Listener sur le chargement du DOM et appel des fonctions
document.addEventListener("DOMContentLoaded", async () => {
    const data = await loadWorks()
    displayWorks(data)
    handleFilters(data)
})
