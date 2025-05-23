function clearTable() {
    //get the tbody on html and remove its contents
    var tbody = document.getElementsByTagName('tbody')[0];
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
}

function displayInfoOnTable(runDetails) {
    const table = document.getElementsByTagName('tbody')[0];
    if (!table) {
        console.error("Could not find table element");
        return;
    }

    const formattedTime = formatTime(runDetails.timeSeconds);
    const runLink = `/${runDetails.game}/runs/${runDetails.runId}`;
    const playerLink = `/users/${runDetails.player}`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
    <tr class="cursor-pointer x-focus-inner whitespace-nowrap" tabindex="0">
        <td class="sticky left-0 z-[4]">
            <a class="px-1.5 py-1" tabindex="-1" href="${runLink}">
                <span class="inline-flex flex-nowrap items-center justify-start gap-1">
                    <span>${runDetails.index}</span>
                </span>
            </a>
        </td>
        <td class="cursor-pointer sticky z-[4] px-0.5 text-left" style="left:var(--cell-0-width)">
            <div class="whitespace-normal py-1">
                <span>
                    ${runDetails.player}
                </span>
            </div>
        </td>
        <td class="text-secondary">
            <div class="flex flex-row flex-nowrap items-center justify-end gap-x-0.5 px-0.5 py-1">
                <button type="button" class="cursor-pointer" tabindex="-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                         stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="pointer-events-none w-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"></path>
                    </svg>
                </button>
            </div>
        </td>
        <td><a class="px-1.5 py-1" tabindex="-1" href="${runLink}"><span>${formattedTime}</span></a></td>
        <td><a class="px-1.5 py-1" tabindex="-1" href="${runLink}"><span><span class="x-timestamp" data-state="closed">${runDetails.date}</span></span></a></td>
        <td><a class="px-1.5 py-1" tabindex="-1" href=""><span></span></a></td>
        <td><a class="px-1.5 py-1" tabindex="-1" href=""><span></span></a></td>
        <td><a class="px-1.5 py-1" tabindex="-1" href=""><span></span></a></td>
        <td><a class="px-1.5 py-1" tabindex="-1" href=""><span></span></a></td>
    </tr>`;

    table.appendChild(tr);
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds - Math.floor(seconds)) * 1000);

    return `${h > 0 ? h + '<span class="x-duration-unit">h </span>' : ''}` +
           `${m > 0 ? m + '<span class="x-duration-unit">m </span>' : ''}` +
           `${s}<span class="x-duration-unit">s </span>` +
           `${ms}<span class="x-duration-unit">ms</span>`;
}


function getDisplayName(user) {
    if (!user || user.rel !== "user") return "";

    const nameStyle = user["name-style"];
    const userName = user.names.international;
    const location = user.location;

    let displayName = "";

    if (nameStyle.style === "gradient") {
        const start = nameStyle["color-from"].dark;
        const end = nameStyle["color-to"].dark;
        const nameGradient = gradient(start.slice(1), end.slice(1), userName.length);

        displayName = `<span>` +
            nameGradient.map((c, i) => `<span style="color:#${c}">${escape(userName[i])}</span>`).join("") +
            `</span>`;

    } else if (nameStyle.style === "solid") {
        const solidColor = nameStyle.color.dark;
        displayName = `<span style="color:${solidColor}">${escape(userName)}</span>`;
    }

    if (location && location.country && location.country.code) {
        const cc = location.country.code;
        displayName = `<div class="inline-flex flex-row flex-wrap items-center justify-start">
            <div class="inline-flex min-w-0 items-center align-middle">
                <a class="x-username x-username-popover x-focus-outline-offset" style="color:${nameStyle.color?.dark || "#fff"}">
                    <img src="https://www.speedrun.com/images/flags/${cc}.png" class="rounded-sm" height="12" width="18" alt="[${cc}]" style="color: transparent;" loading="lazy">
                    <span> ${displayName} </span>
                </a>
            </div>
        </div>`;
    }

    return displayName;
}

