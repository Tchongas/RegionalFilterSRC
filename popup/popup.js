// popup.js

document.addEventListener('DOMContentLoaded', function() {
  
  var removeElementsButton = document.getElementById('removeElementsButton');
  var undoButton = document.getElementById('undoButton');
  var queue = document.getElementById('queue');
  var imageFilterInput = document.getElementById('imageFilterInput');
  var StartQueueInput = document.getElementById('start-queue-input');
  var EndQueueInput = document.getElementById('end-queue-input');
  var sidebarButton = document.getElementById('sidebarButton');

  removeElementsButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'undo_delete' });
      chrome.tabs.sendMessage(tabs[0].id, { action: 'remove_elements', imageFilter: imageFilterInput.value});
    });
  });

  undoButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'undo_delete' });
    });
  });
  queue.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'get_queue', queueOptionStart: StartQueueInput.value, queueOptionEnd: EndQueueInput.value });
    });
  });
  sidebarButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'remove_sidebar' });
    });
  });
});