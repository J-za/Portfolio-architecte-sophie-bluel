import { getWorks, deleteWork, sendNewWork, getCategories } from "./data.js"
import { displayWorks, handleFilters } from "./gallery.js"

let modal = null
const focusableSelector = "button, a, input, textarea"
let focusablesElement = []
let previouslyFocusedElement = null
const reader = new FileReader()
let form = null

/**
 * Fonction qui ouvre la modale lorsqu'un élément déclencheur est cliqué.
 * 
 * - Empêche le comportement par défaut du lien ou bouton déclencheur.
 * - Récupère la cible de la modale via l'attribut `data-target`.
 * - Charge dynamiquement le contenu de la modale via `loadModal(target)`.
 * - Affiche les éléments de la galerie avec `renderGallery()`.
 * - Récupère tous les éléments focusables de la modale pour gérer le focus clavier.
 * - Sauvegarde l'élément actuellement focusé avant l'ouverture de la modale (pour le restaurer à la fermeture).
 * - Affiche la modale (retire le style `display: none`).
 * - Donne immédiatement le focus au premier élément interactif de la modale.
 * - Met à jour les attributs ARIA pour l'accessibilité (`aria-hidden`, `aria-modal`).
 * - Ajoute un écouteur d’événement pour fermer la modale si on clique à l’extérieur.
 * - Appelle `bindModalEvents()` pour lier tous les autres événements spécifiques à la modale.
 */
async function openModal(event) {
    event.preventDefault()
    const target = event.currentTarget.getAttribute("data-target")
    modal = await loadModal(target)
    await renderGallery()
    focusablesElement = Array.from(modal.querySelectorAll(focusableSelector)).filter(element => element.style.display !== "none")
    previouslyFocusedElement = document.querySelector(":focus")
    modal.style.display = null
    focusablesElement[0].focus()
    modal.removeAttribute("aria-hidden")
    modal.setAttribute("aria-modal", "true")
    modal.addEventListener("click", closeModal)
    bindModalEvents()
    form = document.getElementById("add-photo-form")
}

/**
 * Ferme la fenêtre modale affichée à l'écran.
 * 
 * Fonction appelée lors d'un événement (ex: clic) pour fermer la modale.
 * - Si aucune modale n'est ouverte (modal === null), la fonction s'arrête.
 * - Si un élément avait le focus avant l'ouverture de la modale, il récupère le focus.
 * - Empêche le comportement par défaut de l'événement déclencheur.
 * - Met à jour les attributs ARIA pour indiquer que la modale est cachée et non modale.
 * - Supprime les écouteurs d'événements liés à la fermeture et l'interaction avec la modale.
 * - Lance une animation de fermeture, et une fois terminée, masque la modale en CSS,
 *   supprime l'écouteur d'animation, et réinitialise la variable modale à null.
 */
function closeModal(event) {
    if (modal === null) {
        return
    }
    if (previouslyFocusedElement !== null) {
        previouslyFocusedElement.focus()
    }
    event.preventDefault()
    modal.setAttribute("aria-hidden", "true")
    modal.removeAttribute("aria-modal")
    modal.removeEventListener("click", closeModal)
    modal.querySelector(".js-modal-close").removeEventListener("click", closeModal)
    modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation)
    const hideModal = function () {
        modal.style.display = "none"
        modal.removeEventListener("animationend", hideModal)
        modal = null
    }
    modal.addEventListener("animationend", hideModal)
}

/**
 * Empêche la propagation de l'événement courant vers les éléments parents.
 */
function stopPropagation(event) {
    event.stopPropagation()
}

/**
 * Gère le focus clavier (Tabulation) à l'intérieur de la modale pour le rendre "circulaire".
 * Cette fonction est appelée lors d'un appui sur Tab ou Shift+Tab :
 * - Elle empêche le comportement par défaut du navigateur (tabulation normale).
 * - Elle détermine quel élément est actuellement focusé dans la modale.
 * - Elle déplace le focus vers l'élément suivant (ou précédent si Shift est maintenu).
 * - Si on atteint le dernier élément, elle revient au premier (et inversement).
 * Cela permet de conserver le focus à l'intérieur de la modale, ce qui améliore
 * l'accessibilité pour les utilisateurs clavier.
 */
function focusInModal(event) {
    event.preventDefault()
    let index = focusablesElement.findIndex(f => f === modal.querySelector(":focus"))
    if (event.shiftKey === true) {
        index--
    } else {
        index++
    }
    if (index >= focusablesElement.length) {
        index = 0
    }
    if (index < 0) {
        index = focusablesElement.length - 1
    }
    focusablesElement[index].focus()
}

/**
 * Ajoute les gestionnaires d'événements à la modale :
 * 
 * - `.js-modal-close` : déclenche la fermeture de la modale au clic.
 * - `.js-modal-stop`  : empêche la propagation des clics pour éviter que l'événement
 *   ne ferme la modale lorsqu'on clique à l'intérieur.
 * - `.button-back`    : retourne à la galerie principale en appelant `renderGallery`.
 * 
 * Utilise l'opérateur optionnel `?.` pour éviter les erreurs si les éléments ne sont pas trouvés.
 * Le gestionnaire du bouton retour est désormais centralisé ici pour éviter les ajouts répétés.
 */
function bindModalEvents() {
    modal.querySelector(".js-modal-close")?.addEventListener("click", closeModal)
    modal.querySelector(".js-modal-stop")?.addEventListener("click", stopPropagation)
    document.querySelector(".button-back").addEventListener("click", handleBackToGallery)
    document.getElementById("open-add-photo").addEventListener("click", showAddPhotoView)
}

function handleBackToGallery() {
    renderGallery()
    resetForm()
}

/**
 * Charge dynamiquement une modale depuis une URL donnée.
 * 
 * - Extrait l'identifiant (id) de la modale depuis la partie ancre (#id) de l'URL.
 * - Vérifie si un élément avec cet id existe déjà dans le DOM ; si oui, le retourne directement.
 * - Sinon, récupère le contenu HTML de l'URL via une requête fetch asynchrone.
 * - Parse le HTML reçu et extrait l'élément correspondant à l'id ciblé.
 * - Si l'élément n'est pas trouvé dans le contenu chargé, une erreur est levée.
 * - Sinon, l'élément est ajouté dans le <body> du document.
 * - Retourne la référence à cet élément modale ajouté ou existant.
 */
async function loadModal(url) {
    const target = "#" + url.split("#")[1]
    const existingModal = document.querySelector(target)
    if (existingModal !== null) return existingModal
    const response = await fetch(url)
    const html = await response.text()
    const element = document.createRange().createContextualFragment(html).querySelector(target)
    if (element === null) throw new Error(`L'élément ${target} n'a pas été trouvé dans la page ${url}`)
    document.body.append(element)
    return element
}

/**
 * Affiche une galerie de travaux (works) dans la modale.
 * 
 * - Vide le contenu actuel de la zone de la galerie dans la modale (élément avec la classe `.grid-content`).
 * - Pour chaque objet `work` passé en paramètre :
 *   - Crée un élément `<article>` avec la classe `image-container`.
 *   - Crée une image `<img>` avec la source et le texte alternatif correspondant aux données du travail.
 *   - Crée un bouton de suppression avec une icône "poubelle" (FontAwesome).
 *   - Associe un écouteur d'événement au bouton pour gérer la suppression via `handleDeleteClick` en utilisant l'id du travail.
 *   - Assemble ces éléments et les ajoute à la galerie dans la modale.
 */
function displayWorksModale(works) {
    const modalGallery = document.querySelector(".grid-content")

    modalGallery.innerHTML = ""

    works.forEach(work => {

        const workElement = document.createElement("article")
        workElement.classList.add("image-container")

        const workImage = document.createElement("img")
        workImage.classList.add("image-container")
        workImage.src = work.imageUrl
        workImage.alt = work.title

        const workButton = document.createElement("button")
        workButton.classList.add("delete-button")

        const iconButton = document.createElement("i")
        iconButton.classList.add("fa-solid")
        iconButton.classList.add("fa-trash-can")

        workButton.addEventListener("click", () => handleDeleteClick(work.id))

        workElement.appendChild(workImage)
        workElement.appendChild(workButton)
        workButton.appendChild(iconButton)
        modalGallery.appendChild(workElement)
    })

}

/**
 * Charge et affiche la galerie de travaux.
 * 
 * - Affiche la vue principale de la galerie (via `showGalleryView`).
 * - Récupère les données des travaux de façon asynchrone (`getWorks`).
 * - Affiche les travaux dans la modale (`displayWorksModale`).
 * - Affiche les travaux dans la galerie principale (`displayWorks`).
 * - Initialise les filtres fonctionnels sur les travaux (`handleFilters`).
 */
async function renderGallery() {
    showGalleryView()
    const data = await getWorks()
    displayWorksModale(data)
    displayWorks(data)
}

/**
 * Valide les champs du formulaire d'ajout de photo et active/désactive le bouton de soumission.
 * 
 * - Récupère le formulaire et le bouton de soumission dans le DOM.
 * - Si l’un ou l’autre n’existe pas, la fonction s’arrête.
 * - Récupère les champs image (input type file), titre (input text) et catégorie (select).
 * - Vérifie que :
 *   • un fichier image est sélectionné,
 *   • un titre non vide est renseigné,
 *   • une catégorie est choisie.
 * - Active le bouton de soumission seulement si tous les champs sont valides,
 *   sinon le désactive.
 */
function validateFormFields() {

    const submitButton = document.getElementById("add-to-gallery")

    if (!form || !submitButton) return

    const imageInput = form.querySelector('input[name="image"]')
    const titleInput = form.querySelector('input[name="title"]')
    const categorySelect = form.querySelector('select[name="category"]')

    if (!imageInput || !titleInput || !categorySelect) return

    const image = imageInput.files.length > 0
    const title = titleInput.value.trim() !== ""
    const category = categorySelect.value !== ""

    submitButton.disabled = !(image && title && category)
}

/**
 * Permet d'afficher un aperçu (preview) de l'image sélectionnée dans le champ fichier.
 * 
 * - Récupère l'input de type fichier et le conteneur où afficher l'aperçu.
 * - Lorsqu'un fichier est sélectionné (événement "change") :
 *   • Vérifie qu'un fichier existe et qu'il s'agit bien d'une image.
 *   • Cache le label personnalisé et le texte d'information.
 *   • Supprime la précédente image d'aperçu si elle existe.
 *   • Utilise un FileReader pour lire le fichier image en Data URL.
 *   • À la fin de la lecture, crée une image avec la source correspondante,
 *     ajoute une classe pour le style et un attribut alt.
 *   • Permet de cliquer sur l'image d'aperçu pour rouvrir la sélection de fichier.
 *   • Ajoute l'image d'aperçu dans le conteneur.
 */
function uploadImageViewer() {

    const fileInput = document.getElementById("upload-image")
    const uploadContent = document.querySelector(".upload-content")

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0]
        if (!file || !file.type.startsWith("image/")) return

        const label = document.querySelector(".custom-file-label")
        const infoText = uploadContent.querySelector("p")
        label.style.display = "none"
        infoText.style.display = "none"

        reader.readAsDataURL(file)
        reader.onload = function (event) {
            const previousPreview = uploadContent.querySelector("img.preview-image")
            if (previousPreview) {
                previousPreview.remove()
            }
            const img = document.createElement("img")
            console.log(event.target.result)
            img.src = event.target.result
            img.alt = "Apercu de l'image"
            img.classList.add("preview-image")

            img.addEventListener("click", () => fileInput.click())

            uploadContent.appendChild(img)
        }
    })
}

/**
 * Affiche la vue principale de la galerie photo dans la modale.
 * 
 * - Affiche la section de la galerie photo (`#modal-gallery-view`).
 * - Cache la section d'ajout de photo (`#modal-add-photo-view`).
 * - Cache le bouton de retour (`.button-back`).
 * - Met à jour le titre de la modale avec "Galerie photo".
 * - Ajoute un écouteur au bouton d'ouverture du formulaire d'ajout pour
 *   basculer vers la vue d'ajout de photo.
 */
function showGalleryView() {
    document.getElementById("modal-gallery-view").style.display = "block"
    document.getElementById("modal-add-photo-view").style.display = "none"
    document.querySelector(".button-back").style.display = "none"
    document.getElementById("title-modal").textContent = "Galerie photo"
}

/**
 * Affiche la vue d'ajout de photo dans la modale et initialise les éléments nécessaires.
 * 
 * - Cache la vue principale de la galerie photo.
 * - Affiche la section d'ajout de photo.
 * - Affiche le bouton de retour.
 * - Met à jour le titre de la modale avec "Ajout photo".
 * - Récupère la liste des catégories via une requête asynchrone (`getCategories`).
 * - Vide et remplit le menu déroulant des catégories avec une option par défaut vide,
 *   puis ajoute les options correspondant aux catégories récupérées.
 * - Ajoute un écouteur sur le bouton retour pour revenir à la galerie via `renderGallery`.
 * - Lie les événements d'entrée et de changement du formulaire pour valider les champs.
 * - Lance une validation initiale du formulaire.
 * - Initialise la prévisualisation d’image lors du chargement d’un fichier (`uploadImageViewer`).
 * - Initialise le traitement de l’ajout de nouvelle photo (`addNewPhoto`).
 */
async function showAddPhotoView() {
    document.getElementById("modal-gallery-view").style.display = "none"
    const modalContent = document.getElementById("modal-add-photo-view")
    modalContent.style.display = "block"
    document.querySelector(".button-back").style.display = "block"
    document.getElementById("title-modal").textContent = "Ajout photo"

    const categories = await getCategories()

    const select = modalContent.querySelector("#category")
    select.innerHTML = ""

    const defaultOption = document.createElement("option")
    defaultOption.value = ""
    defaultOption.textContent = ""
    defaultOption.disabled = true
    defaultOption.selected = true
    select.appendChild(defaultOption)

    categories.forEach(category => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        select.appendChild(option)
    })

    form.addEventListener("input", validateFormFields)
    form.addEventListener("change", validateFormFields)

    uploadImageViewer()

    bindFormEvents()
}

/**
 * Gère la suppression d’un travail (work) puis met à jour la galerie.
 * 
 * - Appelle la fonction asynchrone `deleteWork` pour supprimer l’élément par son `id`.
 * - Une fois la suppression réussie, recharge la galerie avec `renderGallery`.
 * - En cas d’erreur, affiche un message d’erreur dans la console et une alerte utilisateur.
 */
async function handleDeleteClick(id) {
    try {
        await deleteWork(id)
        await renderGallery()
    } catch (error) {
        console.error(error.message)
        alert("Erreur lors de la suppression")
    }
}

/**
 * Attache le gestionnaire de soumission du formulaire d'ajout de photo.
 * 
 * - Supprime au préalable tout écouteur existant pour éviter les doublons.
 * - Ajoute un écouteur sur l'événement "submit" du formulaire `#add-photo-form`.
 * - Garantit que `handleSubmitForm` ne sera attaché qu'une seule fois, même si cette fonction est rappelée plusieurs fois.
 */
function bindFormEvents() {
    form.removeEventListener("submit", handleSubmitForm)
    form.addEventListener("submit", handleSubmitForm)
}

/**
 * Gère la soumission du formulaire d'ajout de photo.
 * 
 * - Empêche le rechargement de la page à la soumission.
 * - Récupère les données du formulaire sous forme de FormData.
 * - Envoie les données via `sendNewWork` (requête POST vers l'API).
 * - En cas de succès :
 *    - Met à jour la galerie avec `renderGallery`.
 *    - Réinitialise le formulaire.
 *    - Supprime l'aperçu de l'image si présent.
 *    - Réaffiche le label et le texte d'information du champ fichier.
 * - En cas d'erreur : 
 *    - Affiche un message d'erreur dans la console.
 *    - Affiche une alerte utilisateur.
 */
async function handleSubmitForm(event) {

    event.preventDefault()

    const formData = new FormData(form)

    try {
        await sendNewWork(formData)
        await renderGallery()
        resetForm()
    } catch (error) {
        console.error(error.message)
        alert("Erreur lors de l'ajout'")
    }
}

function resetForm() {
    form.reset()
    const preview = document.querySelector(".preview-image")
    if (preview) preview.remove()
    const label = document.querySelector(".custom-file-label")
    const infoText = document.querySelector(".upload-content p")
    label.style.display = "flex"
    infoText.style.display = "block"
}

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', openModal)
})

window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
        closeModal(event)
    }
    if (event.key === "Tab" && modal !== null) {
        focusInModal(event)
    }
})