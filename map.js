const urlParams = new URLSearchParams(window.location.search);
const currentCityId = urlParams.get('city') || 'istanbul';

const HOVER_COLOR = "#EFAE88";
const MAP_COLOR = "#fff2e3";

let cityCount = 0;
let cityMeta = null;
const storageKey = `selectedDistricts_${currentCityId}`;

// Fetch metadata for 81 cities dynamically
fetch('data/cities.json')
  .then(response => response.json())
  .then(citiesMeta => {
    cityMeta = citiesMeta[currentCityId] || citiesMeta['istanbul'];
    
    // Set document title and initial counts
    document.title = `${cityMeta.name}Visited`;
    document.getElementById('total_count').textContent = cityMeta.count;
    document.getElementById('city_name_display').textContent = cityMeta.name;

    cityCount = localStorage.getItem(storageKey)
      ? JSON.parse(localStorage.getItem(storageKey)).length
      : 0;
    document.getElementById("city_count").innerHTML = cityCount;

    // Load GeoJSON map data
    loadMapData();
  })
  .catch(err => {
    console.error("Error loading cities metadata:", err);
    document.getElementById("map_container").innerHTML = `<p style="color:red; text-align:center;">Şehir verileri yüklenemedi.</p>`;
  });

function loadMapData() {
  d3.json(`data/${currentCityId}-districts.json`).then(function (data) {
    let width = 900;
    let height = 550;
    let projection = d3.geoEqualEarth();
    projection.fitSize([width, height], data);
    let path = d3.geoPath().projection(projection);

    let svg = d3
      .select("#map_container")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    let g = svg
      .append("g")
      .selectAll("path")
      .data(data.features)
      .join("path")
      .attr("d", path)
      .attr("fill", function (d, i) {
        if (localStorage.getItem(storageKey)) {
          if (
            JSON.parse(localStorage.getItem(storageKey)).includes(
              d.properties.Name || d.properties.name
            )
          ) {
            d.noFill = true;
            return HOVER_COLOR;
          } else return MAP_COLOR;
        } else return MAP_COLOR;
      })
      .attr("stroke", "#000")
      .on("mouseover", function (d, i) {
        d3.select(this).attr("fill", HOVER_COLOR);
        const labelId = "#label-" + (d.properties.Name || d.properties.name).replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ]/g, '');
        d3.select(labelId).style("opacity", "1").style("font-weight", "bold");
      })
      .on("mouseout", function (d, i) {
        if (!d.noFill) d3.select(this).attr("fill", MAP_COLOR);
        const labelId = "#label-" + (d.properties.Name || d.properties.name).replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ]/g, '');
        const bounds = path.bounds(d);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const name = d.properties.Name || d.properties.name;
        const originalOpacity = (dx > name.length * 6.5 && dy > 15) ? "1" : "0";
        d3.select(labelId).style("opacity", originalOpacity).style("font-weight", "normal");
      })
      .on("click", function (d, i) {
        d.noFill = d.noFill || false;
        const distName = d.properties.Name || d.properties.name;
        if (!d.noFill) {
          cityCount++;
          document.getElementById("city_count").innerHTML = cityCount;
          d3.select(this).attr("fill", HOVER_COLOR);

          //add selected city to localStorage
          if (localStorage.getItem(storageKey)) {
            let tempSelectedCities = JSON.parse(
              localStorage.getItem(storageKey)
            );
            if (tempSelectedCities.includes(distName)) return;
            tempSelectedCities.push(distName);
            localStorage.setItem(
              storageKey,
              JSON.stringify(tempSelectedCities)
            );
          } else {
            let tempArr = [];
            tempArr.push(distName);
            localStorage.setItem(storageKey, JSON.stringify(tempArr));
          }
        } else {
          cityCount--;
          document.getElementById("city_count").innerHTML = cityCount;
          d3.select(this).attr("fill", MAP_COLOR);

          //remove from localStorage
          let tempSelectedCities = JSON.parse(
            localStorage.getItem(storageKey)
          );
          const index = tempSelectedCities.indexOf(distName);
          if (index !== -1) {
            tempSelectedCities.splice(index, 1);
          }
          localStorage.setItem(
            storageKey,
            JSON.stringify(tempSelectedCities)
          );
        }
        d.noFill = !d.noFill;
      });

    g = svg.append("g");

    g.selectAll("text")
      .data(data.features)
      .enter()
      .append("text")
      .text(function (d) {
        return d.properties.Name || d.properties.name;
      })
      .attr("x", function (d) {
        return path.centroid(d)[0];
      })
      .attr("y", function (d) {
        return path.centroid(d)[1];
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "10pt")
      .attr("id", function(d) {
        return "label-" + (d.properties.Name || d.properties.name).replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ]/g, '');
      })
      .style("fill", "black")
      .style("pointer-events", "none")
      .style("transition", "opacity 0.2s")
      .style("opacity", function(d) {
        const bounds = path.bounds(d);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const name = d.properties.Name || d.properties.name;
        return (dx > name.length * 6.5 && dy > 15) ? "1" : "0";
      });
  }).catch(err => {
      console.error("Error loading map data:", err);
      document.getElementById("map_container").innerHTML = `<p style="color:red; text-align:center;">Harita verisi yüklenemedi. (${currentCityId})</p>`;
  });
}

function downloadMap() {
  if(!cityMeta) return;
  let div = document.getElementById("map_container");
  html2canvas(div).then(function (canvas) {
    var destCanvas = document.createElement("canvas");
    destCanvas.width = canvas.width;
    destCanvas.height = canvas.height;
    var destCtx = destCanvas.getContext("2d");
    destCtx.drawImage(canvas, 0, 0);

    const ctx = destCanvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "2em 'Outfit', sans-serif";
    ctx.fillStyle = "black";
    ctx.textAlign = "start";
    ctx.fillText(`${cityMeta.name}Visited`, 10, canvas.height - 35);
    ctx.fillText(cityCount + `/${cityMeta.count}`, 10, 5);

    destCanvas.toBlob(function (blob) {
      saveAs(blob, `${currentCityId}visited.png`);
    });
  });
}

function resetButton() {
  localStorage.removeItem(storageKey)
  cityCount = 0; document.getElementById("city_count").innerHTML = cityCount;
  location.reload();
}
