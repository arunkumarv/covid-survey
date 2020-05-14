let apiHost = "https://covid19.cdacchn.in:8080";

let district = { name: 'Yavatmol', id: 376 };

let taluks = null;

let villages = null;

let areas = null;

function downloadReport() {
    let i = 30;
    let k = 6
    let fSize = 10;
    var doc = new jsPDF();

    doc.setFontSize(22);
    doc.text(20, 20, "Report");

    doc.setFontSize(fSize);
    doc.text(20, i, "District: " + district.name);
    i = i + k

    if ($("#taluks").val() != null) {
        doc.setFontSize(fSize);
        doc.text(20, i, "Taluk: " + $("#taluks").val());
        i = i + k
    }

    if ($("#villages").val() != null) {
        doc.setFontSize(fSize);
        doc.text(20, i, "Village: " + $("#villages").val());
        i = i + k
    }

    if ($("#areas").val() != null) {
        doc.setFontSize(fSize);
        doc.text(20, i, "Area: " + $("#areas").val());
        i = i + k
    }

    doc.setFontSize(fSize);
    doc.text(20, i, "Gender: " + $("input[name='gender']:checked").val());
    i = i + k

    doc.setFontSize(fSize);
    doc.text(20, i, "Report Type: " + $('input[type=radio][name=type]:checked').val());
    i = i + k

    doc.setProperties({
        title: 'Report',
        subject: 'Covid 19',
        author: 'Arunkumar V',
        keywords: 'covid',
        creator: 'CDAC'
    });

    doc.autoTable({ startY: i, html: '#report' });

    doc.save('download.pdf');
}

function addStringArrayToSelect(selectId, stringArray) {

    let options = '';

    for (let i = 0; i < stringArray.length; i++) {

        options += '<option value="' + stringArray[i] + '">' + stringArray[i] + '</option>';
    }
    $(selectId).prepend("<option value='All'>All</option>");

    $(selectId).append(options);
}

function resToKeyValue(obj) {

    let arr = [];

    for (let [key, value] of Object.entries(obj)) {

        arr.push({ id: key, name: value });
    }

    return arr;
}

function getTaluks(districtId) {
    // https://covid19.cdacchn.in:8080/survey/gettaluk?district_id=376

    $.get(apiHost.concat("/survey/gettaluk"), { district_id: districtId }, function (res) {

        console.log(res);

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

$("#taluks").on("change", function () {

    $("#villages").empty();

    $("#areas").empty();

    if (this.value == 'All') return;

    getVillages(district.id, taluks.filter(ele => ele.name == this.value)[0].id);
});

$("#villages").on("change", function () {

    $("#areas").empty();

    if (this.value == 'All') return;

    getAreas(district.id, taluks.filter(ele => ele.name == $("#taluks").val())[0].id, villages.filter(ele => ele.name == this.value)[0].id);
});

$('input[type=radio][name=type]').change(function () {

    /* if (this.value == 'symptomsBased') {

        $("#symptomsSelector").show();

        $("#dateSelector").show();

        // hide mobile

        // hide typeDate

    } else {

        $("#symptomsSelector").hide();

        $("#dateSelector").hide();
    }

    //userBased

    // dayBased */

    switch (this.value) {

        case 'symptomsBased':
            $("#symptomsSelector").show();
            $("#dateSelector").show();
            $("#mobileSelector").hide();
            $("#typeDateSelector").hide();
            break;

        case 'userBased':
            $("#symptomsSelector").hide();
            $("#dateSelector").hide();
            $("#mobileSelector").show();
            $("#typeDateSelector").hide();
            break;

        case 'dayBased':
            $("#symptomsSelector").hide();
            $("#dateSelector").hide();
            $("#mobileSelector").hide();
            $("#typeDateSelector").show();
            break;
    }
});

function exportTableToCSV($table, filename) {

    var $rows = $table.find('tr:has(td)'),

        // Temporary delimiter characters unlikely to be typed by keyboard
        // This is to avoid accidentally splitting the actual contents
        tmpColDelim = String.fromCharCode(11), // vertical tab character
        tmpRowDelim = String.fromCharCode(0), // null character

        // actual delimiter characters for CSV format
        colDelim = '","',
        rowDelim = '"\r\n"',

        // Grab text from table into CSV formatted string
        csv = '"' + $rows.map(function (i, row) {
            var $row = $(row), $cols = $row.find('td');

            return $cols.map(function (j, col) {
                var $col = $(col), text = $col.text();

                return text.replace(/"/g, '""'); // escape double quotes

            }).get().join(tmpColDelim);

        }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"';

    // Deliberate 'false', see comment below
    if (false && window.navigator.msSaveBlob) {

        var blob = new Blob([decodeURIComponent(csv)], {
            type: 'text/csv;charset=utf8'
        });

        // Crashes in IE 10, IE 11 and Microsoft Edge
        // See MS Edge Issue #10396033
        // Hence, the deliberate 'false'
        // This is here just for completeness
        // Remove the 'false' at your own risk
        window.navigator.msSaveBlob(blob, filename);

    } else if (window.Blob && window.URL) {
        // HTML5 Blob        
        var blob = new Blob([csv], {
            type: 'text/csv;charset=utf-8'
        });
        var csvUrl = URL.createObjectURL(blob);

        $(this)
            .attr({
                'download': filename,
                'href': csvUrl
            });
    } else {
        // Data URI
        var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

        $(this)
            .attr({
                'download': filename,
                'href': csvData,
                'target': '_blank'
            });
    }
}

 $(".export").on('click', function(event) {

    var args = [$('#dvData>table'), 'export.csv'];

    exportTableToCSV.apply(this, args);
  });

$(function () {

    $("#mobileSelector").hide();

    $("#typeDateSelector").hide();

    $("#districtName").html(district.name);

    getTaluks(district.id);

    $("#show-details-form").on('submit', function (e) {

        e.preventDefault();

        let obj = {};

        obj['district'] = district.id;

        console.log($("#taluks").val())

        if ($("#taluks").val() != null) obj['taluk'] = $("#taluks").val() == 'All' ? taluks.map(ele => parseInt(ele.id)) : [parseInt(taluks.filter(ele => ele.name == $("#taluks").val())[0].id)];

        if ($("#villages").val() != null) obj['village'] = $("#villages").val() == 'All' ? villages.map(ele => parseInt(ele.id)) : [parseInt(villages.filter(ele => ele.name == $("#villages").val())[0].id)];

        if ($("#areas").val() != null) obj['area'] = $("#areas").val() == 'All' ? areas.map(ele => parseInt(ele.id)) : [parseInt(areas.filter(ele => ele.name == $("#areas").val())[0].id)];

        let type = $("input[name='type']:checked").val();

        obj['type'] = type;

        switch (type) {

            case "symptomsBased":

                let symptoms = [];

                $('[name="symptoms"]:checkbox:checked').each(function (i) { symptoms[i] = $(this).val(); });

                obj['symptoms'] = symptoms;

                break;

            case 'userBased':

                let mobile = $('#mobile').val();

                obj['mobile'] = mobile

                break;

            case 'dayBased':

                let typeDate = $('#typeDate').val();

                obj['date'] = typeDate;
        }

        if (obj['type'] == 'symptomsBased') {

            let dateType = $("input[name='dateType']:checked").val();

            obj['dateType'] = dateType;

            switch (dateType) {

                case 'today':

                    // let today = new Date();

                    obj['time'] = "today";// today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate()

                    break;

                case 'range':

                    let dateMin = $('#dateMin').val();

                    let dateMax = $('#dateMax').val();

                    obj['time'] = { min: dateMin, max: dateMax };

                    break;

                case 'past':

                    let past = $("#daysPast option:selected").text();

                    obj['time'] = past;
            }
        }

        let check = $("input[name='check']:checked").val();

        obj['check'] = check;

        let gender = $("input[name='gender']:checked").val();

        obj['gender'] = gender == 'All' ? ["male", "female", "others"] : [gender];

        obj['age'] = { min: parseInt($("#minAge").val()), max: parseInt($("#maxAge").val()) }

        console.log('object', obj);

        $("#json").html(JSON.stringify(obj, null, 4))

        // let submitHost = $("#submit-host").val();
        let submitHost = $("input[name='submitHost']:checked").val();

        console.log(submitHost)

        if (submitHost != '') {

            $.post(submitHost, JSON.stringify(obj), function (res) {

                console.log(res);

                $("#report tr").remove();

                var table = $('#report');

                table.append("<tr><td>Name</td><td>Phone</td><td>Gender</td><td>Age</td><td>Symptoms</td></tr>");

                for (var i = 0; i < res.length; i++) {

                    row = $('<tr />');

                    table.append(row);

                    // console.log ( res[i])

                    for (let [key, value] of Object.entries(res[i])) {

                        // console.log(`${key}: ${value}`); 

                        cell = key == 'dataset' ? $('<td>' + Object.keys(value) + '</td>') : $('<td>' + value + '</td>')

                        row.append(cell);
                    }


                }
            });
            /*  $.ajax({
                 url: submitHost,
                 type: 'POST',
                 data: obj,
                 contentType: 'application/json; charset=utf-8',
                 dataType: 'json',
                 async: false,
                 success: function (res) {
                     console.log(res)
                 }
             }); */
        }
    });
});