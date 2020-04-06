function init() {
    var selector = d3.select("#selDataset");
  
    d3.json("samples.json").then((data) => {
      console.log(data);
      var sampleNames = data.names;
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });

      //challenge: initialize data for first sample
      buildMetadata(selector.property("value"));
      buildCharts(selector.property("value"));
  })}
  
init();

function optionChanged(newSample) {
    buildMetadata(newSample);
    buildCharts(newSample);
}

function buildMetadata(sample) {
    d3.json("samples.json").then((data) => {
        var metadata = data.metadata;
        var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
        var result = resultArray[0];
        var PANEL = d3.select("#sample-metadata");

        PANEL.html("");
        Object.entries(result).forEach(key =>
            PANEL.append("h6").text(key[0].toUpperCase() + ": " + key[1])
        );
    });
}

function buildCharts(sample) {
    d3.json("samples.json").then((data) => {

    //filter sample dataset by the active id
    var samples = data.samples;
    var resultArray = samples.filter(obj => obj.id == sample)[0];

    //transform the resulting object into a list of objects for each bacteria
    var testArray = [];
    var numValues = resultArray.otu_ids.length;
    for (i=0; i<numValues; i++) {
        testArray.push({
            otu_id: resultArray.otu_ids[i],
            sample_value: resultArray.sample_values[i],
            otu_label: resultArray.otu_labels[i]
        })
    }

    //perform sort and slice on the resulting list of objects
    var sortedArray = testArray.sort((a,b) => b.sample_value - a.sample_value);
    var slicedArray = sortedArray.slice(0,10);

    //perform mapping on the list of objects to get arrays for graphing
    var lst_otuid = slicedArray.map(i => ("OTU " +i.otu_id)).reverse();
    var lst_samplevalues = slicedArray.map(i => i.sample_value).reverse();
    var lst_otulabel = slicedArray.map(i => i.otu_label).reverse();

    var barDataset = {
        x: lst_samplevalues,
        y: lst_otuid,
        type: "bar",
        orientation: "h",
        text: lst_otulabel
    };

    var layout = {
        title: "Top 10 Bacteria"
    }
    
    //create the BAR chart
    Plotly.newPlot("bar",[barDataset], layout);

    //perform mapping on the list of objects to get arrays for graphing
    var lst_otuid = testArray.map(i => i.otu_id);
    var lst_samplevalues = testArray.map(i => i.sample_value);
    var lst_otulabel = testArray.map(i => i.otu_label);


    //create the BUBBLE CART
    var bubbleDataset = {
        x: lst_otuid,
        y: lst_samplevalues,
        text: lst_otulabel,
        mode: 'markers',
        marker: {
            color: lst_otuid,
            size: lst_samplevalues,
            colorscale: "Earth"
        }
        };
        
    var data = [bubbleDataset];
    
    var layout = {
        title: "Bacteria Count Frequency",
        xaxis: { title: "OTU ID" },
        yaxis: { title: "Bacteria Count"}
        };
        
    Plotly.newPlot('bubble', data, layout);

    });

}