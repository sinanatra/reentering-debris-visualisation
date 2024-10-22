var connectDebris = []

// Point Nemo coordinates
var nemoLon = -123;
var nemoLat = -48;
var patternSize = 6;

var projection = d3.geoAzimuthalEquidistant() //geoOrthographic //geoAzimuthalEquidistant
    .rotate([123, 48]) //centered on Point Nemo
    .scale(150)
    .precision(1)
    .clipAngle(95.3)

var circleprojection = d3.geoAzimuthalEquidistant()
    .rotate([123, 48]) //centered on Point Nemo
    .scale(150)
    .precision(200)

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

    var circledPath = d3.geoPath()
        .projection(circleprojection)

    var graticule = d3.geoGraticule()
        .step([0, 10]);

    //  Patterns
    var marineTexture = textures.lines()
        .orientation("vertical", "horizontal")
        .size(patternSize)
        // .shapeRendering("crispEdges")
        .strokeWidth(.45)
        .stroke("var(--pattern)")

    var spouaTexture = textures.circles()
        .lighter()
        .size(3)
        .radius(.45)
        .stroke("var(--highlite-color)")
        .fill("var(--highlite-color)")

    var reenteringPaths = textures.lines()
        .size(patternSize)
        .orientation("vertical", "horizontal")
        // .shapeRendering("crispEdges")
        .strokeWidth(.45)
        .stroke("var(--first-fluo)")
        .size(patternSize)

    svg.call(reenteringPaths);
    svg.call(marineTexture);
    svg.call(spouaTexture);

    // Loading all the topojsons
    var world = await d3.json("assets/json/world-10m.json");
    var marineBorders = await d3.json("assets/json/EEZ_land_v2_201410.json");
    var navarea = await d3.json("assets/json/navarea_edit.json");
    var spoua = await d3.json("assets/json/spoua.json");

    var maps = svg.append("g")
    var g = svg.append("g");

    // Navearea
    g.selectAll("navarea")
        .data(topojson.object(navarea, navarea.objects.navarea)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'navarea')



    // marineBorders
    g.selectAll("marinePath")
        .data(topojson.object(marineBorders, marineBorders.objects.EEZ_land_v2_201410)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'marineBorders')
        .style("fill", marineTexture.url());

    // Countries
    g.append("path")
        .data(topojson.object(world, world.objects.ne_10m_land)
            .geometries)
        .attr("d", path)
        .attr('class', 'mappa')
        .attr('id', 'mappa')

    // Spoua Area
    g.append("path")
        .data(topojson.object(spoua, spoua.objects.spoua)
            .geometries)
        .attr("d", path)
        .attr('class', 'spoua')
        .style("fill", spouaTexture.url());

    // Point Nemo and Island
    var pointNemo = await d3.csv("./assets/json/point_nemo_area.csv")

    //  Point Nemo text
    svg.selectAll("pointNemo")
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
    svg.selectAll("pointNemo")
        .data(pointNemo)
        .enter()
        .append('path')
        .attr('transform', function(d, i) { return 'translate(' + (projection([d.lon, d.lat])[0]) + ',' + (projection([d.lon, d.lat])[1]) + ')'; })
        .attr('d', d3.symbol().type(d3.symbols[3]).size(patternSize))
        .attr("class", "nemoMarker")

    //Graticule
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)

    // Clipping polygon
    var icositetragon = await d3.json("assets/json/icositetragon.geojson"); // cropping in the shape of an icositetragon

    svg.append("defs").append("path")
        .datum({ type: "Sphere" })
        .attr("id", "sphere")
        .attr("d", path)

    svg.append("defs").append("path")
        .datum(icositetragon)
        .attr("id", "icositetragon")
        .attr("d", circledPath)
        .attr("transof")

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#icositetragon");

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    // End Clipping polygon

    // Map Legend
    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "7%")
        .attr("xlink:href", "#sphere")
        .text("⬤")
        .style("fill", spouaTexture.url())
        .attr("stroke-width", ".25")
        .attr("stroke", "var(--highlite-color)")

    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "8%")
        .attr("xlink:href", "#sphere")
        .text("SPOUA") // South Pacific Ocean Uninhabited Area 

    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "11%")
        .attr("xlink:href", "#sphere")
        .text("⬤")
        .style("fill", marineTexture.url())
        .attr("stroke-width", ".25")
        .attr("stroke", "var(--second-fluo)")

    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "12%")
        .attr("xlink:href", "#sphere")
        .text("MARINE PROTECTED AREAS")

    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend navareaLegend")
        .append("textPath")
        .attr("startOffset", "22%")
        .attr("xlink:href", "#sphere")
        .text("⬤")

    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "23%")
        .attr("xlink:href", "#sphere")
        .text("NAVIGATIONAL AREAS")

    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend markerSatelliteLegend")
        .append("textPath")
        .attr("startOffset", "31%")
        .attr("xlink:href", "#sphere")
        .text("⬤") // 	⫰
        // .attr("font-size", "5px")

    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "32%")
        .attr("xlink:href", "#sphere")
        .text("REENTERING DEBRIS")


    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "39%")
        .attr("xlink:href", "#sphere")
        .text("⬤")
        .style("fill", reenteringPaths.url())
        .attr("stroke-width", ".25")
        .attr("stroke", "var(--first-fluo)")

    g.append("text")
        .attr("dy", -10)
        .attr("class", "smallLegend")
        .append("textPath")
        .attr("startOffset", "40%")
        .attr("xlink:href", "#sphere")
        .text("NOTICE TO MARINERS")

    // Navarea labels Numbers
    maps.selectAll("navarea")
        .data(topojson.object(navarea, navarea.objects.navarea)
            .geometries)
        .enter()
        .append("text")
        .attr("dy", -10)
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
        .attr("dy", -60)
        .attr("class", "navareaText")
        .attr("text-anchor", "middle")
        .attr("transform", d => { if (!isNaN(path.centroid(d)[0])) { return "translate(" + path.centroid(d) + ")" } })
        .text(d => { if (!isNaN(path.centroid(d)[0])) { return d.properties.Area } })

    .call(wrap, 70);

}

async function mapMarkers(element, scale) {
    var g = d3.select("g");

    // Connect Point with same name in a row 
    connectDebris.push(element)
    l = connectDebris.length
    previousPosition = connectDebris[l - 2];

    try {
        if (element.norad_cat_num == previousPosition.norad_cat_num) {
            // console.log(element.norad_cat_num, previousPosition.norad_cat_num)
            g.append("line")
                .attr("x1", projection([element.lon, element.lat])[0] - 1)
                .attr("y1", projection([element.lon, element.lat])[1] - 1)
                .attr("x2", projection([previousPosition.lon, previousPosition.lat])[0] - 1)
                .attr("y2", projection([previousPosition.lon, previousPosition.lat])[1] - 1)
                .attr("class", d => (element.norad_cat_num.includes("DEB")) ? "lineDebris" : "lineSatellite")

            // It empties the array
            connectDebris = []

            // Debris Legend 
            g.append("text")
                .attr("x", projection([element.lon, element.lat])[0])
                .attr('y', projection([element.lon, element.lat])[1] + .5 + "px")
                .text(d => (element.satellite_name.includes("DEB")) ? element.satellite_name.replace("DEB", "DEBRIS") : element.satellite_name)
                .attr("class", d => (element.satellite_name.includes("DEB")) ? "textDebris" : "textSatellite")
                .attr("text-anchor", "left")
                .attr('dx', d => scale(element.rcs) + 1 + "px")

            // Debris marker
            g.append("circle")
                .attr("cx", projection([element.lon, element.lat])[0] - 1)
                .attr("cy", projection([element.lon, element.lat])[1] - 1)
                .attr("class", d => (element.satellite_name.includes("DEB")) ? "markerDebris markers" : "markerSatellite markers")
                .attr("stroke", "none")
                .attr('r', d => scale(element.rcs) + "px")
        }
    } catch {
        console.error();
    }

    // Satellites Legend
    d3.selectAll(".legend").remove();

    g.append("text")
        .attr("class", "legend")
        .attr("dy", -10)
        .append("textPath")
        .attr("text-anchor", "end")
        .attr("class", "legend")
        .attr("startOffset", "58%")
        .attr("xlink:href", "#sphere")
        .text(element.satellite_decay)
        .attr("dominant-baseline", "text-top")

    // Countries 
    g.append("text")
        .attr("class", "legend")
        .attr("dy", -10)
        .append("textPath")
        .attr("text-anchor", "middle")
        .attr("class", "legend")
        .attr("xlink:href", "#sphere")
        .attr("startOffset", "60%")
        .text(element.ownership)
        .attr("dominant-baseline", "text-top")

    g.append("text")
        .attr("class", "legend")
        .attr("dy", -10)
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
        // .shapeRendering("crispEdges")
        .strokeWidth(.45)
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