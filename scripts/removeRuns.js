// content.js

// Function to remove elements with specific class combination
function removeElementsByClass(classNames) {
    var elements = document.querySelectorAll('.' + classNames);
    elements.forEach(function(element) {
      element.parentNode.removeChild(element);
    });
  }
  
  // Call the function with the specified class combination
  removeElementsByClass("cursor-pointer.x-focus-inner.whitespace-nowrap");
  