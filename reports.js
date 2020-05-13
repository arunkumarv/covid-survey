let apiHost = "https://covid19.cdacchn.in:8080";

let district = { name: 'Yavatmol', id: 376 };

let taluks = null;

let villages = null;

let areas = null;

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
            $("#mobile").hide();
            $("#typeDate").hide();
            break;

        case 'userBased':
            $("#symptomsSelector").hide();
            $("#dateSelector").hide();
            $("#mobile").show();
            $("#typeDate").hide();
            break;

        case 'dayBased':
            $("#symptomsSelector").hide();
            $("#dateSelector").hide();
            $("#mobile").hide();
            $("#typeDate").show();
            break;
    }
});

$(function () {

    $("#mobile").hide();

    $("#typeDate").hide();

    $("#districtName").html(district.name);

    getTaluks(district.id);

    $("#show-details-form").on('submit', function (e) {

        e.preventDefault();

        let obj = {};

        obj['district'] = district.id;

        console.log($("#taluks").val())

        if ($("#taluks").val() != null) obj['taluk'] = $("#taluks").val() == 'All' ? taluks.map(ele => parseInt(ele.id)) : [parseInt (taluks.filter(ele => ele.name == $("#taluks").val())[0].id)];

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

                    let today = new Date();

                    obj['time'] = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate()

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

        let submitHost = $("#submit-host").val();

         /* if (submitHost != '') {

             $.ajax({
                 url: submitHost,
                 type: 'POST',
                 data: JSON.stringify(obj),
                 contentType: 'application/json; charset=utf-8',
                 dataType: 'json',
                 async: false,
                 success: function (res) {
                     console.log(res)
                 }
             });
         }  */
    });
});