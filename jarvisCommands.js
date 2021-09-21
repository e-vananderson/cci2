//Jarvis voice functions. Is the entities variable being used anywhere?
function jarvisCommand(command){
    command = command.toUpperCase();

    if (command.includes('jarvis'.toUpperCase())){
        console.log(command);
        switch (true) {

            case command =='hello Jarvis':

                speechSynthesis.speak(new SpeechSynthesisUtterance("Hello there. What can I do for you today?"));
                break;

            case command.includes('world'.toUpperCase()):
                // start viewer
                initializeViewer();

                // initialize entity selection listeners
                entitySelection();

                // initialize listener for rightclick export menu
                //exportMenuListeners();

                console.log('Viewer initialized');
                break;

            case command.includes('menu'.toUpperCase()):
                var j= document.createElement("div");
                j.id ="jarvisSpeechBox";
                var jtb = document.createTextNode("Hello there");
                j.appendChild(jtb);
                document.getElementById("NormalInterface").appendChild(j);
                console.log("here");
                break;

            case command.includes('show me United States'.toUpperCase()):
                datasourceUSmap = new Cesium.GeoJsonDataSource.load('../cesium/Apps/SampleData/ne_10m_us_states.topojson');
                addAndFlyToDataSource(datasourceUSmap);
                break;
            case (command.includes('delete United States'.toUpperCase())):
                deleteDataSource(datasourceUSmap);
                break;
            case command.includes('hide'):
                speechSynthesis.speak(new SpeechSynthesisUtterance("Sorry, that hasn't been coded  yet?"));
                break;

            case command.includes('zoom out'):
                viewer.camera.zoomOut();
                break;

            case (command.includes('show me popular'.toUpperCase())|| command.includes('show me poplar'.toUpperCase())):
                datasourcePoplarGenets = new Cesium.GeoJsonDataSource.load('./DATA/genets/Poplar_genets.geojson');
                addAndFlyToDataSource(datasourcePoplarGenets);
                break;
            case (command.includes('delete popular'.toUpperCase()) || command.includes('delete poplar'.toUpperCase())):
                deleteDataSource(datasourcePoplarGenets);
                break;
            case (command.includes('show me Pando D routes'.toUpperCase())|| command.includes('show me panda D routes'.toUpperCase())):
                startingPoint = (command.substring(command.indexOf('SHOW ME PANDO D ROUTES') + 'SHOW ME PANDO D ROUTES'.length)).trim();
                routeTable = 'routes_pando_d';
                tsParams = '{"routeTable" : "' + routeTable + '", "startingPoint" : "' + startingPoint + '"}';
                fetchWithTextBodyAndJsonResponse(fetchURLRoot + "importTsRoutes.php", tsParams);
                break;
            case (command.includes('show me Pando D'.toUpperCase())|| command.includes('show me panda D'.toUpperCase())):
                // previous pando datafile
                    // datasourcePandoPics = new Cesium.GeoJsonDataSource.load('./DATA/PMI/Pando/Pando_Pics.geojson');
                    // datasourcePandoPics.then(function (dataSource) {
                    //     flyToPandoPics = viewer.dataSources.add(dataSource);
                    //     entities = dataSource.entities.values;
                    //     viewer.flyTo(flyToPandoPics);
                    // });
                fetchAdFlyTo("6");
                break;
            case (command.includes('show me Pando E'.toUpperCase())|| command.includes('show me panda E'.toUpperCase())):
                fetchAdFlyTo("7");
                break;
            case (command.includes('show me Pando A'.toUpperCase())|| command.includes('show me panda A'.toUpperCase())):
                fetchAdFlyTo("8");
                break;
            case (command.includes('show me Pando H'.toUpperCase())|| command.includes('show me panda H'.toUpperCase())):
                fetchAdFlyTo("9");
                break;
            case (command.includes('delete Pando'.toUpperCase()) || command.includes('delete panda'.toUpperCase())):
                // datasourcePandoPics.then(function (dataSource){
                //     viewer.dataSources.remove(dataSource);
                //     viewer.resize();
                // });
                break;

            case (command.includes('show me caney'.toUpperCase())|| command.includes('show me fork'.toUpperCase())):
                // datasourceCaneyForks = new Cesium.GeoJsonDataSource.load('./DATA/PMI/Caney_Forks_Microbes.geojson');
                // addAndFlyToDataSource(datasourceCaneyForks);
                fetchAdFlyTo("14");
                break;
            // case (command.includes('delete trees'.toUpperCase()) || command.includes('delete fork'.toUpperCase())):
            //     deleteDataSource(datasourceCaneyForks);
                break;

            case (command.includes('show me davis'.toUpperCase())):
                fetchAdFlyTo("10");
                // datasourceDavis = new Cesium.GeoJsonDataSource.load('./DATA/CBI/davis.geojson');
                // addAndFlyToDataSource(datasourceDavis);
                break;
            case (command.includes('delete davis'.toUpperCase())):
                // deleteDataSource(datasourceDavis);
                break;

            case (command.includes('show me seeds'.toUpperCase())):
                fetchAdFlyTo("11");
                break;
            case (command.includes('delete seeds'.toUpperCase())):
                // deleteDataSource();
                break;

            case (command.includes('show me south carolina'.toUpperCase())):
                fetchAdFlyTo("12");
                break;
            case (command.includes('delete south carolina'.toUpperCase())):
                // deleteDataSource();
                break;

            case (command.includes('show me Midland'.toUpperCase())):
                datasourceMidland = new Cesium.GeoJsonDataSource.load('./DATA/BioScales/Midland.geojson');
                addAndFlyToDataSourceWithMinMaxCreationDates(datasourceMidland);
                break;
            case (command.includes('delete Midland'.toUpperCase())):
                deleteDataSource(datasourceMidland);
                break;

            case (command.includes('show me clean esri'.toUpperCase())):
                datasourceCleanEsri = new Cesium.GeoJsonDataSource.load('./DATA/CBI/clean_esri.geojson');
                addAndFlyToDataSourceWithMinMaxCreationDates(datasourceCleanEsri);
                break;
            case (command.includes('delete clean esri'.toUpperCase())):
                deleteDataSource(datasourceCleanEsri);
                break;

            case (command.includes('show me corvallis'.toUpperCase())):
                fetchAdFlyTo("3");
                // datasourceCorvallis = new Cesium.GeoJsonDataSource.load('./DATA/BioScales/Corvallis_Fall_2020_BioScales.geojson');
                // addAndFlyToDataSource(datasourceCorvallis);
                break;
            case (command.includes('delete corvallis'.toUpperCase())):
                // deleteDataSource(datasourceCorvallis);
                break;

            case (command.includes('show me clatskanie'.toUpperCase())):
                fetchAdFlyTo("2");
                break;

            case (command.includes('show me test data'.toUpperCase())):
                datasourceTestUpload = new Cesium.GeoJsonDataSource.load('./DATA/TestData/Oregon_Fall_35-36_TestData.geojson');
                addAndFlyToDataSourceWithMinMaxCreationDates(datasourceTestUpload);
                break;
            case (command.includes('delete test data'.toUpperCase())):
                deleteDataSource(datasourceTestUpload);
                break;

            case command.includes('download'.toUpperCase()):
                exportCSVFile('a',caneyforks,'Caney_Forks_Microbes.csv');
                console.log(caneyforks);
                break;

            // case command.includes('show me switchgrass'.toUpperCase()):
            //     datasourceSwitchGrassGenets = new Cesium.GeoJsonDataSource.load('./DATA/genets/SWG_genets.geojson');
            //     addAndFlyToDataSource(datasourceSwitchGrassGenets);
            //     break;
            // case (command.includes('delete switchgrass'.toUpperCase())):
            //     deleteDataSource(datasourceSwitchGrassGenets);
            //     break;

            case (command.includes('show me Tennessee'.toUpperCase()) || command.includes('SHOW ME SWITCHGRASS')):
                fetchAdFlyTo("13");
                // datasourceUTKSwitchGrass = new Cesium.GeoJsonDataSource.load('./DATA/CBI/UTK_switchgrass.geojson');
                // addAndFlyToDataSource(datasourceUTKSwitchGrass);
                break;
            case (command.includes('delete Tennessee'.toUpperCase())):
                // deleteDataSource(datasourceUTKSwitchGrass);
                break;

            case (command.includes('SHOW ME GARDENS') || command.includes('SHOW ME COMMON GARDENS')):
                datasourcePoplarCommonGardens = new Cesium.GeoJsonDataSource.load('./DATA/CBI/CG_centroids.geojson');
                addAndFlyToDataSource(datasourcePoplarCommonGardens);
                break;
            case (command.includes('delete Gardens'.toUpperCase())):
                deleteDataSource(datasourcePoplarCommonGardens);
                break;

            // query the database and display the rectangle selection's center points as red point markers
            case (command.includes('show me public data'.toUpperCase())):
                let publicData = "";
                fetch(fetchURLRoot + "importPublicData.php", {
                    method: "POST"
                }).then(function(response) {
                    console.log(response.headers); // returns a Headers{} object
                    response.json().then(function(myJson) {
                        console.log(myJson);
                        if (myJson.length > 0) {
                            myJson.forEach(function (geojson) {
                                datasourcePublicData = Cesium.GeoJsonDataSource.load(JSON.parse(geojson), {
                                    stroke: Cesium.Color.BLUE,
                                    fill: Cesium.Color.PINK.withAlpha(0.0),
                                    strokeWidth: 15
                                });
                                viewer.dataSources.add(datasourcePublicData);
                            });
                            // datasourcePublicData.then(function (dataSource) {
                            //     flyToPublicData = viewer.dataSources.add(dataSource);
                            //     entities = dataSource.entities.values;
                            // // viewer.flyTo(flyToPublicData);
                            // });
                        };
                    });
                });
                break;
            case (command.includes('delete public data'.toUpperCase())):
                deleteDataSource(datasourcePublicData);
                break;

            //genotype query
            case (command.includes('SHOW ME GENOTYPE') || command.includes('SHOW ME GENO TYPE')):
                genotype = '';
                // get genotype string
                if (command.includes('SHOW ME GENOTYPE')){
                    genotype = command.substring(command.indexOf('SHOW ME GENOTYPE') + 'SHOW ME GENOTYPE'.length);
                }
                else if (command.includes('SHOW ME GENO TYPE')){
                    genotype = command.substring(command.indexOf('SHOW ME GENO TYPE') + 'SHOW ME GENO TYPE'.length);
                }
                // pass genotype to DB for query
                genotype = genotype.trim();
                if (genotype.length > 0) {
                    fetchWithTextBodyAndJsonResponse(fetchURLRoot + "importGenotype.php", genotype)
                }
                break;

            case (command.includes('grin'.toUpperCase()) || command.includes('green'.toUpperCase()) ||
                command.includes('Grant')):

                speechSynthesis.speak(new SpeechSynthesisUtterance('Grin is not a person. Grin is an acronym that stands for Germplasm Resources Information Network.'));
                var grin= new SpeechSynthesisUtterance(" I see you are looking at that clone from Argentina.  That is an old one. We got it in 1968.  Here is some more info about it.");
                speechSynthesis.getVoices().forEach(function(voice) {
                    console.log(voice.name, voice.default ? voice.default :'');
                });
                grin.voice = speechSynthesis.getVoices().filter(function(voice) {return voice.name == 'Google UK English Female'})[0]

                setTimeout(() => {speechSynthesis.speak(grin)},10000)

                setTimeout(()=> {window.open('https://npgsweb.ars-grin.gov/gringlobal/accessiondetail.aspx?id=1251519')},10000)
                break;

            case (command.includes('structure'.toUpperCase())):

                setTimeout(()=> {window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?&mmdbid=146850&bu=1&showanno=1')},10000)
                break;


            case command.includes('How many'.toUpperCase()):



//speechSynthesis.speak(new SpeechSynthesisUtterance("There were 567 clones planted at the University of Tennessee Common Garden"));
                break;

            default:

                //    speechSynthesis.speak(new SpeechSynthesisUtterance('I heard' +
                //      command + ' and I am not sure I understand that.  Did I hear you correctly?'));)
                break;
        }
// End of Command Switch
    }
}

function fetchAdFlyTo(sitename_id){
    fetchWithTextBodyAndJsonResponse(fetchURLRoot + "importSiteBySitenameID.php", sitename_id);
    fetchWithTextBodyAndJsonResponseFlyTo(fetchURLRoot + "getFlyToCoords.php", sitename_id);
}

function addAndFlyToDataSource(geoJsonDataSource){
        geoJsonDataSource.then(function (dataSource) {
        flyToSource = viewer.dataSources.add(dataSource);
        entities = dataSource.entities.values;
        viewer.flyTo(flyToSource);
    });
}

function addAndFlyToDataSourceWithMinMaxCreationDates(geoJsonDataSource){
    geoJsonDataSource.then(function (dataSource) {
        flyToSource = viewer.dataSources.add(dataSource);
        entities = dataSource.entities.values;
        getMinMaxCreationDates(entities);
        viewer.flyTo(flyToSource);
    });
}

function deleteDataSource(geoJsonDataSource){
    geoJsonDataSource.then(function (dataSource){
        viewer.dataSources.remove(dataSource);
        viewer.resize();
    });
}
