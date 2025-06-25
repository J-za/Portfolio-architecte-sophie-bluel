//Récupération des données travaux à partir de l'API
const travaux = []

async function chargerTravaux() {
    return fetch("http://localhost:5678/api/works").then(travaux => this.travaux = travaux.json())
}

//Affichage des travaux dans la galerie
function afficherTravaux(travaux) {
    const gallery = document.querySelector(".gallery") 

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

//Listener sur le chargement du DOM et appel de la fonction afficherTravaux
document.addEventListener("DOMContentLoaded", async () => {             
    afficherTravaux(await chargerTravaux())
})
