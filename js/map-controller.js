import { locationService } from './services/location-service.js';

let gGoogleMap;

window.onload = () => {
    initMap()
        .then(() => {
            addMarker({ lat: 32.0749831, lng: 34.9120554 });
            const urlParams = new URLSearchParams(window.location.search);
            const lat = urlParams.get('lat');
            const lng = urlParams.get('lng');
            if (lat && lng) panTo(lat, lng);
        })
        .catch((err) => {
            console.log('INIT MAP ERROR');
            console.log(err);
        });

    document.querySelector('.my-location-btn').addEventListener('click', () => {
        getUserPosition()
            .then((pos) => {
                console.log('User position is:', pos.coords);
                panTo(pos.coords.latitude, pos.coords.longitude);
            })
            .catch((err) => {
                console.log('err!!!', err);
            });
    });
    document.querySelector('.btn').addEventListener('click', (ev) => {
        console.log('Aha!', ev.target);
        panTo(35.6895, 139.6917);
    });
    document
        .querySelector('.locations-form')
        .addEventListener('submit', (ev) => {
            ev.preventDefault();
            onSearch(document.querySelector('.locations-input').value);
        });
    const btn = document.querySelector('.copy-url-btn');
    btn.addEventListener('click', () => {
        copyUrl();
        console.log('copied');
        console.log(window.location.href);
    });
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('myParam');
    console.log(myParam);

    renderTable();
};

function copyUrl() {
    let dummy = document.createElement('input');
    const text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text + `?lat=29.557669&lng=34.951925`;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
}

function onSearch(txt) {
    locationService.getLocationByName(txt).then((res) => {
        panTo(
            res.data.results[0].geometry.location.lat,
            res.data.results[0].geometry.location.lng
        );
        locationService.addLocation(
            res.data.results[0].geometry.location.lat,
            res.data.results[0].geometry.location.lng,
            txt
        );
        renderTable();
    });
}

function renderTable() {
    locationService.getLocations().then((locations) => {
        renderLocations(locations);
        document.querySelectorAll('.go-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                panTo(+btn.dataset.lat, +btn.dataset.lng);
            });
        });

        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                onDelete(+btn.dataset.idx);
            });
        });
    });
}

export function initMap(lat = 32.0749831, lng = 34.9120554) {
    return _connectGoogleApi().then(() => {
        gGoogleMap = new google.maps.Map(document.querySelector('#map'), {
            center: { lat, lng },
            zoom: 16,
        });
        gGoogleMap.addListener('click', (ev) => {
            // console.log('lat', ev.latLng.lat(), 'lng', ev.latLng.lng());
            locationService.addLocation(ev.latLng.lat(), ev.latLng.lng());
            addMarker(ev.latLng);
            renderTable();
            locationService
                .getLocationByCoord(ev.latLng)
                .then(
                    (res) =>
                        (document.querySelector('.my-location').innerText =
                            `Location: ` +
                            res.data.results[0].formatted_address)
                );
        });
    });
}

function addMarker(loc) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gGoogleMap,
        title: 'Hello World!',
    });
    return marker;
}

function panTo(lat, lng) {
    const latLng = new google.maps.LatLng(lat, lng);
    gGoogleMap.panTo(latLng);
}

function getUserPosition() {
    console.log('Getting Pos');
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve();
    const API_KEY = 'AIzaSyA9krZ02aDNloGSkQmiwb-2XLuChoMHJh4';
    var elGoogleApi = document.createElement('script');
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    elGoogleApi.async = true;
    document.body.append(elGoogleApi);

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve;
        elGoogleApi.onerror = () => reject('Google script failed to load');
    });
}

function renderLocations(locations) {
    const strHtmls = locations.map((location, idx) => {
        return `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${location.name}</td>
                    <td>${location.lat}</td>
                    <td>${location.lng}</td>
                    <td><button class="go-btn" data-lat="${
                        location.lat
                    }" data-lng="${location.lng}" >Go!</button></td>
                    <td><button class="delete-btn" data-idx="${idx}">Delete</button></td>
                </tr>
              `;
        // <td>${location.weather}</td>
        // <td>${location.createdAt}<   /td>
        // <td>${location.updatedAt}</td>
    });
    document.querySelector('.locations-data').innerHTML = strHtmls.join('');
}

function onDelete(idx) {
    locationService.deleteLocation(idx);

    renderTable();
}
