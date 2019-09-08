var connectDebris = []

// Point Nemo coordinates
var nemoLon = -123;
var nemoLat = -48;

var projection = d3.geoAzimuthalEquidistant() //geoOrthographic //geoAzimuthalEquidistant
    .rotate([123, 48]) //centered on Point Nemo
    .scale(150)
    .precision(.1)
    .clipAngle(90)

async function loadMap() {
    height = window.innerHeight / 1.01;

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

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    //  Defining patterns
    var marineTexture = textures.lines()
        .orientation("vertical", "horizontal")
        .size(4)
        .shapeRendering("crispEdges")
        .strokeWidth(.25)
        .stroke("var(--second-fluo)")

    var spouaTexture = textures.circles()
        .lighter()
        .size(4)
        .radius(.25)
        .stroke("var(--second-fluo)")
        .fill("var(--second-fluo)")

    svg.call(marineTexture);
    svg.call(spouaTexture);

    // Loading geojson and topojsons
    var world = await d3.json("assets/json/world-10m.geojson");
    var marineBorders = await d3.json("assets/json/EEZ_land_v2_201410.json");
    var longhurst = await d3.json("assets/json/longhurst_v4_2010.json");
    var navarea = await d3.json("assets/json/navarea.json");
    var spoua = await d3.json("assets/json/spoua.json");
    var icositetragon = await d3.json("assets/json/icositetragon.json");

    var maps = svg.append("g")
    var g = svg.append("g");

    // Navearea
    maps.selectAll("navarea")
        .data(topojson.object(navarea, navarea.objects.navarea)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'navarea')

    // text labels
    maps.selectAll("navarea")
        .data(topojson.object(navarea, navarea.objects.navarea)
            .geometries)
        .enter()
        .append("text")
        .attr("class", "navareaText")
        .attr("text-anchor", "middle")
        .attr("dx", 0)
        .attr("transform", function(d) { try { return "translate(" + path.centroid(d) + ") "; } catch { console.error(); } })
        .text(d => d.properties.Name)
        .call(wrap, 30);


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

    // Countries
    maps.append("path")
        .datum(world)
        .attr("d", path)
        .attr('class', 'mappa')
        .attr('id', 'mappa')

    // marineBorders
    maps.selectAll("marinePath")
        .data(topojson.object(marineBorders, marineBorders.objects.EEZ_land_v2_201410)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'marineBorders')
        .style("fill", marineTexture.url());

    // Spoua Area
    maps.append("path")
        .data(topojson.object(spoua, spoua.objects.spoua)
            .geometries)
        .attr("d", path)
        .attr('class', 'spoua')
        .style("fill", spouaTexture.url());

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
        .attr('d', d3.symbol().type(d3.symbols[3]).size(4))
        .attr("class", "mainMarker")

    //Graticule
    maps.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)

    // svg.append("path")
    //     .datum(icositetragon)
    //     .attr("d", path)
    //     .attr('fill', '#222')

    // maps.selectAll("icositetragon")
    //     .data(topojson.object(icositetragon, icositetragon.objects.icositetragon)
    //         .geometries)
    //     .enter()
    //     .append("path")
    //     .attr("d", path)
    //     .attr('fill', '#222')
    //     .attr("stroke-width", "5px")
    //     .attr("stroke", "none")


    // Map Legend
    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "5%")
        .attr("xlink:href", "#sphere")
        .text("⬤")
        .style("fill", spouaTexture.url())
        .attr("stroke-width", ".4")
        .attr("stroke", "var(--second-fluo)")


    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "6%")
        .attr("xlink:href", "#sphere")
        .text("SPOUA AREA")

    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "11%")
        .attr("xlink:href", "#sphere")
        .text("⬤")
        .style("fill", marineTexture.url())
        .attr("stroke-width", ".4")
        .attr("stroke", "var(--second-fluo)")

    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "12%")
        .attr("xlink:href", "#sphere")
        .text("MARINE PROTECTED AREAS")

    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend navareaLegend")
        .append("textPath")
        .attr("startOffset", "22%")
        .attr("xlink:href", "#sphere")
        .text("⬤")
        // .attr("font-size", "8px") // i'm fixing it here because i'm lazy


    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "23%")
        .attr("xlink:href", "#sphere")
        .text("NAVIGATIONAL AREAS")

    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend markerSatelliteLegend")
        .append("textPath")
        .attr("startOffset", "31%")
        .attr("xlink:href", "#sphere")
        .text("⬤")

    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "32%")
        .attr("xlink:href", "#sphere")
        .text("DEBRIS REENTERING")

}

async function mapMarkers(element, scale) {

    var g = d3.select("g");

    g.append("circle")
        .attr("cx", projection([element.lon, element.lat])[0] - 1)
        .attr("cy", projection([element.lon, element.lat])[1] - 1)
        .attr("class", d => (element.satellite_name.includes("DEB")) ? "markerDebris markers" : "markerSatellite markers")
        .attr("stroke", "none")
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

    // Satellites Legend
    d3.selectAll(".legend").remove();

    g.append("text")
        .attr("dy", -8)
        .append("textPath")
        .attr("text-anchor", "end")
        .attr("id", "owner")
        .attr("class", "legend")
        .attr("startOffset", "58%")
        .attr("xlink:href", "#sphere")
        .text(element.satellite_decay)
        .attr("dominant-baseline", "text-top")

    g.append("text")
        .attr("dy", -8)
        .append("textPath")
        .attr("text-anchor", "middle")
        .attr("id", "owner")
        .attr("class", "legend")
        .attr("xlink:href", "#sphere")
        .attr("startOffset", "60%")
        .text(d => (element.ownership.includes("CIS")) ? "URRS" : element.ownership)
        .attr("dominant-baseline", "text-top")

    g.append("text")
        .attr("dy", -8)
        .append("textPath")
        .attr("text-anchor", "start")
        .attr("id", "owner")
        .attr("class", "legend")
        .attr("startOffset", "62%")
        .attr("xlink:href", "#sphere")
        .text(d => (element.satellite_name.includes("DEB")) ? element.satellite_name.replace("DEB", "DEBRIS") : element.satellite_name)
        .attr("dominant-baseline", "text-top")

};




async function mapPaths(element) {
    var coordinates = element.coord
    var coordinates = JSON.parse(coordinates)

    var g = d3.select("g");
    var svg = d3.select("svg");

    var path = d3.geoPath()
        .projection(projection)

    var reenteringPaths = textures.lines()
        .orientation("horizontal")
        .strokeWidth(.25)
        .size(4)
        .shapeRendering("crispEdges")
        // .background("var(--second-color)");

    svg.call(reenteringPaths);


    g.append("path")
        .datum({
            type: "LineString",
            coordinates: coordinates
        })
        .attr("d", path)
        .attr('class', 'reenteringPaths')
        .attr('id', 'reenteringPaths')
        .style("fill", reenteringPaths.url());


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