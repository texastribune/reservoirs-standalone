import L from 'mapbox.js';
import $ from 'shoestring';

import builder from './list';

const dataUrl = 'assets/data/reservoirs.json';
const pageWidth = window.innerWidth;

function determineColor(n) {
  if (n <= 20) { return 'marker-cat1'; }
  if (n <= 40) { return 'marker-cat2'; }
  if (n <= 60) { return 'marker-cat3'; }
  if (n <= 80) { return 'marker-cat4'; }
  if (n <= 100) { return 'marker-cat5'; }
}

function determineRadius(n) {
  if (n <= 50000) { return 6; }
  if (n <= 100000) { return 8; }
  if (n <= 500000) { return 10; }
  if (n <= 1000000) { return 12; }
  if (n <= 1500000) { return 14; }
  if (n <= 2000000) { return 16; }
  if (n <= 2500000) { return 18; }

  return 20;
}

// our Mapbox token
L.mapbox.accessToken = 'pk.eyJ1IjoidGV4YXN0cmlidW5lIiwiYSI6Ilo2eDhZWmcifQ.19qcXfOTN6ulkGW5oouiPQ';

let params;

// small screens
if (pageWidth < 480) {
  params = {
    status: 'small',
    baseZoom: 4,
    baseCenter: [31.4, -100.5],
    radiusMultiplier: 0.5,
  };
} else if (480 < pageWidth && pageWidth < 768) {
  params = {
    status: 'small',
    baseZoom: 5,
    baseCenter: [31.5, -107],
    radiusMultiplier: 0.75,
  };
} else {
  params = {
    status: 'desktop',
    baseZoom: 6,
    baseCenter: [31.5, -104],
    radiusMultiplier: 1,
  };
}

$.ready(() => {
  // instantiate map
  const map = L.mapbox.map('map', 'texastribune.bd36475e', {
    minZoom: params.baseZoom - 1,
    zoomControl: false
  }).setView(params.baseCenter, params.baseZoom);

  // container for map markers
  const markers = L.layerGroup().addTo(map);

  // move control to top right
  new L.Control.Zoom({
    position: 'topright'
  }).addTo(map);

  $.get(dataUrl, data => {
    let reservoirs = JSON.parse(data);

    const items = builder(reservoirs, map, params.status);

    reservoirs.forEach(d => {
      let marker = L.circleMarker(d.coords, {
        className: `marker ${determineColor(d.latest_measurement.percent_full)}`,
        fillOpacity: 0.8,
        opacity: 0.8,
        radius: params.radiusMultiplier * determineRadius(d.latest_measurement.conservation_capacity),
        weight: 1,
      }).bindPopup(`${d.name}`).addTo(markers);

      marker.on('mouseover', e => e.target.setStyle({weight: 2}));
      marker.on('mouseout', e => e.target.setStyle({weight: 1}));

      marker.on('click', () => {
        let listItem = $(`#${d.slug}`);

        let rawNode = listItem.get(0);
        if (params.status === 'small') {
          let qMap = $('#map').get(0);
          let mapBottom = qMap.offsetHeight + qMap.offsetTop;
          window.scrollTo(0, rawNode.offsetTop - mapBottom);
        } else {
          rawNode.scrollIntoView();
        }

        items.removeClass('reservoir-item-active');
        listItem.addClass('reservoir-item-active');
      });

      marker.addTo(markers);
    });
  });
});
