let apiHost = "https://covid19.cdacchn.in:8080";

let district = { name: 'Yavatmal', id: 0 };

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
    if ($('input[type=radio][name=type]:checked').val() != 'userBased') {
        if ($("#taluks").val() != null) {
            doc.text(20, i, "Taluk: " + $("#taluks").val());
            i = i + k
        }

        if ($("#villages").val() != null) {
            doc.text(20, i, "Village: " + $("#villages").val());
            i = i + k
        }

        if ($("#areas").val() != null) {
            doc.text(20, i, "Area: " + $("#areas").val());
            i = i + k
        }
    } else {

        doc.text(20, i, "Taluk: " + "All");
        i = i + k

        doc.text(20, i, "Village: " + "All");
        i = i + k

        doc.text(20, i, "Area: " + "All");
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

    doc.save('report.pdf');
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
            $("#genderAndAge").show();
            $("#taluksVillagesAreas").show()
            break;

        case 'userBased':
            $("#symptomsSelector").hide();
            $("#dateSelector").hide();
            $("#mobileSelector").show();
            $("#typeDateSelector").hide();
            $("#genderAndAge").hide();
            $("#taluksVillagesAreas").hide()
            break;

        case 'dayBased':
            $("#symptomsSelector").hide();
            $("#dateSelector").hide();
            $("#mobileSelector").hide();
            $("#typeDateSelector").show();
            $("#genderAndAge").show();
            $("#taluksVillagesAreas").show()
            break;
    }
});

function futureDateDisable() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById("typeDate").setAttribute("max", today);
}

function exportTableToCSV($table, filename) {

    var $rows = $table.find('tr:has(td)'),

        tmpColDelim = String.fromCharCode(11),

        tmpRowDelim = String.fromCharCode(0), 

        colDelim = '","',

        rowDelim = '"\r\n"',

        csv = '"DISTRICT","' + district.name + '"\r\n';

    if ($('input[type=radio][name=type]:checked').val() != 'userBased') {

        if ($("#taluks").val() != null) csv += '"TALUK","' + $("#taluks").val() + '"\r\n';

        if ($("#villages").val() != null) csv += '"VILLAGE","' + $("#villages").val() + '"\r\n';

        if ($("#areas").val() != null) csv += '"AREA","' + $("#areas").val() + '"\r\n';

    } else {

        csv += '"TALUK","' + "All" + '"\r\n';

        csv += '"VILLAGE","' + "All" + '"\r\n';

        csv += '"AREA","' + "All" + '"\r\n';
    }
    csv += '"GENDER","' + $("input[name='gender']:checked").val() + '"\r\n';

    csv += '"REPORT TYPE","' + $("input[type=radio][name=type]:checked").val() + '"\r\n';

    csv += '\r\n';

    csv += '"' + $rows.map(function (i, row) {

        var $row = $(row), $cols = $row.find('td');

        return $cols.map(function (j, col) {

            var $col = $(col), text = $col.text();

            return text.replace(/"/g, '""'); 

        }).get().join(tmpColDelim);

    }).get().join(tmpRowDelim)
        .split(tmpRowDelim).join(rowDelim)
        .split(tmpColDelim).join(colDelim) + '"';

    console.log(csv)

    if (false && window.navigator.msSaveBlob) {

        var blob = new Blob([decodeURIComponent(csv)], {
            type: 'text/csv;charset=utf8'
        });

        window.navigator.msSaveBlob(blob, filename);

    } else if (window.Blob && window.URL) {

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

        var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

        $(this)
            .attr({
                'download': filename,
                'href': csvData,
                'target': '_blank'
            });
    }
}

$(".export").on('click', function (event) {

    var args = [$('#dvData>table'), 'report.csv'];

    exportTableToCSV.apply(this, args);
});

$("#response-element").hide();

$("#mobileSelector").hide();

$("#typeDateSelector").hide();

$("#show-details-form").on('submit', function (e) {

    e.preventDefault();

    $("#response-element").show();

    let obj = {};

    district.id = parseInt($("#distId").val());

    obj['district'] = district.id;

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

    if (obj['type'] != 'userBased') {

        if ($("#taluks").val() != null && $("#taluks").val() != 'All' ) obj['taluk'] = $("#taluks").val() == 'All' ? taluks.map(ele => parseInt(ele.id)) : [parseInt(taluks.filter(ele => ele.name == $("#taluks").val())[0].id)];

        if ($("#villages").val() != null && $("#villages").val() != 'All' ) obj['village'] = $("#villages").val() == 'All' ? villages.map(ele => parseInt(ele.id)) : [parseInt(villages.filter(ele => ele.name == $("#villages").val())[0].id)];

        if ($("#areas").val() != null && $("#areas").val() != 'All' ) obj['area'] = $("#areas").val() == 'All' ? areas.map(ele => parseInt(ele.id)) : [parseInt(areas.filter(ele => ele.name == $("#areas").val())[0].id)];
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

    $.post(apiHost.concat("/api/report"), JSON.stringify(obj), function (res) {

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
                let cell;

                if (key == 'dataset') {

                    console.log(value)

                    let str = '';

                    console.log(Object.entries(value))

                    for (let [k, v] of Object.entries(value)) {

                        str += k + ": ";

                        Object.keys(v).forEach(e => str += e + ", ");

                        str += '<br>'
                    }

                    cell = $('<td>' + str + '</td>')

                } else {

                    cell = $('<td>' + value + '</td>')
                }

                row.append(cell);
            }
        }
    });

});


$(function () {

    futureDateDisable();

    $("#districtName").html(district.name);

    getTaluks(district.id);
});