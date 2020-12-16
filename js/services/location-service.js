export const locationService = {
    getLocations,
    addLocation,
    deleteLocation,
    getLocationByName,
    getLocationByCoord,
};

const gLocations = [
    {
        lat: 32.18194108343287,
        lng: 34.8661683291202,
        name: 'Puki Home',
        weather: '',
        createdAt: '',
        updatedAt: '',
    },
];

function getLocations() {
    return Promise.resolve(gLocations);
}

function addLocation(lat, lng, name) {
    let placeName;
    if (!name) placeName = prompt('Enter place name');
    else placeName = name;
    gLocations.push(_createLocation(placeName, lat, lng));
    return gLocations;
}

function deleteLocation(idx) {
    gLocations.splice(idx, 1);
}

function _createLocation(name, lat, lng) {
    return {
        lat,
        lng,
        name,
        weather: '',
        createdAt: '',
        updatedAt: '',
    };
}

function getLocationByName(locationName) {
    return axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=AIzaSyA9krZ02aDNloGSkQmiwb-2XLuChoMHJh4`
    );
}

function getLocationByCoord(coord) {
    return axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coord.lat()},${coord.lng()}&key=AIzaSyA9krZ02aDNloGSkQmiwb-2XLuChoMHJh4`
    );
}
