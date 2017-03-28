import {stops} from './stops';
import {mosaik, otthon} from './mockLocations';

// http://stackoverflow.com/a/21623256/6541
const calculateDistanceInKm = function (lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = (lat2 - lat1) * Math.PI / 180; // deg2rad below
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

const getDistancesFromStops = function (stops) {
    let distances = [];
    stops.forEach(stop => {
        const distance = calculateDistanceInKm(otthon.lat, otthon.lon, stop.lat, stop.lon);
        distances.push({'id': stop.id, 'name': stop.name, 'distance': distance, 'parent': stop.parent});
    });
    return distances;
};

export const getNearbyStops = distanceThreshold => {
    const distances = getDistancesFromStops(stops);
    return distances.filter(d => d.parent !== '').filter(d => d.distance < distanceThreshold).sort((a, b) => a.distance - b.distance);
};
