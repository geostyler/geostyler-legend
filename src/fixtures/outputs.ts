import AbstractOutput from '../LegendRenderer/AbstractOutput';

export function makeSampleOutput(output: AbstractOutput) {
  output.useContainer('My Container');
  output.addTitle('Inside a container', 180, 180);
  output.addLabel('An image in a container', 200, 220);
  output.addImage('https://my-domain/image.png', 100, 50, 200, 250, false);
  output.useRoot();
  output.addTitle('Outside a container', 180, 480);
  output.addLabel('An image', 200, 520);
  output.addImage('https://my-domain/image2.png', 100, 50, 200, 550, true);
}

export const SAMPLE_OUTPUT_FINAL_HEIGHT = 600;

export const SAMPLE_SVG =
  '<svg class="geostyler-legend-renderer" viewBox="0 0 500 600" top="0" left="0" width="500" height="600" ' +
  'xmlns="http://www.w3.org/2000/svg">' +
  '<g class="legend-item" title="My Container">' +
  '<g>' +
  '<text class="legend-title" text-anchor="start" dx="180" dy="180">Inside a container</text>' +
  '</g>' +
  '<text x="200" y="220">An image in a container</text>' +
  '<image x="200" y="250" width="100" height="50" href="https://my-domain/image.png"></image>' +
  '</g>' +
  '<g>' +
  '<text class="legend-title" text-anchor="start" dx="180" dy="480">Outside a container</text>' +
  '</g>' +
  '<text x="200" y="520">An image</text>' +
  '<rect x="200" y="550" width="100" height="50" style="fill-opacity: 0; stroke: black;"></rect>' +
  '<image x="200" y="550" width="100" height="50" href="https://my-domain/image2.png"></image>' +
  '</svg>';

// max column width: 50, max column height: 200
export const SAMPLE_SVG_COLUMN_CONSTRAINTS =
  '<svg class="geostyler-legend-renderer" viewBox="0 0 500 700" top="0" left="0" width="500" height="700" ' +
  'xmlns="http://www.w3.org/2000/svg">' +
  '<g class="legend-item" title="My Container">' +
  '<g>' +
  '<text class="legend-title" text-anchor="start" dx="180" dy="180">Insid...</text>' +
  '</g>' +
  '<text x="200" y="220">An image in a container</text>' +
  '<image x="200" y="250" width="100" height="50" href="https://my-domain/image.png"></image>' +
  '</g>' +
  '<g>' +
  '<text class="legend-title" text-anchor="start" dx="180" dy="480">Outside a container</text>' +
  '</g>' +
  '<text x="200" y="520">An image</text>' +
  '<rect x="200" y="550" width="100" height="50" style="fill-opacity: 0; stroke: black;"></rect>' +
  '<image x="200" y="550" width="100" height="50" href="https://my-domain/image2.png"></image>' +
  '</svg>';
