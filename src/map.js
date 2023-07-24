import L from "leaflet";
import "leaflet/dist/leaflet.css";

let map = null;
let geoJson = null;
let layerControl = null; 
let baseLayer = null;
let legend = null;

export const partyColorMapping = {
    "VAS, (+DEVA-88)": "#ff0000",
    "VIHR": "#005901",
    "PS": "#0000ff",
    "SDP": "#ff9a03",
    "KOK": "#03ffff",
    "KESK (**LKP-84)": "#73ff00",
    "RKP": "#ffe100",
    "RKP": "#ffe100",
    "KD": "#8000ff",
}

async function fetchData() {
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
    const res = await fetch(url);
    const data = await res.json();

    return data;
}

function setLayerControl(overlayMaps) {
    const baseMaps = {};

    if (layerControl) {
        layerControl.remove();
    }

    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
}

export async function initMap() {    
    const data = await fetchData(); 
    map = L.map("map", {
        minZoom: -2,
    });

    baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    geoJson = L.geoJSON(data, {
        weight: 2
    }).addTo(map);

    setLayerControl({
        "Base map": baseLayer,
        "Municipalities": geoJson,  
    });

    map.fitBounds(geoJson.getBounds());
}

export function setElectionData(data) {
    const getColor = (partyName) => {
        const color = partyColorMapping[partyName];
        return color ?? "#000";
    }

    geoJson.setStyle( (feature) => {
        const municipalityCode = feature.properties.kunta;
        const municipality = data[municipalityCode];
        const party = municipality.mostVotedParty


        return {
            fillColor: getColor(party.partyName),
            fillOpacity: 0.7
        }
    }); 

    geoJson.eachLayer((layer) => {
        const feature = layer.feature;
        const municipalityCode = feature.properties.kunta;
        const municipality = data[municipalityCode];
        const party = municipality.mostVotedParty

        layer.bindTooltip(`<p><strong>Municipality: </strong>${municipality.name}</p> <p><strong>Party: </strong>${party.partyName}</p> <p><strong>Votes: </strong>${party.votes}</p>`)
        
        let partyVoteItems = "";
        municipality.partyVotes.forEach((element) => {
            partyVoteItems += `<li>${element.partyName}: ${element.votes}</li>`;
        })
        
        const popupDiv = document.createElement("div");
        popupDiv.id = "map-popup"
        popupDiv.innerHTML = `<h4>Party votes in ${municipality.name}</h4><ul>${partyVoteItems}</ul>`;
        const link = document.createElement("a");
        link.id = "show-party-votes-link"
        link.href = "#chart2"
        link.innerText = "Show party votes for the region on the chart"
        link.dataset.regionKey = municipality.municipalityKey;
        link.onclick = () => {
            const select = document.getElementById("municipality-choice");
            select.value = link.dataset.regionKey;
            select.dispatchEvent(new Event("change"));
        }
        popupDiv.appendChild(link);
        layer.bindPopup(popupDiv);
    })
    
    legend = L.control({ position: "bottomleft" });
    
    legend.onAdd = function() {
        const div = L.DomUtil.create("div", "legend");
    
        let legendContent = '<div id="main-legend-content"><h4>Parties</h4>';

        Object.entries(partyColorMapping).forEach((entity) => {
            const [partyName, color] = entity;
            legendContent += `<i style="background: ${color}"></i><span>${partyName}</span><br>`
        }) 

        legendContent += "</div>";
        legendContent += '<div class="checkbox-row"><input id="show-legend" type="checkbox" checked="true"><label for="show-legend">Show legend</label></div>';

        div.innerHTML += legendContent;

        return div;
    }

    legend.addTo(map);

    const showLegendCheckbox = document.getElementById("show-legend");
    showLegendCheckbox.onchange = (event) => {
      const checked = event.target.checked;
      const mainLegendContent = document.getElementById("main-legend-content");
      if (checked) {
        mainLegendContent.style.display = "block";
      } else {
        mainLegendContent.style.display = "none";
      }
    }
}