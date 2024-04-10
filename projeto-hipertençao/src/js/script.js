var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© Contribuidores do OpenStreetMap'
}).addTo(map);

function buscarLocaisSaude(lat, lon) {
    // Query da Overpass API para buscar hospitais, clínicas e farmácias num raio de ~5km
    var overpassQuery = `[out:json][timeout:25];
    (
      node["amenity"="hospital"](around:3000,${lat},${lon});
      way["amenity"="hospital"](around:3000,${lat},${lon});
      relation["amenity"="hospital"](around:3000,${lat},${lon});
      node["amenity"="clinic"](around:3000,${lat},${lon});
      way["amenity"="clinic"](around:3000,${lat},${lon});
      relation["amenity"="clinic"](around:3000,${lat},${lon});
    );
    out body;
    >;
    out skel qt;`;

    var overpassUrl = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(overpassQuery);

    fetch(overpassUrl)
    .then(response => response.json())
    .then(data => {
        data.elements.forEach(function(element) {
            var lat = element.lat || element.center.lat;
            var lon = element.lon || element.center.lon;
            var nome = element.tags.name || "Estabelecimento de Saúde sem nome";
            var tipo = element.tags.amenity;
            var tipoFormatado = tipo === "hospital" ? "Hospital" : tipo === "clinic" ? "Clínica" : "Farmácia";

            L.marker([lat, lon]).addTo(map)
                .bindPopup(`${tipoFormatado}: ${nome}`);
        });
    });
}

function onLocationFound(e) {
    var radius = e.accuracy / 2; // Reduzindo o raio para melhor precisão visual
    L.marker(e.latlng).addTo(map)
        .bindPopup("Você está aqui!").openPopup();
    L.circle(e.latlng, radius).addTo(map);

    buscarLocaisSaude(e.latlng.lat, e.latlng.lng);
}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.locate({setView: true, maxZoom: 13});
