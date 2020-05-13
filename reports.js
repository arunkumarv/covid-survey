
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

        function getTaluks(name) {

            taluks = [
                { name: 'aaa', id: 123 },
                { name: 'bbb', id: 234 },
                { name: 'ccc', id: 345 },
                { name: 'ddd', id: 456 },
            ];

            addStringArrayToSelect("#taluks", taluks.map(ele => ele.name));
        }

        function getVillages(name) {

            villages = [
                { name: 'eee', id: 123 },
                { name: 'fff', id: 234 },
                { name: 'ggg', id: 345 },
                { name: 'hhh', id: 456 },
            ];

            addStringArrayToSelect("#villages", villages.map(ele => ele.name));
        }

        function getAreas(name) {

            areas = [
                { name: 'iii', id: 123 },
                { name: 'jjj', id: 234 },
                { name: 'kkk', id: 345 },
                { name: 'lll', id: 456 },
            ];

            addStringArrayToSelect("#areas", areas.map(ele => ele.name));
        }

        $("#taluks").on("change", function () {

            $("#villages").empty();

            $("#areas").empty();

            if (this.value == 'All') return;

            getVillages(this.value);
        });

        $("#villages").on("change", function () {

            $("#areas").empty();

            if (this.value == 'All') return;

            getAreas(this.value);
        });

        $('input[type=radio][name=type]').change(function () {

            if (this.value == 'symptomsBased') {

                $("#symptomsSelector").show();

                $("#dateSelector").show();

            } else {

                $("#symptomsSelector").hide();

                $("#dateSelector").hide();
            }
        });

        // function getVillages
        $(function () {

            let district = { name: 'Yamaha', id: 1234 };

            $("#districtName").html(district.name);

            getTaluks(district.name);

            $("#show-details-form").on('submit', function (e) {

                e.preventDefault();

                let obj = {};

                obj['district'] = district.id;

                console.log($("#taluks").val())

                if ($("#taluks").val() != null) obj['taluk'] = $("#taluks").val() == 'All' ? taluks.map(ele => ele.id) : [taluks.filter(ele => ele.name == $("#taluks").val())[0].id];

                if ($("#villages").val() != null) obj['village'] = $("#villages").val() == 'All' ? villages.map(ele => ele.id) : [villages.filter(ele => ele.name == $("#villages").val())[0].id];

                if ($("#areas").val() != null) obj['area'] = $("#areas").val() == 'All' ? areas.map(ele => ele.id) : [areas.filter(ele => ele.name == $("#areas").val())[0].id];

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

                obj['gender'] = gender == 'All' ? ["Male", "Female", "Others"]: [gender];

                let minAge = $("#minAge").val();

                let maxAge = $("#maxAge").val();

                obj['age'] = { min: minAge, max: maxAge }

                console.log('object', obj);

                $("#json").html(JSON.stringify(obj, null, 4))

                let api = $("#api").val();

                if (api != '') {

                    $.ajax({
                        url: api,
                        type: 'POST',
                        data: JSON.stringify(obj),
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        async: false,
                        success: function (res) {
                            console.log(res)
                        }
                    });
                }
            });
        });