document.addEventListener('DOMContentLoaded', function() {
  var dataElement = document.getElementById('data');

  function fetchData() {
    fetch('https://paceman.gg/api/ars/liveruns')
      .then(response => response.json())
      .then(data => {
        var formattedData = formatData(data);
        dataElement.innerHTML = formattedData;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        dataElement.textContent = 'Error fetching data';
      });
  } 
  fetchData();

  setInterval(fetchData, 8000);

  function formatData(data) {
    var formattedHTML = '';
  
    data.forEach(entry => {
      formattedHTML += '<div class="run-popup-container">'; 
      formattedHTML += '<div class="run-popup-avatar">';
      formattedHTML += '<img src="http://cravatar.eu/helmavatar/' + entry.user.uuid + '" width="50" height="50" id="head">';
      formattedHTML += '</div>';
      formattedHTML += '<div class="run-popup-info"><span><b>' + entry.nickname + ' </b></span></div>';
      var lastEvent = entry.eventList[entry.eventList.length - 1];
      if (lastEvent) {
        formattedHTML += '<div><p><span class="run-split-text"> ' + getEventDescription(lastEvent.eventId) + '</span><br> IGT: <b class="run-split-time">' + formatTime(lastEvent.igt) + '</b> RTA: <b class="run-split-time">' + formatTime(lastEvent.rta) + '</b></p></div>';
      }
      formattedHTML += '</div><br>';
    });
  
    return formattedHTML;
  }

  function formatTime(milliseconds) {
    var totalSeconds = Math.floor(milliseconds / 1000);

    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;

    return ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
  }

  const eventDescriptions = {
    'rsg.enter_fortress': '<span class="run-split-fortress">Entered Fortress</span>',
    'rsg.enter_bastion': '<span class="run-split-bastion">Enter Bastion</span>',
    'rsg.enter_stronghold': '<span class="run-split-stronghold">Enter Stronghold</span>',
    'rsg.enter_end': '<span class="run-split-end">Enter End</span>',
    'rsg.enter_nether': '<span class="run-split-nether">Enter Nether</span>',
    'rsg.credits': '<span class="run-split-credits">Finish</span>',
    'rsg.first_portal': '<span class="run-split-portal">First Portal</span>',
    'rsg.second_portal': '<span class="run-split-portal">Second Portal</span>',
  };

  function getEventDescription(eventId) {
    if (eventDescriptions[eventId]) {
      return eventDescriptions[eventId];
    } else {
      return eventId;
    }
  }
});