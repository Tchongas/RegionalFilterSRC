// popup.js

document.addEventListener('DOMContentLoaded', function() {
  
  var removeElementsButton = document.getElementById('removeElementsButton');
  var undoButton = document.getElementById('undoButton');
  var queue = document.getElementById('queue');
  var state = document.getElementById('stateCheckBox');
  var imageFilterInput = document.getElementById('imageFilterInput');
  var StartQueueInput = document.getElementById('start-queue-input');
  var EndQueueInput = document.getElementById('end-queue-input');
  var sidebarCheckBox = document.getElementById('sidebarCheckBox');
  var styleCheckBox = document.getElementById('styleCheckBox');

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
  state.addEventListener('change', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'state_flags' });
    });
  });
  chrome.storage.local.get(["state"]).then((result) => {
    if(result.state === "on") {
      state.checked = true;
      return
    }
  });
  sidebarCheckBox.addEventListener('change', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'remove_sidebar' });
    });
  });
  chrome.storage.local.get(["sidebar"]).then((result) => {
    if(result.sidebar === "off") {
      sidebarCheckBox.checked = true;
      return
    }
  });
  styleCheckBox.addEventListener('change', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'remove_style' });
    });
  });
  chrome.storage.local.get(["style"]).then((result) => {
    if(result.style === "off") {
      styleCheckBox.checked = true;
      return
    }
  });

  
});