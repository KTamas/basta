import _ from './lodash';
import {getNearbyStops} from './helpers';

// api call
const bkkUrl = 'http://futar.bkk.hu/bkk-utvonaltervezo-api/ws/otp/api/where/arrivals-and-departures-for-stop.json?includeReferences=agencies,routes,trips,stops&minutesBefore=1&minutesAfter=30&key=bkk-web&version=3&appVersion=2.2.7-20170324232341&stopId=BKK_';

// distance from x in km
const distanceThreshold = 0.7;
const nearby = getNearbyStops(distanceThreshold);
const grouped = _(nearby)
    .groupBy(x => x.parent)
    .toArray()
    .value()
    .sort((a, b) => b.length - a.length);

console.log(grouped);

grouped.forEach(route => {
    route.forEach(stop => {
        fetch(bkkUrl + stop.id).then(res => res.json()).then(json => {
            if (json.data.entry.stopTimes.length > 0) {
                console.log(json);
                processData(json);
            } else {
                console.log(`stop id ${stop.id} is empty`);
            }
        });
    });
});

const processData = function (json) {
    // const now = new Date(json.currentTime);
//    console.log(`now: ${now}`);
    const stopId = json.data.entry.stopId;
    const stopName = json.data.references.stops[stopId].name;
    const stopTimes = json.data.entry.stopTimes;
    document.write(`<div><b>${stopName}</b>:</div>`);
//    console.log(stopTimes);
    stopTimes.forEach(stopTime => {
        // const departure = new Date(stopTime.arrivalTime * 1000);
        const diff = ((stopTime.arrivalTime * 1000) - json.currentTime) / 1000 / 60;
        if (diff < 0) return;
        const tripId = stopTime.tripId;
        const routeId = json.data.references.trips[tripId].routeId;
        const tripHeadSign = json.data.references.trips[tripId].tripHeadsign;
        const route = json.data.references.routes[routeId];
        const vehicleName = route.shortName;
        const backgroundColor = route.color;
        const color = route.textColor;
        // const desc = route.description;
        document.write(`
            <div>
                <span style='color: ${color}; background-color: ${backgroundColor}'>${vehicleName}</span>
                &nbsp;towards ${tripHeadSign}
            </div>
            <div>leaving in ${Math.ceil(diff)} minute(s)</div>
        `);
    });
};
// console.table(nearbyStops);
// console.log(grouped);

const getLoc = false;
getLoc && window.navigator.geolocation.getCurrentPosition(function(pos) {
    console.log(pos.coords.latitude);
    console.log(pos.coords.longitude);
});
