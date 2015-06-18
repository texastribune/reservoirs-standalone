import $ from 'shoestring';
import moment from 'moment';
import format from 'd3-format';

function determineColor(n) {
  if (n <= 20) { return 'marker-cat1'; }
  if (n <= 40) { return 'marker-cat2'; }
  if (n <= 60) { return 'marker-cat3'; }
  if (n <= 80) { return 'marker-cat4'; }
  if (n <= 100) { return 'marker-cat5'; }
}

const formatter = format.format(',');

function createReservoirDisplay(reservoir) {
  let percentFull = reservoir.latest_measurement.percent_full;
  let lastUpdated = reservoir.latest_measurement.date;
  let storage = reservoir.latest_measurement.conservation_storage;
  let capacity = reservoir.latest_measurement.conservation_capacity;

  let output = `<div id="${reservoir.condensed_name}" class="reservoir-item">
    <header>
      <h3>${reservoir.name} <span class="icon-map-marker zoom-to-map" data-lat="${reservoir.coords[0]}" data-lon="${reservoir.coords[1]}"></span></h3>
      <p>Last updated ${moment(lastUpdated).format('M/D/YYYY')}</p>
    </header>
    <div class="row-bar">
      <span class="bar-color ${determineColor(percentFull)}" style="width: ${percentFull}%"></span>
    </div>
    <p class='bar-label'>${reservoir.latest_measurement.percent_full} percent full</p>
    <dl>
      <div class="stat">
        <dt>Water in reservoir</dt>
        <dd>${formatter(storage)} acre-feet</dd>
      </div>
      <div class="stat">
        <dt>Reservoir capacity</dt>
        <dd>${formatter(capacity)} acre-feet</dd>
      </div>
    </dl>
  </div>`;

  return output;
}

export default function(reservoirs, map) {
  const $reservoirList = $('#reservoir-list');

  let output = reservoirs.reduce((prev, next) => {
    return prev + createReservoirDisplay(next);
  }, '');

  $reservoirList.html(output);

  const $mapZooms = $('.zoom-to-map');
  const $reservoirItems = $('.reservoir-item');

  $mapZooms.bind('click', e => {
    let clicked = $(e.target);

    map.setView([clicked.attr('data-lat'), parseFloat(clicked.attr('data-lon')) - 0.02], 12);

    let itemParent = clicked.parent().parent().parent();
    $reservoirItems.removeClass('reservoir-item-active');
    itemParent.addClass('reservoir-item-active');
  });

  return $reservoirItems;
}
