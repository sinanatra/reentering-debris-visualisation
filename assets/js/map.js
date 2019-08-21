var connectDebris = []

// Point Nemo coordinates
var nemoLon = -123;
var nemoLat = -48;

var projection = d3.geoAzimuthalEquidistant() //geoOrthographic //geoAzimuthalEquidistant
    .rotate([123, 43]) // 3d model?
    .rotate([123, 48]) // actual point nemo
    .scale(150)
    .precision(.1)
    .clipAngle(80);

async function loadMap() {

    var svg = d3.select("#map")
        .append("div")
        .attr("id", "svg")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 940 600");

    var path = d3.geoPath()
        .projection(projection)

    var graticule = d3.geoGraticule()
        .step([0, 10]);

    svg.append("defs").append("path")
        .datum({ type: "Sphere" })
        .attr("id", "sphere")
        .attr("d", path)

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");


    var topology = await d3.json("assets/json/world-50m.json");
    var marineBorders = await d3.json("assets/json/EEZ_land_v2_201410.json");
    var longhurst = await d3.json("assets/json/longhurst_v4_2010.json");
    var spoua = await d3.json("assets/json/spoua.json");
    var point_nemo_area = await d3.json("assets/json/point_nemo_area.json");

    var g = svg.append("g");

    // longhurst Area
    g.selectAll("path")
        .data(topojson.object(longhurst, longhurst.objects.longhurst_v4_2010)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'mappa')
        .attr('id', 'mappa')

    // text labels
    g.selectAll("longhurstText")
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
    g.selectAll("path")
        .data(topojson.object(marineBorders, marineBorders.objects.EEZ_land_v2_201410)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'marineBorders')
        .style("fill", "url(#smalldot)")
        .style("mix-blend-mode", "multiply")

    // Spoua Area
    g.append("path")
        .data(topojson.object(spoua, spoua.objects.spoua)
            .geometries)
        .attr("d", path)
        .attr('class', 'spoua')

    g.append("text")
        .attr("x", projection([-165, -50])[0] + 5)
        .attr("y", projection([-194, -50])[1] + 1.5)
        .text("SPOUA area")
        .attr('font-size', '3px')
        .attr('class', 'spouaText')

    // Point Nemo and Island
    var pointNemo = await d3.csv("./assets/json/point_nemo_area.csv")

    g.selectAll("pointNemo")
        .data(pointNemo)
        .enter()
        .append("text")
        .attr("x", d => projection([d.lon, d.lat])[0] + 3.5)
        .attr("y", d => projection([d.lon, d.lat])[1] + 1.5)
        .text(d => d.name)
        .attr("font-size", "5px")
        .attr("class", "mainMarker")

    g.selectAll("pointNemo")
        .data(pointNemo)
        .enter()
        .append('path')
        .attr('transform', function(d, i) { return 'translate(' + (projection([d.lon, d.lat])[0]) + ',' + (projection([d.lon, d.lat])[1]) + ')'; })
        .attr('d', d3.symbol().type(d3.symbols[1]).size(4))
        .attr("class", "mainMarker")

    g.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
}

async function mapMarkers(element) {

    var g = d3.select("g");

    g.append("circle")
        .attr("cx", projection([element.lon, element.lat])[0] - 1)
        .attr("cy", projection([element.lon, element.lat])[1] - 1)
        .attr("class", function() {
            if (element.satellite_name.includes("DEB")) {
                return "markerDebris markers"
            } else {
                return "markerSatellite markers";
            }
        })
        .attr("stroke", "none")
        .attr('r', function(d) {
            if (element.rcs <= 1) {
                return "1px";
            } else {
                return element.rcs / 30 + "px";
            }
        });

    g.append("text")
        .attr("x", projection([element.lon, element.lat])[0])
        .attr('y', function(d) {
            if (element.rcs <= 1) {
                return projection([element.lon, element.lat])[1] + 5
            } else {
                return projection([element.lon, element.lat])[1]
            }
        })
        .text(function() {
            if (element.satellite_name.includes("DEB")) {
                return element.satellite_name.replace("DEB", "DEBRIS")
            } else {
                return element.satellite_name
            }
        })
        .attr("class", "textMarkers")
        .attr("text-anchor", "middle")
        // .attr("alignment-baseline", "hanging")
        .attr("dy", element.rcs / 25 + .2 + "em")

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
                .attr("class", "lineMarkers")

        }
    } catch {
        console.error();
    }

    // Legend

    d3.selectAll("textPath").remove();


    g.append("text").append("textPath")
        .attr("dx", 100)
        .attr("dy", 100)
        .attr("x", 100)
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .attr("xlink:href", "#sphere")
        .attr("id", "launch")
        .attr("class", "legend")
        .attr("startOffset", "20%")
        .text(element.satellite_decay)


    g.append("text").append("textPath")
        .attr("dx", 100)
        .attr("dy", 100)
        .attr("x", 100)
        .attr("y", 100)
        .attr("text-anchor", "start")
        .attr("xlink:href", "#sphere")
        .attr("id", "owner")
        .attr("class", "legend")
        .attr("startOffset", "35%")
        .text(function() {
            if (element.satellite_name.includes("DEB")) {
                return element.satellite_name.replace("DEB", "DEBRIS")
            } else {
                return element.satellite_name
            }
        })

    g.append("text").append("textPath")
        .attr("dx", 100)
        .attr("dy", 100)
        .attr("x", 100)
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .attr("xlink:href", "#sphere")
        .attr("id", "reenter")
        .attr("class", "legend")
        .attr("startOffset", "30%")
        .text(function(d) {
            if (element.ownership.includes("CIS")) {
                return "URRS";
            } else {
                return element.ownership;
            }
        });

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