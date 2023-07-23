import { initMap, setElectionData } from "./map";
import { loadElectionData, loadElectionDataByRegion, initData } from "./dataLoader";
import { buildChartPartyVotes, buildChartPartiesPower } from "./chart";

export class App{
    async run() {
        await initMap();
        const municipalityList = await initData();
        this.initMunicipalitySelect(municipalityList);
        const data = await loadElectionData();
        setElectionData(data);
        buildChartPartyVotes(data);
        
        const selectedMunicipality = this.getSelectedMunicipality()

        if (selectedMunicipality) {
            const data2 = await loadElectionDataByRegion(selectedMunicipality);
            buildChartPartiesPower(data2);
        }        
    }

    getSelectedMunicipality() {
        const select = document.getElementById("municipality-choice");
        return {
            municipalityCode: select.value,
            municipalityName: select.options[select.selectedIndex].text,
        }
    }

    initMunicipalitySelect(municipalityList) {
        const select = document.getElementById("municipality-choice");
        select.innerHTML = ""
        municipalityList.forEach(element => {
        //    select.innerHTML += `<option value="${element.code}">${element.name}</option>`
            const option = document.createElement("option");
            option.value = element.code;
            option.innerText = element.name;
            select.appendChild(option) 
        });
        select.onchange = async () => {
            const selectedMunicipality = this.getSelectedMunicipality();
            const data = await loadElectionDataByRegion(selectedMunicipality);
            buildChartPartiesPower(data);
        }
    }
}


