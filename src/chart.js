import { Chart } from "frappe-charts/dist/frappe-charts.min.esm"



export function buildChartPartyVotes(data) {
    console.log(data);
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
            name: "partyVotes",
            values: values,
        }]
    }

    new Chart("#chart-content", {
        data: chartData,
        title: "Party votes, Finland, 2021",
        //height: 300,
        type: "bar",
        colors: ["#eb5146"],

    })
}