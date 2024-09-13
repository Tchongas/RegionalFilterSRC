async function getUserID(user) {
    const response = await fetch(`https://www.speedrun.com/api/v1/users?lookup=${user}`);
    const data = await response.json();
    return data.data[0].id; // Assuming the first item is the correct user
  }
  
  async function getUserRuns(userId) {
    const response = await fetch(`https://www.speedrun.com/api/v1/users/${userId}/personal-bests?top=3`);
    const data = await response.json();
  
    let place1Count = 0;
    let place2Count = 0;
    let place3Count = 0;
  
    data.data.forEach(run => {
      if (run.place === 1) {
        place1Count++;
      } else if (run.place === 2) {
        place2Count++;
      } else if (run.place === 3) {
        place3Count++;
      }
    });
  
    return { place1Count, place2Count, place3Count };
  }

async function processUser(user) {
    const userId = await getUserID(user);
    const placeCounts = await getUserRuns(userId);
    
    console.log(`User ${user} has ${placeCounts.place1Count} 1st place runs, ${placeCounts.place2Count} 2nd place runs, and ${placeCounts.place3Count} 3rd place runs.`);
    return placeCounts;
    
    // You can use placeCounts.place1Count, placeCounts.place2Count, placeCounts.place3Count later in the code
  }

async function getPodiums(user){ 
    const placeCounts = await processUser(user);
    console.log(placeCounts);

    return `<div class="x-panel-shadow rounded-lg bg-panel/panel" id="podiums">
        <div>
            <div class="flex min-h-[2.75rem] flex-row flex-nowrap items-center justify-between gap-1 overflow-hidden rounded-t-lg py-2 pl-4 pr-2">
                <div class="min-w-0 flex-auto break-words font-title text-base font-bold uppercase leading-none tracking-wide text-foreground">
                    Podiums
                </div>
                <div class="flex-none"></div>
            </div>
        </div>
        <div>
            <div>
                <div class="px-4 py-2">
                    <div class="flex flex-row flex-nowrap items-start justify-start py-2 sm:gap-x-2">
                        <div class="min-w-0 flex flex-wrap items-center justify-start">
                            <div class="sm:w-48 flex flex-wrap items-center justify-start gap-2 pb-2 font-title text-sm font-bold sm:px-2 sm:text-base ">
                                <div class="relative h-8 w-8" data-state="closed">
                                    <img alt="Third place" loading="lazy" decoding="async" data-nimg="fill" class="object-contain" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/images/1st.png">
                                </div> 
                                <span>1st Place: ${placeCounts.place1Count}</span>
                            </div>
                            <div class="sm:w-48 flex flex-wrap items-center justify-start gap-2 pb-2 font-title text-sm font-bold sm:px-2 sm:text-base ">
                                <div class="relative h-8 w-8" data-state="closed">
                                    <img alt="Third place" loading="lazy" decoding="async" data-nimg="fill" class="object-contain" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/images/2nd.png">
                                </div> 
                                <span>2nd Place: ${placeCounts.place2Count}</span>
                            </div>
                            <div class="sm:w-48 flex flex-wrap items-center justify-start gap-2 pb-2 font-title text-sm font-bold sm:px-2 sm:text-base ">
                                <div class="relative h-8 w-8" data-state="closed">
                                    <img alt="Third place" loading="lazy" decoding="async" data-nimg="fill" class="object-contain" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/images/3rd.png">
                                </div> 
                                <span>3rd Place: ${placeCounts.place3Count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
}
