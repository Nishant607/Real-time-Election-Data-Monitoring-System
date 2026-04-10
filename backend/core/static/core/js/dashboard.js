document.addEventListener("DOMContentLoaded", function () {

    const ctx = document.getElementById("voteChart");

    if (!ctx) return;

    const voteChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: chartLabels,
            datasets: [{
                label: "Votes",
                data: chartData,
                backgroundColor: [
                    "#3498db",
                    "#2ecc71",
                    "#e74c3c",
                    "#f1c40f",
                    "#9b59b6"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: "white" }
                }
            },
            scales: {
                y: {
                    ticks: { color: "white" }
                },
                x: {
                    ticks: { color: "white" }
                }
            }
        }
    });


    async function updateChart() {

        const response = await fetch("/api/votes/");
        const data = await response.json();

        voteChart.data.labels = data.labels;
        voteChart.data.datasets[0].data = data.votes;

        voteChart.update();
    }

    setInterval(updateChart, 5000);

});