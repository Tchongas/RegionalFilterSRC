// content.js

// Store the initial state of the webpage
var initialPageState = document.documentElement.outerHTML;

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
            tr.parentNode.removeChild(tr);
          }
        }
      }
    }
  });
}

// Function to restore the initial state of the webpage
function restorePageState() {
  document.open();
  document.write(initialPageState);
  document.close();
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'remove_elements') {
    removeCertainTRs(request.imageFilter);
  } else if (request.action === 'restore_page_state') {
    restorePageState();
  }
});