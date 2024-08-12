/* 
 Remover cada Div
 Botao para remover todas de uma vez
 Se todas estiverem desativadas, tirar a div pai

*/

function removeSections() {
    const desiredDivs = document.querySelectorAll('#app-main .space-y-4 .relative.flex.w-full.max-w-full.flex-col.flex-nowrap.gap-4.lg\\:flex-row.lg\\:justify-between .relative.flex.w-full.min-w-0.flex-none.flex-col.flex-nowrap.gap-y-4.lg\\:w-\\[400px\\]');
    
    // Check if any divs were found
    if (desiredDivs.length > 0) {
        desiredDivs.forEach(function(div) {
            div.style.display = 'none';
        });
    } else {
    }
    chrome.storage.local.set({ sidebar: "off" }).then(() => {;
      });




    /*
    main (id= app-main) -> div (class = space-y-4) -> div (class = relative flex w-full max-w-full flex-col flex-nowrap gap-4 lg:flex-row lg:justify-between) -> div (class=relative flex w-full min-w-0 flex-none flex-col flex-nowrap gap-y-4 lg:w-auto lg:flex-auto lg:flex-shrink) -> 4 divs that i want 
    */
  }

  function removeStyle() {
    const stylesheetId = 'theme-css';

    const removeStylesheet = () => {
        const stylesheet = document.getElementById(stylesheetId);
        if (stylesheet) {
            stylesheet.remove();
        }
    };
    removeStylesheet();

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                //console.log("mutation.target.id");
                removeStylesheet();
                
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });

    chrome.storage.local.set({ style: "off" });
}