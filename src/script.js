/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const colors = [
  '#22008b',
  '#032b8b',
  '#006696',
  '#22afce',
  '#9ddcec',
  'white',
  '#ffe6d7',
  '#ffaf80',
  '#ff7c2a',
  '#cc4e01',
  '#b6003b',
];

const w = 1500;
const h = 800;
const padding = 60;

const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

// defining the svg chart here
const svg = d3.select('body').append('svg').attr('width', w).attr('height', h);

svg
  .append('text')
  .attr('id', 'title')
  .attr('x', 460)
  .attr('y', 70)
  .text('Monthly Global Land-Surface Temperature')
  .style('fill', 'white');

svg
  .append('text')
  .attr('id', 'description')
  .attr('x', 600)
  .attr('y', 123)
  .text('1753 - 2015: base temperature 8.66℃')
  .style('fill', 'white');

svg
  .append('text')
  .attr('x', -400)
  .attr('y', 38)
  .attr('transform', 'rotate(-90)')
  .style('fill', '#dde1e5')
  .text('Months');

d3.json(
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
).then((data) => {
  const monthlyData = data.monthlyVariance;

  // adding month name to each object
  const getMonthName = (el) => months[el - 1];
  monthlyData.map((d) => (d.monthName = getMonthName(d.month)));

  monthlyData.map(
    (d) => (d.temperature = (data.baseTemperature + d.variance).toFixed(1))
  );

  const variance = monthlyData.map((d) => d.variance);

  let yearData = monthlyData.map((d) => d.year);

  // removing duplicate years here
  yearData = yearData.filter((d, i) => yearData.indexOf(d) === i);

  const varianceMin = d3.min(variance, (d) => d);
  const varianceMax = d3.max(variance, (d) => d);

  // defining the quantile color scale here
  const colorScale = d3
    .scaleQuantile()
    .domain([
      data.baseTemperature + varianceMin,
      data.baseTemperature + varianceMax,
    ])
    .range(colors);

  const minYear = monthlyData[0].year;
  const maxYear = monthlyData[monthlyData.length - 1].year;

  // defining the x and y scales here
  const xScale = d3
    .scaleTime()
    .range([130, w - 130])
    .domain([new Date(minYear, 0), new Date(maxYear, 0)]);

  const yScale = d3
    .scaleBand()
    .range([170, h - 170])
    .domain(months);

  // defining the x and y axes here
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y')).ticks(20);

  svg
    .append('g')
    .call(xAxis)
    .attr('transform', 'translate(0, 630)')
    .attr('id', 'x-axis');

  const yAxis = d3.axisLeft(yScale);

  svg
    .append('g')
    .call(yAxis)
    .attr('transform', 'translate(130,0)')
    .attr('id', 'y-axis');

  // adding the tempurature cells here
  svg
    .selectAll('.cell')
    .data(monthlyData)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', (d) => xScale(new Date(d.year, 0)))
    .attr('y', (d) => yScale(d.monthName))
    .attr('width', w / yearData.length)
    .attr('height', 470 / months.length)
    .attr('transform', 'translate(0, 0)')
    .attr('fill', function (d) {
      return colorScale(d.temperature);
    })
    .attr('data-month', (d) => d.month - 1)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => d.temperature)
    .on('mouseover', (d, i) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(
          `${d.year} - ${d.monthName}<br> ${
            d.temperature
          }℃ <br>${d.variance.toFixed(1)}℃`
        )
        .attr('data-year', d.year)
        .style('left', `${xScale(new Date(d.year, 0)) + 12}px`)
        .style('top', `${yScale(d.monthName)}px`);
    })
    .on('mouseout', () => {
      tooltip.transition().duration(200).style('opacity', 0);
    });

  // defining the legend here
  const minTemp = data.baseTemperature + varianceMin;
  const maxTemp = data.baseTemperature + varianceMax;

  svg.append('g').attr('id', 'legend');

  const threshold = d3
    .scaleThreshold()
    .domain(
      (function (min, max, count) {
        const arr = [];
        const step = (max - min) / count;
        const base = min;
        for (let i = 1; i < count; i++) {
          arr.push(base + i * step);
        }
        return arr;
      })(minTemp, maxTemp, colors.length)
    )
    .range(colors);

  const xLegendScale = d3
    .scaleLinear()
    .domain([minTemp, maxTemp])
    .range([0, 500]);

  const xLegendAxis = d3
    .axisBottom(xLegendScale)
    .tickSize(30)
    .tickValues(threshold.domain())
    .tickFormat(d3.format('.1f'));
  const legend = d3
    .select('#legend')
    .call(xLegendAxis)
    .attr('transform', 'translate(500, 700)');

  legend.select('.domain').remove();

  legend
    .selectAll('rect')
    .data(
      threshold.range().map((color) => {
        const d = threshold.invertExtent(color);
        const [zero, one] = xLegendScale.domain();
        if (d[0] == null) d[0] = zero;
        if (d[1] == null) d[1] = one;
        return d;
      })
    )
    .enter()
    .insert('rect', '.tick')
    .attr('height', 20)
    .attr('x', function (d) {
      return xLegendScale(d[0]);
    })
    .attr('width', function (d) {
      return xLegendScale(d[1]) - xLegendScale(d[0]);
    })
    .attr('fill', function (d) {
      return threshold(d[0]);
    })
    .attr('transform', 'translate(0, 0)');

  svg
    .append('text')
    .attr('class', 'fa fa-2x')
    .attr('x', 446)
    .attr('y', 722)
    .style('fill', '#dde1e5')
    .style('background', 'blue')
    .text('\uf76b');
});
