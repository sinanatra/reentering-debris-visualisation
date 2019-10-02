var radius = 10000;

$(document).ready(async function() {
    // It loads the Map
    await loadMap()
    var currentElement = 0;
    //  Loading and cleaning the database
    var data = await d3.tsv("assets/data/finaldataset_cleaned.tsv")
    console.log("Loading TLE Database containing: ", data.length, "elements")
    var reenteringPaths = await d3.tsv("assets/data/cleaned_notice.tsv");
    console.log("Loading Marine Notice Database containing: ", reenteringPaths.length, "elements")

    var cleanedData = [];
    // Selecting only debris in a specific radius
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

    // Define a min and max size for the markers
    var scale = d3.scaleLinear().domain([min, max]).range([0.5, 10]);

    // cleanedData.reverse() // just to test

    var previousElement = cleanedData[currentElement - 1];
    // If the previous line is the same it parses the tsv immediately, else it waits
    function parseData(prec) {
        var parseElement = cleanedData[currentElement];
        const currentSatelliteDecay = cleanedData[currentElement].satellite_decay;
        const currentSatelliteName = cleanedData[currentElement].norad_cat_num;
        previousElement = cleanedData[currentElement - 1];

        setTimeout(function() {

                // When it restarts it removes all the previous svg elements
                if (currentElement == (cleanedData.length - 1)) {
                    currentElement = 0;
                    d3.selectAll(".markerSatellite, .markerDebris, .textSatellite, .textDebris, .lineDebris ,.lineSatellite ,.reenteringPaths")
                        .remove();
                    console.log("Restarting the loop")
                }
                // Add NAVSAT paths if they match the year and month of the satellite reentry
                try {
                    if (parseElement.satellite_decay != prec) {
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
                    // Remove the highlite to the previous element
                    if (previousElement.norad_cat_num != currentSatelliteName) {

                        d3.selectAll(".markerSatellite ")
                            .attr("class", "disappearSatellite")

                        d3.selectAll(".markerDebris ")
                            .attr("class", "disappearDebris")

                        d3.selectAll(".textSatellite")
                            .attr("class", "disappearTextSatellite")

                        d3.selectAll(".textDebris")
                            .attr("class", "disappearTextDebris")

                        d3.selectAll(".lineDebris")
                            .attr("class", "disappearLineDebris")

                        d3.selectAll(".lineSatellite")
                            .attr("class", "disappearLineSatellite")

                        d3.selectAll(".reenteringPaths")
                            .attr("class", "disappearPaths")
                    }
                } catch {}

                parseData(currentSatelliteDecay);
                mapMarkers(parseElement, scale);
                currentElement++

            },
            currentSatelliteDecay === prec ? 0 : 200);
    };

    parseData(previousElement);


    // TEST

    // for (i in reenteringPaths) {
    //     mapPaths(reenteringPaths[i]);
    // }

    // TEST
    // for (i in cleanedData) {
    //     mapMarkers(cleanedData[i], scale);
    // }
    // d3.selectAll(".markerSatellite ")
    //     .attr("class", "disappearSatellite")

    // d3.selectAll(".markerDebris ")
    //     .attr("class", "disappearDebris")

    // d3.selectAll(".textSatellite")
    //     .attr("class", "disappearTextSatellite")

    // d3.selectAll(".textDebris")
    //     .attr("class", "disappearTextDebris")

    // d3.selectAll(".lineDebris")
    //     .attr("class", "disappearLineDebris")

    // d3.selectAll(".lineSatellite")
    //     .attr("class", "disappearLineSatellite")

    // d3.selectAll(".reenteringPaths")
    //     .attr("class", "disappearPaths")

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