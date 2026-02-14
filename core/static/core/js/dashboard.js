document.addEventListener("DOMContentLoaded", function () {

    const ctx = document.getElementById('voteChart');

    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Candidate A', 'Candidate B', 'Candidate C'],
            datasets: [{
                label: 'Votes',
                data: [120, 190, 300],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c'
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
