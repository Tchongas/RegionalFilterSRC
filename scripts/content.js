insertButtonIfNeeded();

// for country filter
var removedElements = [];

chrome.storage.local.get(["sidebar"]).then((result) => {
  if(result.sidebar === "off") {
    removeSections()
  }
});

chrome.storage.local.get(["style"]).then((result) => {
  if(result.style === "off") {
    removeStyle()
  }
});

function countryFilter(imageFilter) {

  var trElements = document.querySelectorAll('tr');
  trElements.forEach(function(tr) {
    var imgElement = tr.querySelector('img[src="' + imageFilter + '.png"]');
    if (imgElement === null) {
      var tds = tr.querySelectorAll('td');
      if (tds.length >= 2) {
        var secondTd = tds[1];
        var targetImg = secondTd.querySelector('div > span > div > div > a > img[src="/images/flags/'+imageFilter+'.png"]');
        if (targetImg === null) {
          // Check for specific classes
          var tdClasses = secondTd.className;
          if (tdClasses.includes("cursor-pointer") && tdClasses.includes("sticky") && tdClasses.includes("z-[4]") && tdClasses.includes("px-0.5") && tdClasses.includes("text-left")) {
            removedElements.push(tr);
            tr.style.display = 'none';
          }
        }
      }
    }
  });
}

function restoreRun() {
  removedElements.forEach(function(element) {
    element.style.display = 'table-row';
  });
  removedElements = [];
}


/* -----------------------------------------------------------------------------
START OF MESSAGE LISTENERS 
----------------------------------------------------------------------------- */

chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse) {
  const popUpActions = {
    'remove_elements': () => countryFilter(request.imageFilter),
    'undo_delete': restoreRun,
    'remove_sidebar': () => toggleFeature('sidebar', removeSections),
    'remove_style': () => toggleFeature('style', removeStyle),
    'get_queue': () => {
      const gameAbbr = getGameAbbr();
      console.log("test");
      get_queue(gameAbbr, request.queueOptionStart, request.queueOptionEnd);
    }
  };

  // Run functions defined in object
  const selectedPopUpAction = popUpActions[request.action];
  if (selectedPopUpAction) {
    console.log(selectedPopUpAction)
    selectedPopUpAction();
  }
}

// Toggles sidebar and styles on or off
function toggleFeature(featureName, actionFunction) {
  chrome.storage.local.get([featureName]).then((result) => {
    if (result[featureName] === "off") {
      chrome.storage.local.set({ [featureName]: "on" });
    } else {
      actionFunction();
    }
  });
}

// Gets the game abbreviation from the URL and then uses it to get the queue
function getGameAbbr() {
  const url = window.location.href.split("?")[0]; // Split by '?' and take the first part
  const pathSegments = url.split("/")
  console.log(pathSegments);
  // If the URL has only 4 segments, return the last segment.
  if (pathSegments.length === 4) {
    console.log("2");
    return pathSegments[pathSegments.length - 1];
  }

  const secondLastSegment = pathSegments[pathSegments.length - 2];

  if (secondLastSegment.match(/^[a-z]{2}(?:-[A-Z]{2})?$/)) {
    console.log("2");
    return pathSegments[pathSegments.length - 1];
   
  }
  console.log("3");
  return secondLastSegment;
}


/* -----------------------------------------------------------------------------
END OF MESSAGE LISTENERS 
----------------------------------------------------------------------------- */

function insertButton() {
  
  var newButton = document.createElement('button');
  newButton.setAttribute('type', 'button');
  newButton.setAttribute('tabindex', '0');
  newButton.style.border = '2px solid gold';
  newButton.style.color = 'gold';
  newButton.className = 'x-input-button items-center rounded text-sm px-2.5 py-1.5 bg-input text-on-input border border-around-input hover:bg-input-hover disabled:bg-input w-32';

  newButton.id = 'regionalFilter'

  var spanElement = document.createElement('span');
  spanElement.textContent = 'Country Filter';

  newButton.appendChild(spanElement);

  var targetDiv = document.querySelector('.contents.grow.flex-row.flex-wrap.items-center.justify-end.gap-2.sm\\:flex');

  if (targetDiv) {
    targetDiv.prepend(newButton);
  }


  newButton.addEventListener('click', function() {
    let text;
    let country = prompt("Please enter a Country Code, or leave it blank to reset the leaderboard", "Example: BR, US, CN, GB, PL...");
    if (country == null || country == "" || country == "Example: BR, US, CN, GB, PL...") {
      restoreRun()
    } else {
      text = country.toLowerCase();
      restoreRun()
      countryFilter(text)
    }
  });
}

function insertQueueButton() {
  
  var newButton = document.createElement('button');
  newButton.setAttribute('type', 'button');
  newButton.setAttribute('tabindex', '0');
  newButton.style.border = '2px solid red';
  newButton.style.color = 'red';
  newButton.className = 'x-input-button items-center rounded text-sm px-2.5 py-1.5 bg-input text-on-input border border-around-input hover:bg-input-hover disabled:bg-input w-32';

  newButton.id = 'queueBtn'

  var spanElement = document.createElement('span');
  spanElement.textContent = 'View Queue';

  newButton.appendChild(spanElement);

  var targetDiv = document.querySelector('.contents.grow.flex-row.flex-wrap.items-center.justify-end.gap-2.sm\\:flex');

  if (targetDiv) {
    targetDiv.prepend(newButton);
  }

  const gameAbbr = getGameAbbr();

  newButton.addEventListener('click', function(request, sender, sendResponse) {
    const gameAbbr = getGameAbbr();
    get_queue(gameAbbr, request.queueOptionStart, request.queueOptionEnd)

    
    

  });
}

// Function to insert a button element into the specific div in the webpage
function insertButtonIfNeeded() {
  const regionalFilterButton = document.getElementById('regionalFilter');
  if (!regionalFilterButton) {
    insertButton();
    insertQueueButton()
  }
}

// Create a new MutationObserver instance
const observer = new MutationObserver(function(mutationsList, observer) {
    insertButtonIfNeeded();

  chrome.storage.local.get(["sidebar"]).then((result) => {
    if(result.sidebar === "off") {
      removeSections()
    }
  });

  chrome.storage.local.get(["style"]).then((result) => {
    if(result.style === "off") {
      removeStyle()
    }
  });
});
// Start observing the <body> node for childList changes
observer.observe(document.querySelector('title'), { childList: true });