// content.js

// Store the removed elements
var removedElements = [];

// Function to remove specific TR elements
function removeCertainTRs(imageFilter) {
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

// Function to restore the removed elements
function restoreRemovedElements() {
  removedElements.forEach(function(element) {
    element.style.display = 'table-row';
  });
  removedElements = [];
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'remove_elements') {
    removeCertainTRs(request.imageFilter);
  } else if (request.action === 'undo_delete') {
    restoreRemovedElements();
  }
});



function insertButton() {
  // Create a new button element
  var newButton = document.createElement('button');
  newButton.setAttribute('type', 'button');
  newButton.setAttribute('tabindex', '0');
  newButton.className = 'x-input-button items-center rounded text-sm px-2.5 py-1.5 bg-input text-on-input border border-around-input hover:bg-input-hover disabled:bg-input w-32';
  
  // Create the SVG element

  // Create the span element
  var spanElement = document.createElement('span');
  spanElement.textContent = 'Regional Filter';

  // Append the SVG and span elements to the button
  newButton.appendChild(spanElement);

  // Select the specific div by its class
  var targetDiv = document.querySelector('.contents.grow.flex-row.flex-wrap.items-center.justify-end.gap-2.sm\\:flex');

  // Append the new button element to the target div
  if (targetDiv) {
    targetDiv.prepend(newButton);
  } else {
    console.error('Target div not found');
  }
}

// Listen for the DOMContentLoaded event
window.addEventListener('load', function() {
  insertButton();
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'insert_button') {
    insertButton();
  }
});
