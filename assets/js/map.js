var connectDebris = []

// Point Nemo coordinates
var nemoLon = -123;
var nemoLat = -48;
var patternSize = 6;

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
        .size(patternSize)
        .shapeRendering("crispEdges")
        .strokeWidth(.25)
        .stroke("var(--pattern)")

    var spouaTexture = textures.circles()
        .lighter()
        .size(3)
        .radius(.25)
        .stroke("var(--highlite-color)")
        .fill("var(--highlite-color)")

    svg.call(marineTexture);
    svg.call(spouaTexture);

    // Loading geojson and topojsons
    var world = await d3.json("assets/json/world-10m.json");
    var marineBorders = await d3.json("assets/json/EEZ_land_v2_201410.json");
    var navarea = await d3.json("assets/json/navarea_edit.json");
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

    // Navarea labels Numbers
    maps.selectAll("navarea")
        .data(topojson.object(navarea, navarea.objects.navarea)
            .geometries)
        .enter()
        .append("text")
        .attr("dy", -5)
        .attr("class", "navareaText")
        .attr("text-anchor", "middle")
        .attr("dx", 0)
        .attr("transform", d => { if (!isNaN(path.centroid(d)[0])) { return "translate(" + path.centroid(d) + ")" } })
        .text(d => { if (!isNaN(path.centroid(d)[0])) { return d.properties.Name } })


    // text labels
    maps.selectAll("navarea")
        .data(topojson.object(navarea, navarea.objects.navarea)
            .geometries)
        .enter()
        .append("text")
        .attr("dy", -50)
        .attr("class", "navareaText")
        .attr("text-anchor", "middle")
        .attr("transform", d => { if (!isNaN(path.centroid(d)[0])) { return "translate(" + path.centroid(d) + ")" } })
        .text(d => { if (!isNaN(path.centroid(d)[0])) { return d.properties.Area } })
        .call(wrap, 40);

    // marineBorders
    maps.selectAll("marinePath")
        .data(topojson.object(marineBorders, marineBorders.objects.EEZ_land_v2_201410)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'marineBorders')
        .style("fill", marineTexture.url());

    // Countries
    maps.append("path")
        .data(topojson.object(world, world.objects.ne_10m_land)
            .geometries)
        .attr("d", path)
        .attr('class', 'mappa')
        .attr('id', 'mappa')

    // Spoua Area
    maps.append("path")
        .data(topojson.object(spoua, spoua.objects.spoua)
            .geometries)
        .attr("d", path)
        .attr('class', 'spoua')
        .style("fill", spouaTexture.url());

    // Point Nemo and Island
    var pointNemo = await d3.csv("./assets/json/point_nemo_area.csv")

    //  Point Nemo text
    maps.selectAll("pointNemo")
        .data(pointNemo)
        .enter()
        .append("text")
        .attr("x", d => projection([d.lon, d.lat])[0])
        .attr("y", d => projection([d.lon, d.lat])[1] + 1.5)
        .text(d => d.name)
        .attr("class", "nemoMarker")
        .attr('dx', d => 5 + "px")
        .attr("text-anchor", "left")

    //  Point Nemo marker
    maps.selectAll("pointNemo")
        .data(pointNemo)
        .enter()
        .append('path')
        .attr('transform', function(d, i) { return 'translate(' + (projection([d.lon, d.lat])[0]) + ',' + (projection([d.lon, d.lat])[1]) + ')'; })
        .attr('d', d3.symbol().type(d3.symbols[3]).size(patternSize))
        .attr("class", "nemoMarker")

    //Graticule
    maps.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)


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
        .attr("stroke", "var(--pattern)")


    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "6%")
        .attr("xlink:href", "#sphere")
        .text("SPOUA")

    g.append("text")
        .attr("dy", -8)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "11%")
        .attr("xlink:href", "#sphere")
        .text("⬤")
        .style("fill", marineTexture.url())
        .attr("stroke-width", ".4")
        .attr("stroke", "var(--pattern)")

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

    // Debris marker
    g.append("circle")
        .attr("cx", projection([element.lon, element.lat])[0] - 1)
        .attr("cy", projection([element.lon, element.lat])[1] - 1)
        .attr("class", d => (element.satellite_name.includes("DEB")) ? "markerDebris markers" : "markerSatellite markers")
        .attr("stroke", "none")
        .attr('r', d => scale(element.rcs) + "px")

    // Debris legend text 
    g.append("text")
        .attr("x", projection([element.lon, element.lat])[0])
        .attr('y', projection([element.lon, element.lat])[1] + .5 + "px")
        .text(d => (element.satellite_name.includes("DEB")) ? element.satellite_name.replace("DEB", "DEBRIS") : element.satellite_name)
        .attr("class", d => (element.satellite_name.includes("DEB")) ? "textDebris" : "textSatellite")
        .attr("text-anchor", "left")
        .attr('dx', d => scale(element.rcs) + 1 + "px")

    // Connect Point with same name in a row
    connectDebris.push(element)
    l = connectDebris.length
    try {
        previousPosition = connectDebris[l - 2];
        if (element.norad_cat_num == previousPosition.norad_cat_num) {
            g.append("line")
                .attr("x1", projection([element.lon, element.lat])[0] - 2)
                .attr("y1", projection([element.lon, element.lat])[1] - 2)
                .attr("x2", projection([previousPosition.lon, previousPosition.lat])[0] - 1)
                .attr("y2", projection([previousPosition.lon, previousPosition.lat])[1] - 1)
                .attr("class", d => (element.norad_cat_num.includes("DEB")) ? "lineDebris" : "lineSatellite")
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
        .attr("class", "legend")
        .attr("startOffset", "58%")
        .attr("xlink:href", "#sphere")
        .text(element.satellite_decay)
        .attr("dominant-baseline", "text-top")

    // Countries icon
    g.append("text")
        .attr("dy", -8)
        .append("textPath")
        .attr("text-anchor", "middle")
        .attr("id", "icons")
        .attr("class", "legend")
        .attr("xlink:href", "#sphere")
        .attr("startOffset", "60%")
        // .text(d => (element.ownership.includes("CIS")) ? "URRS" : element.ownership)
        .text(element.ownership)
        .attr("dominant-baseline", "text-top")

    g.append("text")
        .attr("dy", -8)
        .append("textPath")
        .attr("text-anchor", "start")
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
        .size(patternSize)
        .orientation("vertical", "horizontal")
        .shapeRendering("crispEdges")
        .strokeWidth(.25)
        .stroke("var(--first-fluo)")
        .size(patternSize)

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