// ********  Fetch Headers  ******** //
var myHeaders = new Headers();
myHeaders.append('api_key', 'a9f01a9ff3bd498cb20d3ab88995ce7d');
var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
};

// ******** Event Listeners ******** //
document
  .querySelector('#lineSelector')
  .addEventListener('input', fetchStationLine); //select input populates stations available
document.querySelector('button').addEventListener('click', fetchStation); //click button searches for data

// ******** Functions ******** //
// Fetch Stations on Line color
function fetchStationLine() {
  let stationLineId = document.querySelector('#lineSelector').value;

  // Clear all station options
  document.querySelector('#stationSelector').innerHTML = '';

  fetch(
    `https://api.wmata.com/Rail.svc/json/jStations?LineCode=${stationLineId}`,
    requestOptions
  )
    .then((res) => res.json())
    .then((data) => {
      // console.log(data.Stations)
      // Insert all stations by selected line into next dropdown options
      for (elem of data.Stations) {
        // console.log(elem);
        let stationOption = document.createElement('option');
        stationOption.innerHTML = elem.Name;
        stationOption.value = elem.Code;
        document.querySelector('#stationSelector').appendChild(stationOption);
      }
    })
    .catch((err) => console.log(`error ${err}`));
}

// Fetch Station time estimate
function fetchStation() {
  // set name value
  let stationId = document.querySelector('#stationSelector').value;

  document.querySelector('#textDisclaimer').classList.toggle('hidden');

  // clear all table data on click
  document.querySelector('#group1').innerHTML = '';
  document.querySelector('#group2').innerHTML = '';

  // fetch specific station
  fetch(
    `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${stationId}`,
    requestOptions
  )
    .then((res) => res.json())
    .then((data) => {
      // Create an object that separates the object by station destination and filters out all duplicates
      let arr = data.Trains;
      let endStationUnique = arr.filter(
        (a, i) =>
          arr.findIndex((s) => a.DestinationName === s.DestinationName) === i
      );
      console.log(endStationUnique);

      // Populate metro Signs 1 and 2 line end unique direction
      endStationUnique.forEach((elem, ind) => {
        // Conditional that filters the destinations array by group
        if (elem.Group === '1') {
          console.log('Group 1: ' + elem.DestinationName);
          document.querySelector('#destinations1').innerHTML +=
            ' ⚈ ' + elem.DestinationName;
        } else if (elem.Group === '2') {
          console.log('Group 2: ' + elem.DestinationName);
          document.querySelector('#destinations2').innerHTML +=
            ' ⚈  ' + elem.DestinationName;
        } else {
          console.log('error, missing group?');
        }
      });

      // Insert all train estimates into table
      data.Trains.forEach((elem, ind) => {
        // console.log(elem);

        // Update sign element Stop Location
        document.querySelector('#stopSign1').innerHTML = elem.LocationName;
        document.querySelector('#stopSign2').innerHTML = elem.LocationName;

        // Create a new table row for each train estimate
        let newTrainEstRow = document.createElement('tr');
        let newTrainId = `trainNo${ind}`;
        newTrainEstRow.setAttribute('id', newTrainId);

        // sort trains into two tables by direction of train traveling
        if (elem.Group === '1') {
          document.querySelector('#group1').appendChild(newTrainEstRow);
        } else if (elem.Group === '2') {
          document.querySelector('#group2').appendChild(newTrainEstRow);
        } else {
          console.log('error, missing group?');
        }

        // add table elements
        // add train lane color
        let trainLnData = document.createElement('td');
        trainLnData.innerHTML = elem.Line;
        document.querySelector(`#${newTrainId}`).appendChild(trainLnData);

        // add train car detail
        let trainCarData = document.createElement('td');
        trainCarData.innerHTML = elem.Car;
        document.querySelector(`#${newTrainId}`).appendChild(trainCarData);

        // add train destination
        let trainDestData = document.createElement('td');
        trainDestData.innerHTML = elem.Destination;
        document.querySelector(`#${newTrainId}`).appendChild(trainDestData);

        // add train estimated arrival time
        let trainMinData = document.createElement('td');
        trainMinData.innerHTML = elem.Min;
        document.querySelector(`#${newTrainId}`).appendChild(trainMinData);
      });
    })
    .catch((err) => console.log(`error ${err}`));
}
