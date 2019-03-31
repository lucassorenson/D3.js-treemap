const dataUrl = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
const dataSets = {
    videoGames: {
        url: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json',
        title: 'Video Game Sales', 
        description: 'Top 100 Video Games by Sales, Grouped by Platform'
    },

    movies: {
        url: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json',
        title: 'Movie Sales',
        description: 'Top 100 Highest Grossing Movies, Grouped by Genre'
    },
    
    kickstarter: {
        url: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json',
        title: 'KickStarter Pledges',
        description: '100 Most Pledged Kickstarter Campaigns, Grouped by Category'
    }
}

// TODO: fill in the other 2 data sets, 
//make buttons to let user choose dataset

var currentDataSet = 'kickstarter';

function setDataSet(newDataSet) {
    currentDataSet = newDataSet;
    d3.select('svg').remove()
    getData(dataSets[currentDataSet].url)
}

function getData(url) {
    d3.json(url).then(function (response) { handleOnload(response) })
}

function handleOnload(data) {
    var currentData = data;
    var offsetForTitle = 50;
    var offsetForLegend = 50;
    
    function makeTreeMap() {

        function makeTooltip() {
            d3.select('body')
                .append('div')
                .attr('id', 'tooltip')
                .style('opacity', 0)
        }

        function makeRoot() {
            var root = d3.hierarchy(currentData)
            root.sum(function (d) {
                return d.value;
            }).sort(function (a, b) { return b.height - a.height || b.value - a.value; });

            var treemapLayout = d3.treemap();
            treemapLayout
                .size([svgVals.width, (svgVals.height - offsetForTitle - offsetForLegend)])
                .paddingOuter(2)
                .paddingInner(2)
                .tile(d3.treemapBinary)

            treemapLayout(root);
            return root;
        }

        function makeTitleAndDescription() {
            svg // title
                .append('text')
                .attr('id', 'title')
                .attr('x', (svgVals.width / 2))
                .attr('y', 25)
                .text(dataSets[currentDataSet].title)
    
            svg // description
                .append('text')
                .attr('id', 'description')
                .attr('x', (svgVals.width / 2))
                .attr('y', 45)
                .text(dataSets[currentDataSet].description)
        }

        function makeTiles() {
            function setColor(d){
               var categoriesArr = [];
               root.children.forEach(elem => categoriesArr.push(elem.data.name))
               
               return colorsArr[categoriesArr.indexOf(d.data.category)]
            }
            var tiles = svg.selectAll('tile')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('transform', d => 'translate(' + [d.x0, (d.y0 + offsetForTitle)] + ')')

            tiles.append('rect')
                .attr('class', 'tile')
                .attr('data-name', d => d.data.name)
                .attr('data-value', d => d.data.value)
                .attr('data-category', d => d.data.category)
                .attr('width', d => (d.x1 - d.x0))
                .attr('height', d => (d.y1 - d.y0))
                .style('fill', function (d) {
                    return setColor(d)
                })
                .on('mouseover', function(d){
                    d3.select('#tooltip')
                        .style('left', (d.x1 + 20) + 'px')
                        .style('top', (d.y0 + 50) + 'px')
                        .style('background-color', setColor(d))
                        .attr('data-value', d.value)
                        .html(function(){
                            return d.data.name + '<br/>' + d.data.category + '<br/>' + d.value
                        })
                        .transition()
                        .duration(500)
                        .style('opacity', 1)   
                })
                .on('mouseout', function(d){
                    d3.select('#tooltip')
                        .transition()
                        .duration(500)
                        .style('opacity', 0)
                })

            tiles
                .append('text')
                .attr('class', 'tile-text')
                .selectAll('tspan')
                .data(function (d) {
                    return d.data.name.split(/\s|\//)
                })
                .enter()
                .append('tspan')
                .attr('x', 4)
                .attr('y', function (_, i) {
                    return (10 + (15 * i))
                })
                .text(function (d) {
                    let rectHeight = this.parentElement.parentElement.children[0].height.baseVal.value
                    let thisY = this.y.baseVal[0].value + 10
                    if (thisY < rectHeight) {
                        return d
                    }
                })
        }

        function makeLegend() {
            var legendRectWidth = (svgVals.width / colorsArr.length) 

            var legend = svg
                .append('g')
                .attr('id', 'legend')
                .attr('transform', 'translate(0, ' + (svgVals.height - offsetForLegend) + ')')
                
            legend
                .selectAll('.legend-item')
                .data(colorsArr)
                .enter()
                .append('rect')
                .attr('class', 'legend-item')
                .attr('width', legendRectWidth)
                .attr('height', 20)
                .attr('x', (_, i) => (i * legendRectWidth) )
                .style('fill', d => d)
            
            legend
                .selectAll('.legend-text')
                .data(root.children)
                .enter()
                .append('text')
                .attr('class', 'legend-text')
                .attr('x', (_, i) => (i * legendRectWidth))
                .attr('y', 35)
                .selectAll('tspan')
                .data(d => d.data.name.split(' '))
                .enter()
                .append('tspan')
                .attr('dy', (_, i) => i * 15)
                .attr('dx', 0)
                .text(d => d)
        }

        function makeColorsArr() {
            let categoriesCount = root.children.length;
            colorsArr = [];
            for (let i = 0; i < categoriesCount; i++) {
                let h = ((360 / categoriesCount) * i)

                colorsArr.push('hsl(' + h + ', 100%, 75%)')
            }
            return colorsArr
        }

        var root = makeRoot()
        var colorsArr = makeColorsArr()
        makeTooltip()
        makeTitleAndDescription()
        makeTiles()
        makeLegend()
    }

    function makeSvg(width, height) {
        var svgVals = {
            width: width,
            height: height
        };
        var svg = d3.select('body')
            .append('svg')
            .attr('id', 'svg')
            .attr('width', svgVals.width)
            .attr('height', svgVals.height)

        return [svg, svgVals];
    }

    var [svg, svgVals] = makeSvg(window.innerWidth - 30, window.innerHeight - 30);
    makeTreeMap();
}

getData(dataSets[currentDataSet].url)