import { initMap, setElectionData } from "./map";
import { loadElectionData } from "./dataLoader";
import { buildChartPartyVotes } from "./chart";

export class App{
    async run() {
        await initMap();
        const data = await loadElectionData();
        setElectionData(data);
        buildChartPartyVotes(data);
    }
    
}


