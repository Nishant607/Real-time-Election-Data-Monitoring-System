document.addEventListener("DOMContentLoaded", function () {

    const ctx = document.getElementById('voteChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Votes',
                data: chartData,
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            },
            scales: {
                y: {
                    ticks: { color: 'white' }
                },
                x: {
                    ticks: { color: 'white' }
                }
            }
        }
    });

});