console.log("modal.js chargé")

let modal = null
const focusableSelector = "button, a, input, textarea"
let focusablesElement = []
let previouslyFocusedElement = null

async function openModal(event) {
    event.preventDefault()
    const target = event.currentTarget.getAttribute("data-target")
    modal = await loadModal(target)
    focusablesElement = Array.from(modal.querySelectorAll(focusableSelector))
    previouslyFocusedElement = document.querySelector(":focus")
    modal.style.display = null
    focusablesElement[0].focus()
    modal.removeAttribute("aria-hidden")
    modal.setAttribute("aria-modal", "true")
    modal.addEventListener("click", closeModal)
    modal.querySelector(".js-modal-close").addEventListener("click", closeModal)
    modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation)
}

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

function stopPropagation(event) {
    event.stopPropagation()
}

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

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.js-modal').forEach(a => {
        a.addEventListener('click', openModal)
    })
})

window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
        closeModal(event)
    }
    if (event.key === "Tab" && modal !== null) {
        focusInModal(event)
    }
})