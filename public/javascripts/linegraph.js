    var config = {
        type: 'line',
        data: {
            labels: ["Survey 1", "Survey 2", "Survey 3"],
            datasets: [{
                label: "Pain Level",
                data: [
                    5, 10, 8
                ],
                backgroundColor: window.chartColors.yellow,
                borderColor: window.chartColors.yellow,
                fill: false,
                pointHoverRadius: 10,
            }]
          },
            options: {
                responsive: true,
                legend: {
                    position: 'bottom',
                },
                hover: {
                    mode: 'index'
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Survey No.'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Pain Level'
                        }
                    }]
                },
                title: {
                    display: false,
                    text: 'Chart.js Line Chart - Different point sizes'
                }
            }
        };
        window.onload = function() {
            var ctx = document.getElementById("canvas").getContext("2d");
            window.myLine = new Chart(ctx, config);
        };
