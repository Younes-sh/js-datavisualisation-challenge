var table1 = document.getElementById("table1");
var table2 = document.getElementById("table2");
var bodyContent = document.getElementById("bodyContent");

//Set up graph 1 Labels
var graph1LabelsArray = [];
var table1RowsArray = Array.from(table1.querySelectorAll("tbody>tr")); 

Array.from(table1RowsArray[0].querySelectorAll("th")).forEach(element => {
    if(hasNumber(element.textContent)){
        graph1LabelsArray.push(element.textContent);
    }
});

//Get table 1 Datas and DataLabels
var table1DatasArray = [];
var table1DataLabelsArray = [];

table1RowsArray.splice(0, 1);

table1RowsArray.forEach(element => {
    let table1AllTableDataArray = [];
    Array.from(element.querySelectorAll("td")).forEach((element, index) => {
        if(index == 0){
            table1DataLabelsArray.push((element.textContent).replace(/[^a-zA-Z ]/g, ""));
        }
        if(hasNumber(element.textContent)){
            table1AllTableDataArray.push(parseFloat((element.textContent).replace(",", ".")));
        }
    });
    table1DatasArray.push(table1AllTableDataArray);
});

//Set up graph 1 Data Objects
var graph1DataObjectsArray = CreateMultipleLinesGraphDataObjectsArray(table1DatasArray, table1DataLabelsArray);

//Set up graph 1 aria label
var graph1ArialLabel = "Graph about the crimes recorded by the police on 10 years in differents countries";

//create graph 1 
CreateGraph(null, table1, "graph1", "graph1", "800px", "600px", graph1ArialLabel, "img", graph1LabelsArray, graph1DataObjectsArray, {}, "line");

//Set up graph 2 and 2Bis Titles and Subtitles
var graph2Title = table2.querySelector("caption").textContent;
var graph2Subtitle = table2.querySelectorAll("thead>tr>th")[2].textContent;
var graph2BisSubtitle = table2.querySelectorAll("thead>tr>th")[3].textContent;

var graph2Options = CreateGraphOptions(false, graph2Subtitle);
var graph2BisOptions = CreateGraphOptions(false, graph2BisSubtitle);

//Get graph 2 and 2 bis Datas and DataLabels
var graph2DatasArray = [];
var graph2BisDatasArray = [];

var graph2DataLabelsArray = [];

var table2RowsArray = Array.from(table2.querySelectorAll("tbody>tr"));
table2RowsArray.forEach(element => {
    let table2TDsArray = Array.from(element.querySelectorAll("td"));
    graph2DataLabelsArray.push(table2TDsArray[0].textContent);
    graph2DatasArray.push(parseFloat(table2TDsArray[1].textContent));
    graph2BisDatasArray.push(parseFloat(table2TDsArray[2].textContent));
});

//Set up graph 2 and 2 bis Data Objects
var graph2ColorsArray = GenerateColorsArray(graph2DatasArray.length);
var graph2DataObjectsArray = CreatePieGraphDataObjectsArray(graph2DatasArray, graph2ColorsArray);
var graph2BisDataObjectsArray = CreatePieGraphDataObjectsArray(graph2BisDatasArray, graph2ColorsArray);

//Set up graph 2 and bis aria labels
var graph2ArialLabel = "Graph about the prison population on average during years 2007-09 in different countries";
var graph2BisArialLabel = "Graph about the prison population on average during years 2010-12 in different countries";

//Create graph 2 div 
var graph2Div = document.createElement("div");
var graph2MainTitle = document.createElement("p");
graph2MainTitle.textContent = graph2Title;
graph2MainTitle.setAttribute("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center");
graph2Div.appendChild(graph2MainTitle);

//create graph 2 
var graph2 = CreateGraph(graph2Div, null, "col-lg-6 col-md-6 col-sm-6 col-xs-6", "graph2", "400px", "400px", graph2ArialLabel, "img", graph2DataLabelsArray, graph2DataObjectsArray, graph2Options, "pie").canvas;

//create graph 2 bis
var graph2Bis = CreateGraph(graph2Div, null, "col-lg-6 col-md-6 col-sm-6 col-xs-6", "graph2Bis", "400px", "400px", graph2BisArialLabel, "img", graph2DataLabelsArray, graph2BisDataObjectsArray, graph2BisOptions, "pie").canvas;

table2.parentNode.insertBefore(graph2Div, table2);

var graphServerDataLabelsArray = [];
var graphServer = null;
var iterationCount = 0;

getDataPoints();

function getDataPoints()
{
    const noCacheURL = `https://canvasjs.com/services/data/datapoints.php?cache=${Math.random() * 1000000}`;

    fetch(noCacheURL)
    .then(response => {
        return response.json();
    })
    .then(datapoints => {
        UpdateGraph(datapoints);
    });

    setTimeout(() => {
        getDataPoints();
    }, 1000);
}

function UpdateGraph(dataArray){
    
    if(graphServer != null){
        var tempLabelArray = [];
        var tempDataArray = [];
        dataArray.forEach(element => {
            tempLabelArray.push((iterationCount * dataArray.length) + element[0]);
            var newData = [iterationCount * dataArray.length + element[0], element[1]];
            tempDataArray.push(newData);
        });
        addData(graphServer, tempLabelArray, tempDataArray);
        iterationCount++;
    }else{
        var graphServerAriaLabel = "Example live graph";
        var graphServerDataName = "Remote Data"
        var tempLabelArray = [];
        dataArray.forEach(element => {
            tempLabelArray.push(element[0]);
        });
        graphServerDataLabelsArray = tempLabelArray;
        var graphServerDataObjectsArray = CreateSingleLineGraphDataObjectsArray(dataArray, graphServerDataName, 0 , 5);
        graphServer = CreateGraph(null, bodyContent, "graphServer", "graphServer", "800px", "400px", graphServerAriaLabel, "img", graphServerDataLabelsArray, graphServerDataObjectsArray, {}, "line");
        iterationCount++;
    }
}

//////////////////////////////////////////////////////////////////////////// CUSTOM FUNCTIONS ////////////////////////////////////////////////////////////////////////////

function addData(chart, label, dataPoints) {
    for(let i in label){
        chart.config.data.labels.push(label[i]);
    }
    for(let j in dataPoints){
        chart.config.data.datasets.forEach((dataset) => {
            dataset.data.push(dataPoints[j]);
        });
    }
    chart.update();
}

/**
 * Function to create a graph with the given parameters
 * @param {Element} parentElement The parent element to append the canvas (if no need then give it a null)
 * @param {Element} referenceTable The table used as a reference. It contains the datas of the graph and will be placed just below the graph (if no need then give it a null)
 * @param {String} graphClass The class of the graph canvas
 * @param {String} graphId The id of the graph canvas
 * @param {*} graphWidth The width in pixels of the graph canvas
 * @param {*} graphHeight The height in pixels of the graph canvas
 * @param {*} graphAriaLabel The aria label of the graph
 * @param {*} graphRole the role of the graph
 * @param {*} graphLabels The Array of Labels for the graph
 * @param {*} graphDatas The Array of Datas Objects used in the graph to draw datas
 * @param {*} graphOptions The options Objects used to customize the graph
 * @param {*} graphConfigType The type of the graph (see all graph types of chart.js)
 * @returns the created graph
 */
function CreateGraph(parentElement, referenceTable, graphClass, graphId, graphWidth, graphHeight, graphAriaLabel, graphRole, graphLabels, graphDatas, graphOptions, graphConfigType){
    var graphCanvas = document.createElement("canvas");
    graphCanvas.setAttribute("class", graphClass);
    graphCanvas.setAttribute("id", graphId);
    graphCanvas.setAttribute("width", graphWidth);
    graphCanvas.setAttribute("height", graphHeight);
    graphCanvas.setAttribute("aria-label", graphAriaLabel);
    graphCanvas.setAttribute("role", graphRole);

    var ctx = graphCanvas.getContext("2d");
    var data = {
    labels: graphLabels,
    datasets: graphDatas
    };

    var options = graphOptions;

    var config = {
    type: graphConfigType,
    data: data,
    options: options
    };

    var graphChart = new Chart(ctx, config);

    if(parentElement != null){
        parentElement.appendChild(graphCanvas);
    }

    if(referenceTable != null){
        referenceTable.parentNode.insertBefore(graphCanvas, referenceTable);
    }

    return graphChart;
}

/**
 * Create an options object
 * @param {Boolean} responsive Is the graph responsive or not
 * @param {String} title (Optionnal Parameter) Title of the graph
 * @param {String} subtitle (Optionnal Parameter) Subtitle of the graph
 * @returns the options object of the graph
 */
function CreateGraphOptions(responsive, title, subtitle){
    var options = new Object();
    options.responsive = responsive;
    var pluginObject = new Object();
    if(typeof title !== "undefined"){
        var pluginTitleObject = new Object();
        pluginTitleObject.display = true;
        pluginTitleObject.text = title;

        pluginObject.title = pluginTitleObject;
    }
    if(typeof subtitle !== "undefined"){
        var pluginSubtitleObject = new Object();
        pluginSubtitleObject.display = true;
        pluginSubtitleObject.text = subtitle;
        
        pluginObject.subtitle = pluginSubtitleObject;
    }

    options.plugins = pluginObject;

    return options;
}

/**
 * Create an array of data objects with the given array of datas and data labels
 * @param {Array} datasArray Array of datas
 * @param {Array} dataLabelsArray Array of data labels
 * @returns An array of data Objects
 */
function CreateMultipleLinesGraphDataObjectsArray(datasArray, dataLabelsArray){
    var dataObjectsArray = [];

    for(let i = 0; i < datasArray.length; i++){
        let obj = new Object();
        obj.data = datasArray[i];
        obj.label = dataLabelsArray[i];
        obj.borderColor = `rgb(${randomNumber0Max(255)}, ${randomNumber0Max(255)}, ${randomNumber0Max(255)})`;
        dataObjectsArray.push(obj);
    }

    return dataObjectsArray;
}

function CreateSingleLineGraphDataObjectsArray(datasArray, dataLabelsArray, pointRadius, pointRadiusHover){
    var dataObjectsArray = [];

    let obj = new Object();
    obj.data = datasArray;
    obj.label = dataLabelsArray;
    let randomColorOpacity = 1;
    let randomColor = `rgba(${randomNumber0Max(255)}, ${randomNumber0Max(255)}, ${randomNumber0Max(255)}, ${randomColorOpacity})`;
    randomColorTransparent = changeColorOpacity(randomColor, 0.5);
    obj.borderColor = randomColor;
    obj.backgroundColor = randomColorTransparent;
    obj.pointRadius = pointRadius;
    obj.pointHoverRadius = pointRadiusHover;
    dataObjectsArray.push(obj);

    return dataObjectsArray;
}

function changeColorOpacity(colorString, newOpacity){
    let colorChannels = colorString.split(",");
    colorChannels[colorChannels.length - 1] = (" " + newOpacity + ")");
    
    let newColor = "";
    colorChannels.forEach((element, index) => {
        newColor += index == colorChannels.length-1 ? element : element + ",";
    });
    return newColor;
}

/**
 * Create an array of one data object with the given array of datas
 * @param {Array} datasArray Array of datas
 * @param {Array} colorArray Array of colors
 * @returns An array of one data object
 */
function CreatePieGraphDataObjectsArray(datasArray, colorArray){
    var dataObjectsArray = [];

    let obj = new Object();
    obj.data = datasArray;
    obj.backgroundColor = colorArray;

    dataObjectsArray.push(obj);
    
    return dataObjectsArray;
}

/**
 * Create an Array with random colors
 * @param {Number} colorAmount Amount of random colors to Generate
 * @returns An array of random Colors text
 */
function GenerateColorsArray(colorAmount){
    var colorsArray = [];
    for(let i = 0; i < colorAmount; i++){
        let randomColorText = `rgb(${randomNumber0Max(255)}, ${randomNumber0Max(255)}, ${randomNumber0Max(255)})`;
        colorsArray.push(randomColorText);
    }
    return colorsArray;
}

/**
 * Check if the given string is a number
 * @param {String} string The string to check if it is a number
 * @returns A boolean, true if the string is a number and false if not
 */
function hasNumber(string){
    return /\d/.test(string);
}

/**
 * Generate a random number between 0 and the given max range value
 * @param {Number} rangeMax The random Max range (random will be between 0 and this value)
 * @returns a random number between 0 and the given max range value
 */
function randomNumber0Max(rangeMax){
    return (Math.random()* rangeMax);
}