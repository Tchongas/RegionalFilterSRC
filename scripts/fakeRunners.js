const loadingPlayer = `<div class="inline-flex flex-row flex-wrap items-center justify-start">
            <div class="inline-flex min-w-0 items-center align-middle">
                <a class="x-username x-username-popover x-focus-outline-offset" style="color:"#fff"}">
                    <img src="https://www.speedrun.com/images/flags/br.png" class="rounded-sm" height="12" width="18" alt="[brasil!!!]" style="color: transparent;" loading="lazy">
                    <span> Loading... </span>
                </a>
            </div>
        </div>`

const errorPlayer = `<div class="inline-flex flex-row flex-wrap items-center justify-start">
            <div class="inline-flex min-w-0 items-center align-middle">
                <a class="x-username x-username-popover x-focus-outline-offset" style="color:"#fff"}">
                    <img src="https://www.speedrun.com/images/flags/br.png" class="rounded-sm" height="12" width="18" alt="[brasil!!!]" style="color: transparent;" loading="lazy">
                    <span> ERROR </span>
                </a>
            </div>
        </div>`

const errorMessage = {
    id: "error",
    index: "X",
    runId: "X",
    player: errorPlayer,
    timeSeconds: "0000000",
    timeFormatted: "00:00:00", 
    date: "Try clicking on a category",
    weblink: "null",
    country: "br",
    game: "error",
    category: "error", 
    comment: "comment"
};

const noPlayerMessage = {
    id: "noPlayer",
    index: "X",
    runId: "X",
    player: errorPlayer,
    timeSeconds: "0000000",
    timeFormatted: "00:00:00", 
    date: "No players? click on a category",
    weblink: "null",
    country: "br",
    game: "error",
    category: "error", 
    comment: "comment"
};

const loadingMessage = {
    id: "loading",
    index: "X",
    runId: "X",
    player: loadingPlayer,
    timeSeconds: "0000000",
    timeFormatted: "00:00:00", 
    date: "Loading...",
    weblink: "null",
    country: "br",
    game: "error",
    category: "error",
    comment: "comment"
}

function getFakePlayer(player) {
    if (player === "error") {
        return errorMessage;
    }
    if (player === "noPlayer") {
        return noPlayerMessage;
    }
    if (player === "loading") {
        return loadingMessage;
    }
}
