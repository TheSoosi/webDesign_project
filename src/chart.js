import { Chart } from "chart.js/auto";

export function buildChartPartyVotes(data) {
    const partyVotes = data["Mainland"].partyVotes;
    const labels = partyVotes.map((element) => {
        return element.partyName;
    });

    const values = partyVotes.map((element) => {
        return element.votes;
    });

    const chartData = {
        labels: labels,
        datasets: [{
            label: "Voutes for party",
            data: values,
            backgroundColor: "rgba(0, 0, 255, 0.3)",
            borderColor: "rgba(0, 0, 255, 0.7)",
            borderWidth: 2,
        }]
    }

    const ctx = document.getElementById("chart-ctx");

    new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }                
            }
        }
    })
}
