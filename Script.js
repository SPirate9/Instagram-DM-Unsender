// ==UserScript==
// @name         Instagram DM Unsender
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Ajoute un bouton "Unsend All Messages" à la page Instagram lors d'une conversation, permettant de supprimer tous les messages d'une conversation en un seul clic.
// @match        https://www.instagram.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const BUTTON_STYLE = {
        "PRIMARY": "primary",
        "SECONDARY": "secondary",
    };

    function applyButtonStyle(buttonElement, styleName=BUTTON_STYLE.PRIMARY) {
        buttonElement.style.fontSize = "var(--system-14-font-size)";
        buttonElement.style.color = "white";
        buttonElement.style.border = "0px";
        buttonElement.style.borderRadius = "8px";
        buttonElement.style.padding = "8px";
        buttonElement.style.fontWeight = "bold";
        buttonElement.style.cursor = "pointer";
        buttonElement.style.lineHeight = "var(--system-14-line-height)";
        buttonElement.style.backgroundColor = `rgb(var(--ig-${styleName}-button))`;
    }

    function createMenuButtonElement(document, text, styleName) {
        const buttonElement = document.createElement("button");
        buttonElement.textContent = text;
        applyButtonStyle(buttonElement, styleName);
        buttonElement.addEventListener("mouseover", () => {
            buttonElement.style.filter = `brightness(1.15)`;
        });
        buttonElement.addEventListener("mouseout", () => {
            buttonElement.style.filter = ``;
        });
        buttonElement.addEventListener('click', () => {
            // Exécute ton code ici
            runLoop();
        });
        return buttonElement;
    }

    function createMenuElement(document) {
        const menuElement = document.createElement("div");
        menuElement.style.top = "20px";
        menuElement.style.right = "430px";
        menuElement.style.position = "fixed";
        menuElement.style.zIndex = 999;
        menuElement.style.display = "flex";
        menuElement.style.gap = "10px";
        return menuElement;
    }

    function addMenuToDocument(document) {
        const menuElement = createMenuElement(document);

        const primaryButton = createMenuButtonElement(document, 'Unsend All Messages', BUTTON_STYLE.PRIMARY);

        menuElement.appendChild(primaryButton);

        document.body.appendChild(menuElement);
    }

    function findLastMessageElement(elements) {
    var lastMessageElement = null;

    Array.from(elements).forEach(function(element) {
        var attributes = element.attributes;
        if (!("notownedmessage" in attributes)) {
            var roleAttribute = attributes.getNamedItem('role');
            var ariaLabelAttribute = attributes.getNamedItem('aria-label');

            if (roleAttribute && ariaLabelAttribute) {
                var roleIndex = Array.from(attributes).indexOf(roleAttribute);
                var ariaLabelIndex = Array.from(attributes).indexOf(ariaLabelAttribute);

                if (roleIndex < ariaLabelIndex) {
                    lastMessageElement = element;
                }
            }
        }
    });

    if (lastMessageElement === null) {
        console.log("No matching element found.");
        active = false;
    }

    return lastMessageElement;
}

    function simulateMouseHover(element) {
    element.setAttribute('notownedmessage', true);
    element.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
    });

    var event = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    element.dispatchEvent(event);
    findDivWithThreeCircles();
}

    function waitForElementToExist(callback, maxAttempts = false) {
    let attemptCount = 0;

    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const resultElement = callback();
            if (resultElement) {
                clearInterval(interval);
                resolve(resultElement);
            } else if (resultElement === undefined) {
                clearInterval(interval);
                findDivWithThreeCircles(true);
                reject(new Error('Element not found after undefined result.'));
            } else {
                attemptCount++;

                if (maxAttempts !== false && attemptCount >= maxAttempts) {
                    clearInterval(interval);
                    reject(new Error(`Element not found after ${maxAttempts} attempts.`));
                    finishedSimulateMouseHover = true;
                } else {
                    console.log(`Element not found yet. Attempt ${attemptCount}`);
                }
            }
        }, 100);
    });
}

    function findDivWithThreeCircles(close = false) {
    const resultPromise = waitForElementToExist(() => {
        const svgElement = document.querySelector('div[role="button"] svg circle:nth-of-type(1) + circle + circle');

        if (svgElement) {
            const targetDiv = svgElement.closest('div[role="button"]');
            return targetDiv || null;
        }

        return null;
    }, 10);

    resultPromise.then((targetDiv) => {
        targetDiv.click();
        if (!close) {
            findMenuItemAndClick();
        }
    }).catch((error) => {
        console.error(error);
    });
}

    function findMenuItemAndClick() {
    const resultPromise = waitForElementToExist(() => {
        const menuItems = document.querySelectorAll('div[role="menuitem"]');
        let matchCounter = 0;

        for (const menuItem of menuItems) {
            matchCounter++;

            if (matchCounter === 3) {
                const parentDiv = menuItem.parentElement;
                if (parentDiv.getAttribute('role') === 'none') {
                    return menuItem;
                } else {
                    console.log('The parent div of the third menu item does not have role="none"');
                    finishedSimulateMouseHover = true;
                    return undefined;
                }
            }

            if (menuItems.length === 2) {
                const singleMenuItem = menuItems[1];
                const parentDiv = singleMenuItem.parentElement;
                if (parentDiv.getAttribute('role') === 'none') {
                    return singleMenuItem;
                } else {
                    console.log('The parent div of the single menu item does not have role="none"');
                    finishedSimulateMouseHover = true;
                    return undefined;
                }
            }

            if (menuItems.length === 1) {
                const singleMenuItem = menuItems[0];
                const parentDiv = singleMenuItem.parentElement;
                if (parentDiv.getAttribute('role') === 'none') {
                    return singleMenuItem;
                } else {
                    console.log('The parent div of the single menu item does not have role="none"');
                    finishedSimulateMouseHover = true;
                    return undefined;
                }
            }

        }
    });

    resultPromise.then((menuItem) => {
        menuItem.click();
        clickFirstButtonInLastDialog();
    });
}

    function clickFirstButtonInLastDialog() {
    const resultPromise = waitForElementToExist(() => {
        const dialogDivs = document.querySelectorAll('div[role="dialog"]');

        const lastDialogDiv = dialogDivs.length > 0 ? dialogDivs[dialogDivs.length - 1] : null;

        const firstButton = lastDialogDiv ? lastDialogDiv.querySelector('button') : null;

        return firstButton;
    });

    resultPromise.then((firstButton) => {
        firstButton.click();
        if (document.contains(message)) {
            console.log("Message delete successfully.")
            finishedSimulateMouseHover = true;
        }
        else {
            console.log("Not deleted.")
            messageElement.removeAttribute('notownedmessage');
            setTimeout(() => {
                finishedSimulateMouseHover = true;
            }, 300000)
        }
    });
}

    let active = true;
    let finishedSimulateMouseHover = true;
    let message;

    function runLoop() {
      if (active) {
        setTimeout(() => {
          if (finishedSimulateMouseHover) {
            finishedSimulateMouseHover = false;
            message = findLastMessageElement(document.querySelectorAll('[tabindex="0"]'));
            simulateMouseHover(message);
          }

          runLoop();
        }, 1000);
      }
    }

    addMenuToDocument(document);
})();
