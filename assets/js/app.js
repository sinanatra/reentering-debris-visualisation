var radius = 7000;

$(document).ready(async function() {
    await loadMap()
    var currentElement = 0;

    var data = await d3.tsv("assets/data/satellite_reentering_cleaned.tsv")
    console.log("Loading TLE Database containing: ", data.length, "elements")
    var reenteringPaths = await d3.tsv("assets/data/cleaned_notice.tsv");
    console.log("Loading Marine Notice Database containing: ", reenteringPaths.length, "elements")

    var cleanedData = [];

    // selecting only debris in a specific radius
    for (i in data) {

        var loc1 = { lat: nemoLat, lon: nemoLon };
        var loc2 = { lat: data[i].lat, lon: data[i].lon };
        var n = getDistanceFromLatLonInKm(nemoLat, nemoLon, data[i].lat, data[i].lon)
        if (n <= radius) {
            cleanedData.push(data[i])
        }

    }

    console.log("Cleaned TLE Database, now containing: ", cleanedData.length, "elements")

    // Normalise the array
    var min = d3.min(cleanedData, d => d.rcs);
    var max = d3.max(cleanedData, d => parseFloat(d.rcs));

    console.log("Minimum value is: ", min, "Maximum value is: ", max)
    var scale = d3.scaleLinear().domain([min, max]).range([0, 100]);

    function parseData() {
        var parseElement = cleanedData[currentElement];
        var previousElement = cleanedData[currentElement - 1];

        mapMarkers(parseElement, scale);

        // Check if the date matches with the ones in the cleaned_notice.tsv and then map the polygons
        try {
            if (parseElement.satellite_decay != previousElement.satellite_decay) {

                for (i in reenteringPaths) {
                    try {
                        // Select only the year and month
                        var monthYear1 = reenteringPaths[i].time.slice(0, 7);
                        var monthYear2 = parseElement.satellite_decay.slice(0, 7);
                        if (monthYear1.includes(monthYear2)) {
                            mapPaths(reenteringPaths[i]);
                        }
                    } catch {}
                }

            }
        } catch {}
        currentElement++;
    }

    setInterval(function() { parseData(); }, 500);

    // fade previous markers away
    setInterval(function() {
        d3.selectAll(".markers")
            .attr("class", "disappearMarker")

        d3.selectAll(".textMarkers")
            .attr("class", "disappearText")

        d3.selectAll(".lineMarkers")
            .attr("class", "disappearLine")

        d3.selectAll(".reenteringPaths")
            .attr("class", "disappearPaths")

    }, 2000);
});

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}