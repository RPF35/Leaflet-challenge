   // Overlay groups
let earthquakeLayer = L.layerGroup();
let tectLayer = L.layerGroup();

let overlays = {
  Earthquakes: earthquakeLayer,
  "Tectonic Plates": tectLayer
}

// Adding the tile layers
let geoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Adding the topography layer
let topographyLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Base layers
let baseLayers = {
  "Street Map": geoLayer,
  "Topography": topographyLayer
};

// Creating the map object
let myMap = L.map("map", {
  center: [37.6000, -95.6650],
  zoom: 2.5,
  // Display on load
  layers: [geoLayer, earthquakeLayer]
});

// Layer control
L.control.layers(baseLayers, overlays, {
  collapsed: false
}).addTo(myMap);

// Colors for circles and legend
function getColor(depth) {
  return depth >= 90 ? "#FF0D0D" :
    depth < 90 && depth >= 70 ? "#FF4E11" :
    depth < 70 && depth >= 50 ? "#FF8E15" :
    depth < 50 && depth >= 30 ? "#FFB92E" :
    depth < 30 && depth >= 10 ? "#ACB334" :
    "#69B34C";
}

// Draw circles
function drawCircle(point, latlng) {
  let mag = point.properties.mag;
  let depth = point.geometry.coordinates[2];
  return L.circle(latlng, {
    fillOpacity: 0.5,
    color: getColor(depth),
    fillColor: getColor(depth),
    radius: mag * 20000
  });
}

// Information display once clicked
function bindPopup(feature, layer) {
  layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}

// Link for Earthquake GeoJSON data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get GeoJSON data
d3.json(url).then((data) => {
  let features = data.features;

  // Create GeoJSON layer with data
  L.geoJSON(features, {
    pointToLayer: drawCircle,
    onEachFeature: bindPopup
  }).addTo(earthquakeLayer);

  // Setting up Legend
  let legend = L.control({
    position: 'bottomright'
  });

  legend.onAdd = () => {
    let div = L.DomUtil.create('div', 'info legend');
    grades = [-10, 10, 30, 50, 70, 90];

    // Loop through intervals to generate a label
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
});

// The link to get the tectonic plate boundaries data
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(tectonicURL).then((tectData) => {
  L.geoJSON(tectData, {
    color: "rgb(255, 94, 0)",
    weight: 2
  }).addTo(tectLayer);

  tectLayer.addTo(myMap);
});