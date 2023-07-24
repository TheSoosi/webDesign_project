let electionVariables = null;

const electionJsonQuery = {
  "query": [
    {
      "code": "Vuosi",
      "selection": {
        "filter": "item",
        "values": []
      }
    },
    {
      "code": "Alue",
      "selection": {
        "filter": "item",
        "values": []
      }
    },
    {
      "code": "Puolue",
      "selection": {
        "filter": "item",
        "values": [
          "03",
          "01",
          "04",
          "02",
          "05",
          "06",
          "07",
          "08"
        ]
      }
    },
    {
      "code": "Tiedot",
      "selection": {
        "filter": "item",
        "values": [
          "aanet_yht"
        ]
      }
    }
  ],
  "response": {
    "format": "json-stat2"
  }
};

export async function initData() {
  electionVariables = await loadElectionVariables()

  const municipalityList = electionVariables.municipalityCodes.map((element, index) => {
    return {
      code: element,
      name: electionVariables.municipalityNames[index]
    };
  })
  return municipalityList;
}

async function loadElectionVariables() {
  const url = "https://statfin.stat.fi:443/PxWeb/api/v1/en/StatFin/kvaa/statfin_kvaa_pxt_12g3.px";
  const res = await fetch(url);
  const data = await res.json();
  const result = {
    years: data.variables[0].values,
    municipalityCodes: data.variables[1].values,
    municipalityNames: data.variables[1].valueTexts,
  } 
  return result;
}

export async function loadElectionDataByRegion(municipality) {
  const url = "https://statfin.stat.fi:443/PxWeb/api/v1/en/StatFin/kvaa/statfin_kvaa_pxt_12g3.px";
  const jsonQuery = {...electionJsonQuery};
  jsonQuery.query[0].selection.values = electionVariables.years;
  jsonQuery.query[1].selection.values = [municipality.municipalityCode];
  
  const res = await fetch(url, {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(jsonQuery)
  })
  
  if(!res.ok) {
      return;
  }

  const data = await res.json();
  const parties = Object.keys(data.dimension.Puolue.category.index).map((element) => {
    
    return data.dimension.Puolue.category.label[element];
  });
  
  const partyVotesByYear = {
    municipality: municipality,
    years: [],
    partyVotes: {}
  }

  Object.values(data.dimension.Vuosi.category.label).forEach((year, i) => {
    partyVotesByYear.years.push(year);
    parties.forEach((party, j) => {
        const index = i * parties.length + j;
        const votes = data.value[index];
        if (!partyVotesByYear.partyVotes[party]){
          partyVotesByYear.partyVotes[party] = []
        }

        partyVotesByYear.partyVotes[party].push(votes)
    })
  });
  return partyVotesByYear;
}

export async function loadElectionData() {
    const url = "https://statfin.stat.fi:443/PxWeb/api/v1/en/StatFin/kvaa/statfin_kvaa_pxt_12g3.px";
    const jsonQuery = {...electionJsonQuery};
    jsonQuery.query[0].selection.values = ["2021"];
    jsonQuery.query[1].selection.values = electionVariables.municipalityCodes;
    
    const res = await fetch(url, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(jsonQuery)
    })
    
    if(!res.ok) {
        return;
    }

    const data = await res.json();

    const result = {};
    
    const parties = Object.keys(data.dimension.Puolue.category.index).map((element) => {
        return data.dimension.Puolue.category.label[element];
    });

    Object.entries(data.dimension.Alue.category.index).forEach((entry) => {
        const municipalityKey = entry[0];
        const i = entry[1];
        const element = data.dimension.Alue.category.label[municipalityKey];
        const elementParts = element.split(" ");
        const municipalityCode = elementParts[0];

        let mostVoted = null;

        const partyVotes = []

        parties.forEach((party, j) => {
            const index = i * parties.length + j;
            const votes = data.value[index];
            const currentPartyVotes = {
                partyName: party,
                votes: votes,
            };

            partyVotes.push(currentPartyVotes);

            if (mostVoted === null) {
                mostVoted = currentPartyVotes;

            } else if (mostVoted.votes < votes) {
                mostVoted = currentPartyVotes;
            }
        })

        const municipality = {
            name: element,
            partyVotes: partyVotes,
            mostVotedParty: mostVoted,
            municipalityKey: municipalityKey,
        }


        result[municipalityCode] = municipality;
         
    });
 
    return result;
}