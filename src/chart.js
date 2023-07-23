import { Chart } from "chart.js/auto";
import { partyColorMapping } from "./map";

let chartPartiesPower = null;

export function buildChartPartiesPower(data) {
    const labels = data.years;
    const dataSetList = Object.entries(data.partyVotes).map((entry) => {
        const [partyName, votes] = entry;
        return {
            label: partyName,
            data: votes,
            backgroundColor: partyColorMapping[partyName] + "a0",
        }
    })

    const chartData = {
        labels: labels,
        datasets: dataSetList,
    }

    const ctx = document.getElementById("chart2-ctx");

    if (chartPartiesPower) {
        chartPartiesPower.destroy();
    }
    
    chartPartiesPower = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                },
                title: {
                    text: "Pary votes over the years, " + data.municipality.municipalityName,
                    display: true,
                },
            },
            scales: {
                x: {
                    stacked: true,
                },
                
                y: {
                    stacked: true,
                }
            }
        }
    })
} 

export function buildChartPartyVotes(data) {
    const backgroundColors = [];
    const partyVotes = data["Mainland"].partyVotes;
    const labels = partyVotes.map((element) => {
        backgroundColors.push(partyColorMapping[element.partyName] + "a0");
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
            backgroundColor: backgroundColors,
        }]
    }

    const ctx = document.getElementById("chart-ctx");

    new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    text: "Pary votes, Finland, 2021",
                    display: true,
                },
            },
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
