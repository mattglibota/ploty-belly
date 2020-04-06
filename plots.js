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
    
    
    var layout = {
        title: "Bacteria Count Frequency",
        xaxis: { title: "OTU ID" },
        yaxis: { title: "Bacteria Count"},
        height: 550,
        width: 1250
        };
        
    Plotly.newPlot('bubble', [bubbleDataset], layout);

    //create GAUGE chart (PASTED AS A TEST TO HAVE WORKING CODE, NOT MINE)
    var level = data.metadata.filter(sampleObj => sampleObj.id == sample)[0].wfreq;

    // Trig to calc meter point
    var degrees = 180 - ((level/9)*180),
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    var path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';
    // Path: may have to change to create a better triangle
    var mainPath = path1,
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var dataGauge2 = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 14, color:'850000'},
        showlegend: false,
        name: 'wash frequency',
        text: level,
        hoverinfo: 'text+name'},
      { values: [1,1,1,1,1,1,1,1,1,9],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6','4-5','3-4','2-3','1-2','0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {
        colors:[
          'rgba(28, 106, 11, 1)',
          'rgba(51, 122, 33, 1)',
          'rgba(75, 138, 56, 1)',
          'rgba(99, 155, 78, 1)',
          'rgba(123, 171, 101, 1)',
          'rgba(146, 187, 124, 1)',
          'rgba(170, 204, 146, 1)',
          'rgba(194, 220, 169, 1)',
          'rgba(218, 237, 192, 1)',
          'rgba(0, 0, 0, 0)']
      },
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layoutGauge2 = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      height: 500,
      width: 500,
      title: { text: "Belly Button Washing Frequency <br> Scrubs per Week" },
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', dataGauge2, layoutGauge2);

    });

}