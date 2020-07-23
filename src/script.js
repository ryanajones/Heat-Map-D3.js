/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

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
// xScale
const xScale = d3.scaleTime().range([80, w - padding]);

// yScale
const yScale = d3.scaleLinear().range([170, h - padding]);

d3.json(
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
).then((data) => {
  // xAxis
  xScale.domain([
    d3.min(data.monthlyVariance, (d) => d.year - 1),
    d3.max(data.monthlyVariance, (d) => d.year + 1),
  ]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('R'));

  svg
    .append('g')
    .call(xAxis)
    .attr('transform', 'translate(0, 640)')
    .attr('id', 'x-axis');

  // yAxis
  yScale.domain([data.monthlyVariane,])
  const yAxis = d3.axisLeft(yScale);
  svg
    .append('g')
    .call(yAxis)
    .attr('transform', 'translate(80,0)')
    .attr('id', 'y-axis');
});
