// Dummy Placement Statistics Data (2011-2024)
var placementData = [
    { y: 120, label: "2011" },
    { y: 180, label: "2012" },
    { y: 250, label: "2013" },
    { y: 300, label: "2014" },
    { y: 350, label: "2015" },
    { y: 400, label: "2016" },
    { y: 450, label: "2017" },
    { y: 500, label: "2018" },
    { y: 550, label: "2019" },
    { y: 600, label: "2020" },
    { y: 650, label: "2021" },
    { y: 700, label: "2022" },
    { y: 750, label: "2023" },
    { y: 800, label: "2024" }
];

// Dummy Average Package Statistics Data (in Lakhs/Annum) (2011-2024)
var averagePackageData = [
    { y: 6, label: "2011" },
    { y: 8, label: "2012" },
    { y: 10, label: "2013" },
    { y: 12, label: "2014" },
    { y: 14, label: "2015" },
    { y: 16, label: "2016" },
    { y: 18, label: "2017" },
    { y: 20, label: "2018" },
    { y: 22, label: "2019" },
    { y: 24, label: "2020" },
    { y: 26, label: "2021" },
    { y: 28, label: "2022" },
    { y: 30, label: "2023" },
    { y: 32, label: "2024" }
];



window.onload = function() {

    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light1", // "light1", "light2", "dark1", "dark2"
        title: {
            text: "Placement Statistics"
        },
        axisY: {
            title: "Number of Placements"
        },
        data: [{
            type: "column",
            // showInLegend: true,
            // legendMarkerColor: "grey",
            // legendText: "add this text if you want in future",
            dataPoints: placementData
        }]
    });
    chart.render();
    var chart1 = new CanvasJS.Chart("chartContainer1", {
        animationEnabled: true,
        theme: "light1", // "light1", "light2", "dark1", "dark2"
        title: {
            text: "Average Package Statistics"
        },
        axisY: {
            title: "Average Package (in Lakhs/Annum)"
        },
        data: [{
            type: "column",
            // showInLegend: true,
            // legendMarkerColor: "grey",
            // legendText: "add this text if you want in future",
            dataPoints: averagePackageData
        }]
    });
    chart1.render();
    // Pie Chart
    var chart2 = new CanvasJS.Chart("chartContainer2", {
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: "Placement Status (Year 2022)"
        },
        legend: {
            cursor: "pointer",
            itemclick: explodePie
        },
        data: [{
            type: "pie",
            showInLegend: true,
            toolTipContent: "{name}: <strong>{y}%</strong>",
            indexLabel: "{name} - {y}%",
            dataPoints: [
                { y: 80, name: "Placement", exploded: true },
                { y: 10, name: "Higher Studies" },
                { y: 10, name: "Startup" }
            ]
        }]
    });
    chart2.render();
}

function explodePie(e) {
    if (typeof(e.dataSeries.dataPoints[e.dataPointIndex].exploded) === "undefined" || !e.dataSeries.dataPoints[e.dataPointIndex].exploded) {
        e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
    } else {
        e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
    }
    e.chart.render();

}