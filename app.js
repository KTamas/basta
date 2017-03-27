import {stops} from './stops';
import _ from './lodash';

// http://stackoverflow.com/a/21623256/6541
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a =
     0.5 - Math.cos(dLat)/2 +
     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
     (1 - Math.cos(dLon))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
}


// GET http://futar.bkk.hu/bkk-utvonaltervezo-api/ws/otp/api/where/arrivals-and-departures-for-stop.json?includeReferences=agencies,routes,trips,stops&stopId=BKK_F02650&minutesBefore=1&minutesAfter=30&key=bkk-web&version=3&appVersion=2.2.7-20170324232341 HTTP/1.1
// Host: futar.bkk.hu
// Connection: keep-alive
// Pragma: no-cache
// Cache-Control: no-cache
// Accept: application/json, text/javascript, */*; q=0.01
// X-Requested-With: XMLHttpRequest
// User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36
// Referer: http://futar.bkk.hu/?map=17/47.51508/19.04978&layers=GSVB
// Accept-Encoding: gzip, deflate, sdch
// Accept-Language: en-US,en;q=0.8

const lat = 47.515320599999995;
const lon = 19.0529829;

let distances = [];
for (var i = 0; i < stops.length; i++) {
  var stop = stops[i];
  const distance = calculateDistance(lat, lon, stop.lat, stop.lon);
  distances.push({
    "id": stop.id,
    "name": stop.name,
    "distance": distance,
    "parent": stop.parent
  });
}
const nearbyStops = distances
  .filter(d => d.parent !== '')
  .filter(d => d.distance < 1)
  .sort((a, b) => a.distance - b.distance);
const grouped = _(nearbyStops)
  // .map(x => {
  //   x.name = x.name.replace(/ \[.+?\]/g, '');
  //   x.name = x.name.replace(/ \(.+?\)/g, '');
  //   return x;
  // })
  .groupBy(x => x.parent)
  .toArray()
  // .sortBy((a, b) => b.length - a.length)
  .value()
  .sort((a, b) => b.length - a.length);
  const largest = grouped[0];
  // console.log(largest);
  largest.forEach(stop => {
    fetch(`http://futar.bkk.hu/bkk-utvonaltervezo-api/ws/otp/api/where/arrivals-and-departures-for-stop.json?includeReferences=agencies,routes,trips,stops&stopId=BKK_${stop.id}&minutesBefore=1&minutesAfter=30&key=bkk-web&version=3&appVersion=2.2.7-20170324232341`).then(res => res.json()).then(json => {
      if (json.data.entry.stopTimes.length > 0) {
        console.log(json);
      }
    });
  });
// console.table(nearbyStops);
// console.log(grouped);



// window.navigator.geolocation.getCurrentPosition(function(pos) {
//   console.log(pos.coords.latitude);
//   console.log(pos.coords.longitude);
//
// });
