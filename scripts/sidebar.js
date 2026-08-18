/*
 Remover cada Div
 Botao para remover todas de uma vez
 Se todas estiverem desativadas, tirar a div pai
*/

function removeSections() {
    const desiredDivs = document.querySelectorAll('#app-main .space-y-4 .relative.flex.w-full.max-w-full.flex-col.flex-nowrap.gap-4.lg\\:flex-row.lg\\:justify-between .relative.flex.w-full.min-w-0.flex-none.flex-col.flex-nowrap.gap-y-4.lg\\:w-\\[400px\\]');

    if (desiredDivs.length > 0) {
        desiredDivs.forEach(function(div) {
            div.style.display = 'none';
        });
    }
    chrome.storage.local.set({ sidebar: "off" });
}

function restoreSections() {
    const desiredDivs = document.querySelectorAll('#app-main .space-y-4 .relative.flex.w-full.max-w-full.flex-col.flex-nowrap.gap-4.lg\\:flex-row.lg\\:justify-between .relative.flex.w-full.min-w-0.flex-none.flex-col.flex-nowrap.gap-y-4.lg\\:w-\\[400px\\]');

    if (desiredDivs.length > 0) {
        desiredDivs.forEach(function(div) {
            div.style.display = '';
        });
    }
    chrome.storage.local.set({ sidebar: "on" });
}

let styleObserver = null;
let removedStyleSheet = null;
let removedStyleSheetParent = null;

function removeStyle() {
    const stylesheetId = 'theme-css';

    const removeStylesheet = () => {
        const stylesheet = document.getElementById(stylesheetId);
        if (stylesheet) {
            removedStyleSheet = stylesheet.cloneNode(true);
            removedStyleSheetParent = stylesheet.parentNode;
            stylesheet.remove();
        }
    };
    removeStylesheet();

    if (!styleObserver) {
        styleObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    removeStylesheet();
                }
            }
        });

        styleObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }

    chrome.storage.local.set({ style: "off" });
}

function restoreStyle() {
    if (styleObserver) {
        styleObserver.disconnect();
        styleObserver = null;
    }
    if (removedStyleSheet && removedStyleSheetParent && !document.getElementById('theme-css')) {
        removedStyleSheetParent.appendChild(removedStyleSheet);
        removedStyleSheet = null;
        removedStyleSheetParent = null;
    }
    chrome.storage.local.set({ style: "on" });
}