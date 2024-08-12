//query all the img elements in the page that have the src of /images/flags/it.png and return the element in the console

function testingStates() {
    const brasilflags = document.querySelectorAll('img[src="/images/flags/br.png"]');
    //console.log("testingStates");

    for (let i = 0; i < brasilflags.length; i++) {
        const alt = brasilflags[i].alt;
        const stateName = alt.split(",")[0];
        let stateCode = null;
        if (stateName !== "Brazil") {
            stateCode = getStateCode(stateName);
        }
        else {
            continue;
        }

        let brasilflag = document.createElement('img');
        
        // Set the attributes of the new img element
        brasilflag.alt = "São Paulo, Brazil";
        brasilflag.setAttribute("data-state", "closed");
        brasilflag.loading = "lazy";
        brasilflag.width = 18;
        brasilflag.height = 12;
        brasilflag.decoding = "async";
        brasilflag.setAttribute("data-nimg", "1");
        brasilflag.className = "rounded-sm";
        brasilflag.style.color = "transparent";
        brasilflag.src = "/images/flags/br/" + stateCode + ".png";

        // Get the parent of the current img element
        let parent = brasilflags[i].parentNode;
        parent.insertBefore(brasilflag, parent.children[1]);

    }
}


