// popup.js

document.addEventListener('DOMContentLoaded', function() {
  var removeElementsButton = document.getElementById('removeElementsButton');
  var undoButton = document.getElementById('undoButton');
  var imageFilterInput = document.getElementById('imageFilterInput');

  removeElementsButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'remove_elements',
        imageFilter: imageFilterInput.value
      });
    });
  });

  undoButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'undo_delete' });
    });
  });
});
