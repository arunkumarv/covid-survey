let apiHost = "https://covid19.cdacchn.in:8080";

let district = { name: 'Yavatmol', id: 376 };

let taluks = null;

let villages = null;

let groupedBarChartCtx = null, groupedBarChart = null; pie1ChartCtx = null, pie1Chart = null, pie2ChartCtx = null, pie2Chart = null;

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

function updatePieChart ( chart, label, data ) {

    chart.data.labels.push(label);

    chart.data.datasets.forEach((dataset) => {

        dataset.data.push(data);
    });
    chart.update();
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

function getBar(params) {

    console.log ( "---------")

    $.get(apiHost.concat("/survey/bar"), params, function (res) {

        if (res.status == true) {

            console.log ( 'bar', res );

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

        pie1Chart.data.labels = [];

        pie1Chart.data.datasets[0].data = []

        pie1Chart.update();

        if (res.status == true) {

            console.log ( 'pie1', res );

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

        // console.log('pie2', JSON.stringify(res))

        pie2Chart.data.labels = [];

        pie2Chart.data.datasets[0].data = []

        pie2Chart.update()

        if (res.status == true) {

            console.log ( 'pie2', res );

            Object.keys(res.data).forEach(function (value, index) {

                updatePieChart(pie2Chart, value, res.data[value])
            })
        } else {

            printError("/survey/pie2", params, res)
        }

    });
}

function resToKeyValue ( obj ) {

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
    $(selectId).prepend("<option value=''>None</option>");

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

    getCounts(params);

    getBar(params);

    getPie1(params);

    getPie2(params);
}

$("#taluks").on("change", function () {

    $("#villages").empty();

    $("#areas").empty();

    if (this.value == '') return;

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

    if (this.value == '') return;

    getAreas(district.id, taluks.filter(ele => ele.name == $("#taluks").val())[0].id, villages.filter(ele => ele.name == this.value)[0].id);

    console.log($("#taluks").val(), $("#villages").val())

    let params = {

        district_id: district.id,

        taluk: parseInt(taluks.filter(ele => ele.name == $("#taluks").val())[0].id),

        village: parseInt(villages.filter(ele => ele.name == this.value)[0].id)
    }

    updateAll(params);
});

$("#areas").on("change", function () {

    if (this.value == '') return;

    console.log($("#taluks").val(), $("#villages").val(), $("#areas").val())

    let params = {

        district_id: district.id,

        taluk: parseInt(taluks.filter(ele => ele.name == $("#taluks").val())[0].id),

        village: parseInt(villages.filter(ele => ele.name == $("#villages").val())[0].id),

        area: parseInt(areas.filter(ele => ele.name == this.value)[0].id)
    }

    updateAll(params);
});

$(function () {

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

    $("#district").html ( district.name );

    getCounts ({ district_id: district.id });

    getBar ({ district_id: district.id });

    getPie1 ({ district_id: district.id });

    getPie2 ({ district_id: district.id });

    getTaluks ( district.id );
});
