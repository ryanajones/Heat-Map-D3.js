/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const months = [
  'January',
  'February',
  'March',
  'april',
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
  '#5e4fa2',
  '#3288bd',
  '#66c2a5',
  '#abdda4',
  '#e6f598',
  '#ffffbf',
  '#fee08b',
  '#fdae61',
  '#f46d43',
  '#d53e4f',
  '#9e0142',
];

const getMonthName = (data) => months[data - 1];
const w = 1400;
const h = 700;
const padding = 60;

const svg = d3
  .select('body')
  .append('svg')
  .attr('class', 'svg')
  .attr('width', w)
  .attr('height', h);

svg
  .append('text')
  .attr('id', 'title')
  .attr('x', 150)
  .attr('y', 27)
  .text('Heat map')
  .style('fill', 'white');

svg
  .append('text')
  .attr('id', 'description')
  .attr('x', 150)
  .attr('y', 50)
  .text('description')
  .style('fill', 'white');
// defining the x scale here
const xScale = d3.scaleTime().range([130, w - padding]);

// defining the y scale here
const yScale = d3.scaleBand().range([170, h - padding]);

d3.json(
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
).then((data) => {
  // extracting the monthlyData from json call
  const monthlyData = data.monthlyVariance;
  monthlyData.forEach((d) => (d.month = getMonthName(d.month)));

  // extracting variance from each object
  const variance = monthlyData.map((d) => d.variance);

  // extracting years from each object
  let years = monthlyData.map((d) => d.year);

  // removing duplicate years
  years = years.filter((d, i) => years.indexOf(d) === i);

  // extracting min and max variances for color quantile scale
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

  // defining the x axis here
  xScale.domain([
    d3.min(monthlyData, (d) => new Date(d.year - 1)),
    d3.max(monthlyData, (d) => new Date(d.year + 1)),
  ]);

  const xAxis = d3.axisBottom(xScale).ticks(20).tickFormat(d3.format('R'));

  svg
    .append('g')
    .call(xAxis)
    .attr('transform', 'translate(0, 640)')
    .attr('id', 'x-axis');

  // defining the y axis here
  yScale.domain(months);

  const yAxis = d3.axisLeft(yScale);

  svg
    .append('g')
    .call(yAxis)
    .attr('transform', 'translate(130,0)')
    .attr('id', 'y-axis');
  console.log(h / months.length);
  // adding the tempurature rectangles here
  svg
    .selectAll('.cell')
    .data(monthlyData)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', (d) => xScale(new Date(d.year, 0)))
    .attr('y', (d) => yScale(d.monthName))
    .attr('width', w / years.length)
    .attr('height', h / months.length)
    .attr('fill', function (d) {
      return colorScale(d.variance + data.baseTemperature);
    });
});
