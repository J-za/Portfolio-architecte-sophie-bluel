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
function afficherTravaux(travaux) {
    const gallery = document.querySelector(".gallery")

    gallery.innerHTML =""
    
    travaux.forEach(travail => {

        const travauxElement = document.createElement("figure")         //Création d'une balise figure

        const imageTravaux = document.createElement("img")              //Création d'une balise img et récupération des informations associées
        imageTravaux.src = travail.imageUrl
        imageTravaux.alt = travail.title

        const titreTravaux = document.createElement("figcaption")       //Création d'une balise figcaption et récupération des informations associées 
        titreTravaux.innerText = travail.title

        travauxElement.appendChild(imageTravaux)                        //Rattachement des balises aux parents
        travauxElement.appendChild(titreTravaux)
        gallery.appendChild(travauxElement)
    })

}

//Création des boutons et gestion des filtres

function gestionFiltres(travaux) {

    const gallery = document.querySelector(".gallery")

    //-----------------Récupération des 3 catégories-----------------//

    const names = travaux.map(travail => travail.category.name);
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
        afficherTravaux(travaux)
    })
    objectsButton.addEventListener("click", function () {
        const travauxFiltres = travaux.filter(travail => travail.category.id === 1)
        gallery.innerHTML = ""
        afficherTravaux(travauxFiltres)
    })
    apartmentsButton.addEventListener("click", function () {
        const travauxFiltres = travaux.filter(travail => travail.category.id === 2)
        gallery.innerHTML = ""
        afficherTravaux(travauxFiltres)
    })
    hotelButton.addEventListener("click", function () {
        const travauxFiltres = travaux.filter(travail => travail.category.id === 3)
        gallery.innerHTML = ""
        afficherTravaux(travauxFiltres)
    })
}

// Listener sur le chargement du DOM et appel des fonctions
document.addEventListener("DOMContentLoaded", async () => {
    const data = await loadWorks()
    afficherTravaux(data)
    gestionFiltres(data)
})
