// popup.js

document.addEventListener('DOMContentLoaded', function() {

  var queue = document.getElementById('queue');
  var StartQueueInput = document.getElementById('start-queue-input');
  var EndQueueInput = document.getElementById('end-queue-input');
  var sidebarCheckBox = document.getElementById('sidebarCheckBox');
  var styleCheckBox = document.getElementById('styleCheckBox');

  queue.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'get_queue', queueOptionStart: StartQueueInput.value, queueOptionEnd: EndQueueInput.value });
    });
  });

  sidebarCheckBox.addEventListener('change', function() {
    const action = sidebarCheckBox.checked ? 'remove_sidebar' : 'restore_sidebar';
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: action });
    });
  });
  chrome.storage.local.get(["sidebar"]).then((result) => {
    if (result.sidebar === "off") {
      sidebarCheckBox.checked = true;
    }
  });

  styleCheckBox.addEventListener('change', function() {
    const action = styleCheckBox.checked ? 'remove_style' : 'restore_style';
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: action });
    });
  });
  chrome.storage.local.get(["style"]).then((result) => {
    if (result.style === "off") {
      styleCheckBox.checked = true;
    }
  });

});