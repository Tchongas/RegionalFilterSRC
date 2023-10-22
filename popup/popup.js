// popup.js

document.addEventListener('DOMContentLoaded', function() {
    var removeElementsButton = document.getElementById('removeElementsButton');
    var restorePageButton = document.getElementById('restorePageButton');
    var imageFilterInput = document.getElementById('imageFilterInput');
  
    removeElementsButton.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'restore_page_state' });
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'remove_elements',
          imageFilter: imageFilterInput.value
        });
      });
    });
  
    restorePageButton.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'restore_page_state' });
      });
    });
  });
  