var connectDebris = []

// Point Nemo coordinates
var nemoLon = -123;
var nemoLat = -48;

var projection = d3.geoAzimuthalEquidistant() //geoOrthographic //geoAzimuthalEquidistant
    .rotate([123, 48]) //centered on Point Nemo
    .scale(150)
    .precision(.1)
    .clipAngle(80)

async function loadMap() {
    var width = window.innerWidth,
        height = window.innerHeight;

    var svg = d3.select("#map")
        .append("div")
        .attr("id", "svg")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", "0 0 840 500")

    var path = d3.geoPath()
        .projection(projection)

    var graticule = d3.geoGraticule()
        .step([0, 10]);



    svg.append("defs").append("path")
        .datum({ type: "Sphere" })
        .attr("id", "sphere")
        .attr("d", path)

    // svg.append("defs").append("polygon")
    //     .attr("points", "302.03 0 231.75 0 163.88 18.19 103.02 53.33 53.33 103.02 18.19 163.88 0 231.75 0 302.03 18.19 369.91 53.33 430.77 103.02 480.46 163.88 515.59 231.75 533.78 302.03 533.78 369.91 515.59 430.77 480.46 480.46 430.77 515.59 369.91 533.78 302.03 533.78 231.75 515.59 163.88 480.46 103.02 430.77 53.33 369.91 18.19 302.03 0")
    //     .attr("d", path)
    //     .attr("id", "sphere")
    //     // .attr("class", "asd")
    //     .attr("width", "100%")
    //     .attr("height", height)
    //     .attr("viewBox", "0 0 840 500")

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");



    var topology = await d3.json("assets/json/world-50m.json");
    var marineBorders = await d3.json("assets/json/EEZ_land_v2_201410.json");
    var longhurst = await d3.json("assets/json/longhurst_v4_2010.json");
    var navarea = await d3.json("assets/json/navareas.json");

    var spoua = await d3.json("assets/json/spoua.json");
    var icositetragon = await d3.json("assets/json/icositetragon.json");

    var maps = svg.append("g")
    var g = svg.append("g");

    // longhurst Area
    // maps.selectAll("path")
    //     .data(topojson.object(longhurst, longhurst.objects.longhurst_v4_2010)
    //         .geometries)
    //     .enter()
    //     .append("path")
    //     .attr("d", path)
    //     .attr('class', 'mappa')
    //     .attr('id', 'mappa')

    // navareona
    maps.selectAll("path")
        .data(topojson.object(navarea, navarea.objects.navarea)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'mappa')
        .attr('id', 'mappa')


    // text labels
    maps.selectAll("longhurstText")
        .data(topojson.object(longhurst, longhurst.objects.longhurst_v4_2010)
            .geometries)
        .enter()
        .append("text")
        .attr("class", "marineLegend")
        .attr("text-anchor", "middle")
        .attr("dx", 0)
        .attr("transform", function(d) { try { return "translate(" + path.centroid(d) + ") "; } catch { console.error(); } })
        .text(d => d.properties.ProvDescr)
        .call(wrap, 30);

    // marineBorders
    maps.selectAll("path")
        .data(topojson.object(marineBorders, marineBorders.objects.EEZ_land_v2_201410)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'marineBorders')
        .style("fill", "url(#smalldot)")
        .style("mix-blend-mode", "multiply")


    // Spoua Area
    maps.append("path")
        .data(topojson.object(spoua, spoua.objects.spoua)
            .geometries)
        .attr("d", path)
        .attr('class', 'spoua')

    maps.append("text")
        .attr("x", projection([-165, -50])[0] + 5)
        .attr("y", projection([-194, -50])[1] + 1.5)
        .text("SPOUA area")
        .attr('font-size', '3px')
        .attr('class', 'spouaText')

    // Point Nemo and Island
    var pointNemo = await d3.csv("./assets/json/point_nemo_area.csv")

    maps.selectAll("pointNemo")
        .data(pointNemo)
        .enter()
        .append("text")
        .attr("x", d => projection([d.lon, d.lat])[0] + 3.5)
        .attr("y", d => projection([d.lon, d.lat])[1] + 1.5)
        .text(d => d.name)
        // .attr("font-size", "5px")
        .attr("font-size", d => (d.name.includes("Nemo")) ? "8px" : "5px")
        .attr("class", "mainMarker")

    maps.selectAll("pointNemo")
        .data(pointNemo)
        .enter()
        .append('path')
        .attr('transform', function(d, i) { return 'translate(' + (projection([d.lon, d.lat])[0]) + ',' + (projection([d.lon, d.lat])[1]) + ')'; })
        .attr('d', d3.symbol().type(d3.symbols[1]).size(4))
        .attr("class", "mainMarker")

    maps.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
}

async function mapMarkers(element, scale) {

    var g = d3.select("g");

    g.append("circle")
        .attr("cx", projection([element.lon, element.lat])[0] - 1)
        .attr("cy", projection([element.lon, element.lat])[1] - 1)
        .attr("class", d => (element.satellite_name.includes("DEB")) ? "markerDebris markers" : "markerSatellite markers")
        .attr("stroke", "none")
        // .attr('r', d => (scale(element.rcs) <= 1) ? "1px" : scale(element.rcs) + "px")
        .attr('r', d => scale(element.rcs) + "px")

    g.append("text")
        .attr("x", projection([element.lon, element.lat])[0])
        .attr('y', projection([element.lon, element.lat])[1])
        .text(d => (element.satellite_name.includes("DEB")) ? element.satellite_name.replace("DEB", "DEBRIS") : element.satellite_name)
        .attr("class", d => (element.satellite_name.includes("DEB")) ? "textDebris" : "textSatellite")
        .attr("text-anchor", "middle")
        .attr('dy', d => scale(element.rcs) + 5 + "px")

    // Connect Point with same name in a row
    connectDebris.push(element)
    l = connectDebris.length;
    try {
        if (element.satellite_name == connectDebris[l - 2].satellite_name) {
            g.append("line")
                .attr("x1", projection([element.lon, element.lat])[0] - 1)
                .attr("y1", projection([element.lon, element.lat])[1] - 1)
                .attr("x2", projection([connectDebris[l - 2].lon, connectDebris[l - 2].lat])[0] - 1)
                .attr("y2", projection([connectDebris[l - 2].lon, connectDebris[l - 2].lat])[1] - 1)
                .attr("class", d => (element.satellite_name.includes("DEB")) ? "lineDebris" : "lineSatellite")


        } else {
            // It empties the array
            connectDebris = []
        }
    } catch {
        console.error();
    }

    // Legend
    d3.selectAll("textPath").remove();

    g.append("text").append("textPath")
        .attr("text-anchor", "middle")
        .attr("xlink:href", "#sphere")
        .attr("id", "launch")
        .attr("class", "legend")
        .attr("startOffset", "20%")
        .text(element.satellite_decay)
        .attr("dominant-baseline", "text-top")

    g.append("text").append("textPath")
        .attr("text-anchor", "start")
        .attr("xlink:href", "#sphere")
        .attr("id", "owner")
        .attr("class", "legend")
        .attr("startOffset", "35%")
        .text(d => (element.satellite_name.includes("DEB")) ? element.satellite_name.replace("DEB", "DEBRIS") : element.satellite_name)
        .attr("dominant-baseline", "text-top")

    g.append("text").append("textPath")
        .attr("text-anchor", "middle")
        .attr("xlink:href", "#sphere")
        .attr("id", "reenter")
        .attr("class", "legend")
        .attr("startOffset", "30%")
        .text(d => (element.ownership.includes("CIS")) ? "URRS" : element.ownership)
        .attr("dominant-baseline", "text-top")
};



async function mapPaths(element) {
    var coordinates = element.coord
    var coordinates = JSON.parse(coordinates)

    var g = d3.select("g");
    var path = d3.geoPath()
        .projection(projection)

    g.append("path")
        .datum({
            type: "LineString",
            coordinates: coordinates
        })
        .attr("d", path)
        .attr('class', 'reenteringPaths')
        .attr('id', 'reenteringPaths')

    g.append("path").append("textPath")
        .attr("xlink:href", "#reenteringPaths")
        .attr("class", "tinyLegend")
        .attr("startOffset", "0%")
        .text("hello there")
        .attr('font-size', '5px')
};



function wrap(text, width) {
    text.each(function() {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = 0,
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}