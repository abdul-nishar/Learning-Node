/* eslint-disable */
export const loadMap = (locations) => {
  let map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16,
    },
  ).addTo(map);

  // var greenIcon = L.icon({
  //   iconUrl: '/img/pin.png',
  //   iconSize: [32, 40], // size of the icon
  //   iconAnchor: [16, 45], // point of the icon which will correspond to marker's location
  //   popupAnchor: [0, -50], // point from which the popup should open relative to the iconAnchor
  // });

  let bounds = L.latLngBounds();

  locations.forEach((location) => {
    L.marker([location.coordinates[1], location.coordinates[0]])
      .addTo(map)
      .bindPopup(`Day-${location.day}: ${location.description}`, {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      })
      .openPopup();
    bounds.extend([location.coordinates[1], location.coordinates[0]]);
  });

  map.fitBounds(bounds, {
    padding: [200, 200, 100, 100],
  });

  map.scrollWheelZoom.disable();
  map.doubleClickZoom.disable();
};
