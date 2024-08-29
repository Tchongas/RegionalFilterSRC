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


// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  //Remove Runs that are not the country you want
  if (request.action === 'remove_elements') {
    countryFilter(request.imageFilter);
  } 
  //not used
  else if (request.action === 'undo_delete') {
    restoreRun();
  }
  //Remove the sidebar from the website
  else if (request.action === 'remove_sidebar') {
    chrome.storage.local.get(["sidebar"]).then((result) => {
      if(result.sidebar === "off") {
        chrome.storage.local.set({ sidebar: "on" }).then(() => {
        });
        return
      }
      removeSections()
    });
  } 
  //Remove the style element from the website that has the custom styles
  else if (request.action === 'remove_style') {
    chrome.storage.local.get(["style"]).then((result) => {
      if(result.style === "off") {
        chrome.storage.local.set({ style: "on" }).then(() => {
        });
        return
      }
      removeStyle()
    });
  } 
  //get the queue using the URL for the API request
  else if (request.action === 'get_queue') {
    var url = window.location.href;
    var gameAbbr;
    if (url.indexOf("?") !== -1) {
        gameAbbr = url.substring(url.lastIndexOf("/") + 1, url.indexOf("?"));
    } else {
        gameAbbr = url.substring(url.lastIndexOf("/") + 1);
    }
    get_queue(gameAbbr, request.queueOptionStart, request.queueOptionEnd)
  } 
});

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


  newButton.addEventListener('click', function(request, sender, sendResponse) {
    var url = window.location.href;
    var gameAbbr;
    if (url.indexOf("?") !== -1) {
        gameAbbr = url.substring(url.lastIndexOf("/") + 1, url.indexOf("?"));
    } else {
        gameAbbr = url.substring(url.lastIndexOf("/") + 1);
    }

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