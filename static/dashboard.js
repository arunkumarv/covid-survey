let apiHost = "https://covid19.cdacchn.in:8080";

let markerIconUrl = "static/red-dot.png";

let district = { name: 'Yavatmal', id: 376 };

let taluks = null;

let villages = null;

let map = null;

let markers = [];

let groupedBarChartCtx = null, groupedBarChart = null; pie1ChartCtx = null, pie1Chart = null, pie2ChartCtx = null, pie2Chart = null;

var MarkerIcon = L.Icon.extend({
    options: {
        iconSize: [10, 10],
        //shadowSize: [50, 64],
        //iconAnchor: [22, 94],
        //shadowAnchor: [4, 62],
        //popupAnchor: [-3, -76]
    }
});

var markerIcon = new MarkerIcon({ iconUrl: markerIconUrl });

var groupedBarChartData = {
    labels: [],
    datasets: [
        {
            label: "Male",
            backgroundColor: "pink",
            borderColor: "red",
            borderWidth: 1,
            data: []
        },
        {
            label: "Female",
            backgroundColor: "lightblue",
            borderColor: "blue",
            borderWidth: 1,
            data: []
        },
        {
            label: "Others",
            backgroundColor: "lightgreen",
            borderColor: "green",
            borderWidth: 1,
            data: []
        },
    ]
};

var groupedBarChartOptions = {
    responsive: true,
    legend: {
        position: "top"
    },
    title: {
        display: true,
        text: "Symptoms Status"
    },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
}

var pie1ChartData = {
    labels: [],
    datasets: [{
        label: "Male Female Others",
        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
        data: []
    }]
}

var pie1ChartOptions = {
    title: {
        display: true,
        text: 'Male Female Others'
    }
}

var pie2ChartData = {
    labels: [],
    datasets: [{
        label: "ANC/PNC",
        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
        data: []
    }]
}

var pie2ChartOptions = {
    title: {
        display: true,
        text: 'ANC/PNC'
    }
}

function findBounds(latlngs) {

    // console.clear();

    // console.log(latlngs);

    let delta = 0.1

    if (latlngs.length == 0) return null;

    if (latlngs.length == 1) return [

        [parseFloat(latlngs[0][0]) + delta, parseFloat(latlngs[0][1]) + delta],

        [parseFloat(latlngs[0][0]) - delta, parseFloat(latlngs[0][1]) - delta],
    ];

    latlngs.forEach((i, e) => latlngs[i] = [parseFloat(e[0]), parseFloat(e[1])]);

    let lats = latlngs.map(ele => ele[0]);

    let lngs = latlngs.map(ele => ele[1]);

    let bounds = [

        [Math.max.apply(null, lats), Math.max.apply(null, lngs)],

        [Math.min.apply(null, lats), Math.min.apply(null, lngs)]
    ];

    // console.log(bounds);

    return bounds;

}

function updatePieChart(chart, label, data) {

    chart.data.labels.push(label);

    chart.data.datasets.forEach((dataset) => {

        dataset.data.push(data);
    });
    chart.update();
}

function clearMarkers() {

    if (markers.length) {

        markers.forEach((marker) => {

            map.removeLayer(marker);
        });
    }
    markers = [];
}

function getCounts(params) {

    $.get(apiHost.concat("/survey/count"), params, function (res) {

        // console.log(res);

        if (res.status == true) {

            $("#Citzen").html(res.data.Citzen)

            $("#Contact-history").html(res.data['Contact-history'])

            $("#Diabetes").html(res.data['Diabetes'])

            $("#Family").html(res.data['Family'])

            $("#Hyper-tension").html(res.data['Hyper-tension'])

            $("#Travel-history").html(res.data['Travel-history'])
        }
    });
}

function printError(endpoint, params, res) {

    console.error(apiHost.concat(endpoint, "?", $.param(params)))

    console.log('input', params)

    console.log('output', res)
}

function getLink (endpoint, params ){

    return apiHost.concat ( endpoint ,"?" , $.param(params) );
}

function getMap(params) {

    $.get(apiHost.concat("/survey/getmap"), params, function (res) {

        console.log ( getLink ("/survey/getmap", params) );

        if (res.status == true) {

            console.log('map', res);

            clearMarkers()

            $.each(res.data, function (index, value) {

                // console.log(value)

                markers.push(L.marker([parseFloat(value[0]), parseFloat(value[1])], { icon: markerIcon }).addTo(map).bindPopup( value[2] + ": " + value[3] ));

                // markers.push(L.circle([parseFloat(value[0]), parseFloat(value[1])], { color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: value[2] * 10 }).addTo(map).bindPopup(""+value[2]));
            })

            let bounds = findBounds(res.data);

            if (bounds) {

                map.fitBounds(bounds);
            }
        } else {

            printError ( "/survey/bar", params, res );
        }
    });
}

function getBar(params) {

    $.get(apiHost.concat("/survey/bar"), params, function (res) {

        console.log ( getLink ("/survey/bar", params) );

        if (res.status == true) {

            console.log('bar', res);

            let labels = Object.keys(res.data);

            let maleData = [], femaleData = [], otherData = [];

            labels.forEach(function (value, index) {

                maleData.push(res.data[value].male);

                femaleData.push(res.data[value].female);

                otherData.push(res.data[value].other);
            })

            groupedBarChartData.labels = labels;

            groupedBarChartData.datasets[0].data = maleData

            groupedBarChartData.datasets[1].data = femaleData

            groupedBarChartData.datasets[2].data = otherData

            groupedBarChart.update();

        } else {

            printError("/survey/bar", params, res)
        }

    });
}

function getPie1(params) {

    $.get(apiHost.concat("/survey/pie1"), params, function (res) {

        console.log ( getLink ("/survey/pie1", params) );

        pie1Chart.data.labels = [];

        pie1Chart.data.datasets[0].data = []

        pie1Chart.update();

        if (res.status == true) {

            console.log('pie1', res);

            Object.keys(res.data).forEach(function (value, index) {

                updatePieChart(pie1Chart, value, res.data[value])
            })
        } else {

            printError("/survey/pie1", params, res)
        }
    });
}

function getPie2(params) {

    $.get(apiHost.concat("/survey/pie2"), params, function (res) {

        console.log ( getLink ("/survey/pie2", params) );
        // console.log('pie2', JSON.stringify(res))

        pie2Chart.data.labels = [];

        pie2Chart.data.datasets[0].data = []

        pie2Chart.update()

        if (res.status == true) {

            console.log('pie2', res);

            Object.keys(res.data).forEach(function (value, index) {

                updatePieChart(pie2Chart, value, res.data[value])
            })
        } else {

            printError("/survey/pie2", params, res)
        }

    });
}

function resToKeyValue(obj) {

    let arr = [];

    for (let [key, value] of Object.entries(obj)) {

        arr.push({ id: key, name: value });
    }

    return arr;
}

function addStringArrayToSelect(selectId, stringArray) {

    let options = '';

    for (let i = 0; i < stringArray.length; i++) {

        options += '<option value="' + stringArray[i] + '">' + stringArray[i] + '</option>';
    }
    $(selectId).prepend("<option value=''>All</option>");

    $(selectId).append(options);
}

function getTaluks(districtId) {

    // https://covid19.cdacchn.in:8080/survey/gettaluk?district_id=376

    $.get(apiHost.concat("/survey/gettaluk"), { district_id: districtId }, function (res) {

        // console.log(res);

        if (res.status == true) {

            taluks = resToKeyValue(res.data);

            addStringArrayToSelect("#taluks", taluks.map(ele => ele.name));

        } else {

            alert('gettaluk', res);
        }
    });
}

function getVillages(districtId, talukId) {
    // https://covid19.cdacchn.in:8080/survey/getvillage?district_id=376&taluk=1

    $.get(apiHost.concat("/survey/getvillage"), { district_id: districtId, taluk: talukId }, function (res) {

        if (res.status == true) {

            villages = resToKeyValue(res.data);

            addStringArrayToSelect("#villages", villages.map(ele => ele.name));

        } else {

            alert('getvillage', res);
        }
    });
}

function getAreas(districtId, talukId, villageId) {

    // https://covid19.cdacchn.in:8080/survey/getarea?district_id=376&taluk=1&village=1

    $.get(apiHost.concat("/survey/getarea"), { district_id: districtId, taluk: talukId, village: villageId }, function (res) {

        if (res.status == true) {

            areas = resToKeyValue(res.data);

            addStringArrayToSelect("#areas", areas.map(ele => ele.name));

        } else {

            alert('getareas', res);
        }
    });
}

function updateAll(params) {

    console.log("-----API Calls----")

    getMap(params);

    getCounts(params);

    getBar(params);

    getPie1(params);

    getPie2(params);
}

$("#taluks").on("change", function () {

    $("#villages").empty();

    $("#areas").empty();

    if (this.value == '') {

        updateAll({ district_id: district.id });

        return;
    }

    getVillages(district.id, taluks.filter(ele => ele.name == this.value)[0].id);

    console.log($("#taluks").val())

    let params = {

        district_id: district.id,

        taluk: parseInt(taluks.filter(ele => ele.name == this.value)[0].id)
    };

    updateAll(params);
});

$("#villages").on("change", function () {

    $("#areas").empty();

    if (this.value == '') {

        updateAll({ district_id: district.id, taluk: taluks.filter(ele => ele.name == $("#taluks").val())[0].id });

        return;
    }

    getAreas(district.id, taluks.filter(ele => ele.name == $("#taluks").val())[0].id, villages.filter(ele => ele.name == this.value)[0].id);

    // console.log($("#taluks").val(), $("#villages").val())

    let params = {

        district_id: district.id,

        taluk: parseInt(taluks.filter(ele => ele.name == $("#taluks").val())[0].id),

        village: parseInt(villages.filter(ele => ele.name == this.value)[0].id)
    }

    updateAll(params);
});

$("#areas").on("change", function () {

    if (this.value == '') {

        updateAll({

            district_id: district.id,

            taluk: parseInt(taluks.filter(ele => ele.name == $("#taluks").val())[0].id),

            village: parseInt(villages.filter(ele => ele.name == $("#villages").val())[0].id),
        });

        return;
    }

    console.log($("#taluks").val(), $("#villages").val(), $("#areas").val())

    let params = {

        district_id: district.id,

        taluk: parseInt(taluks.filter(ele => ele.name == $("#taluks").val())[0].id),

        village: parseInt(villages.filter(ele => ele.name == $("#villages").val())[0].id),

        area: parseInt(areas.filter(ele => ele.name == this.value)[0].id)
    }

    updateAll(params);
});

$("#ak-reset").on("click", function () {

    resetAll();
});

function resetAll() {

    updateAll({ district_id: district.id })

    $("#taluks").empty();

    $("#villages").empty();

    $("#areas").empty();

    getTaluks(district.id);
}

$(function () {

    map = L.map('mapid').setView([21.106825, 79.918830], 5);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 'attribution': 'Map data &copy; OpenStreetMap contributors' }).addTo(map);
    // L.tileLayer.wms('https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms?', {layers: 'indiainf',maxZoom: 18 }).addTo(map);

    groupedBarChartCtx = document.getElementById("groupedBarChart").getContext("2d");

    groupedBarChart = new Chart(groupedBarChartCtx, {
        type: "bar",
        data: groupedBarChartData,
        options: groupedBarChartOptions
    });

    pie1ChartCtx = document.getElementById("pie1Chart").getContext("2d");

    pie1Chart = new Chart(pie1ChartCtx, {
        type: 'pie',
        data: pie1ChartData,
        options: pie1ChartOptions
    });

    pie2ChartCtx = document.getElementById("pie2Chart").getContext("2d");

    pie2Chart = new Chart(pie2ChartCtx, {
        type: 'pie',
        data: pie2ChartData,
        options: pie2ChartOptions
    });

    $("#district").html(district.name);

    resetAll();
});
