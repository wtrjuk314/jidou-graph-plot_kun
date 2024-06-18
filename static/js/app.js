document.getElementById('formulaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const getValue = (id) => document.getElementById(id) ? document.getElementById(id).value : null;
    const getChecked = (id) => document.getElementById(id) ? document.getElementById(id).checked : false;

    const formula = getValue('formula');
    const chartType = getValue('chartType');
    const color = getValue('color');
    const lineWidth = getValue('lineWidth');
    const xMin = getValue('xMin') !== null ? parseFloat(getValue('xMin')) : undefined;
    const xMax = getValue('xMax') !== null ? parseFloat(getValue('xMax')) : undefined;
    const yMin = getValue('yMin') !== null ? parseFloat(getValue('yMin')) : undefined;
    const yMax = getValue('yMax') !== null ? parseFloat(getValue('yMax')) : undefined;
    const xStepSize = getValue('xStepSize') !== null ? parseFloat(getValue('xStepSize')) : undefined;
    const yStepSize = getValue('yStepSize') !== null ? parseFloat(getValue('yStepSize')) : undefined;
    const plotInterval = getValue('plotInterval') !== null ? parseFloat(getValue('plotInterval')) : 0.01; // Default to 0.01 if not specified
    const showPoints = getChecked('showPoints'); // Get whether to show points
    const showLabels = getChecked('showLabels'); // Get whether to show labels
    const xLabel = getValue('xLabel') || 'x'; // Get x-axis label, default to 'x'
    const yLabel = getValue('yLabel') || 'y'; // Get y-axis label, default to 'y'
    const showTitle = getChecked('showTitle'); // Get whether to show title
    const chartTitle = getValue('chartTitle') || 'Fig.0　xとyの関係'; // Get chart title, default to 'Fig.0 xとyの関係'
    const titlePosition = getValue('titlePosition') || 'top'; // Get title position
    const dataFile = document.getElementById('dataFile').files[0];

    if (dataFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const fileContent = event.target.result;
            const lines = fileContent.split('\n');
            const xData = [];
            const yData = [];
            lines.forEach(line => {
                const [x, y] = line.split(',').map(parseFloat);
                if (!isNaN(x) && !isNaN(y)) {
                    xData.push(x);
                    yData.push(y);
                }
            });

            plotGraph(xData, yData, chartType, color, lineWidth, xMin, xMax, yMin, yMax, xStepSize, yStepSize, showPoints, showLabels, xLabel, yLabel, showTitle, chartTitle, titlePosition);
        };
        reader.readAsText(dataFile);
    } else if (formula) {
        fetch('/plot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                formula: formula,
                chartType: chartType,
                color: color,
                lineWidth: lineWidth,
                xMin: xMin,
                xMax: xMax,
                yMin: yMin,
                yMax: yMax,
                plotInterval: plotInterval // Send the plot interval to the server
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            plotGraph(data.x, data.y, chartType, color, lineWidth, xMin, xMax, yMin, yMax, xStepSize, yStepSize, showPoints, showLabels, xLabel, yLabel, showTitle, chartTitle, titlePosition);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
    } else {
        alert('数式を入力するか、データファイルをアップロードしてください。');
    }
});

document.getElementById('clearFileButton').addEventListener('click', function() {
    document.getElementById('dataFile').value = '';
});

function plotGraph(xData, yData, chartType, color, lineWidth, xMin, xMax, yMin, yMax, xStepSize, yStepSize, showPoints, showLabels, xLabel, yLabel, showTitle, chartTitle, titlePosition) {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: xData,
            datasets: [{
                data: yData,
                borderColor: color,
                borderWidth: lineWidth,
                backgroundColor: 'rgba(255, 255, 255, 1)',
                pointRadius: showPoints ? 3 : 0, // Set point radius based on showPoints
                showLine: chartType === 'line' // Show line only for line charts
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false // Hide the legend
                },
                title: {
                    display: showTitle,
                    text: chartTitle,
                    position: titlePosition
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: isNaN(xMin) ? undefined : xMin,
                    max: isNaN(xMax) ? undefined : xMax,
                    ticks: {
                        stepSize: isNaN(xStepSize) ? undefined : xStepSize,
                        callback: function(value) {
                            return value.toFixed(2); // Round to 2 decimal places
                        }
                    },
                    title: {
                        display: showLabels,
                        text: xLabel
                    }
                },
                y: {
                    beginAtZero: false,
                    min: isNaN(yMin) ? undefined : yMin,
                    max: isNaN(yMax) ? undefined : yMax,
                    ticks: {
                        stepSize: isNaN(yStepSize) ? undefined : yStepSize
                    },
                    title: {
                        display: showLabels,
                        text: yLabel
                    }
                }
            }
        }
    });
}

document.getElementById('downloadButton').addEventListener('click', function() {
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');

    // Save the current state
    ctx.save();

    // Set the background color
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Download the image
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'graph.png';
    link.click();

    // Restore the original state
    ctx.restore();
});
