import AbstractOutput from '../LegendRenderer/AbstractOutput';
import { expect } from 'vitest';

// a single pixel
// eslint-disable-next-line max-len
export const SAMPLE_IMAGE_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjyHNz+g8ABBIB9kHiDqIAAAAASUVORK5CYII=';

export async function makeSampleOutput(output: AbstractOutput) {
  output.useContainer('My Container');
  output.addTitle('Inside a container', 180, 180);
  output.addLabel('An image in a container', 200, 220, undefined);
  await output.addImage(SAMPLE_IMAGE_SRC, 100, 50, 200, 250, false);
  output.useRoot();
  output.addTitle('Outside a container', 180, 480);
  output.addLabel('An image', 200, 520, undefined);
  await output.addImage(SAMPLE_IMAGE_SRC, 100, 50, 200, 550, true);
}

export const SAMPLE_OUTPUT_FINAL_HEIGHT = 600;

export const SAMPLE_SVG = '<svg class="geostyler-legend-renderer" viewBox="0 0 500 600" top="0" left="0" width="500" height="600" xmlns="http://www.w3.org/2000/svg"><g class="legend-item" title="My Container"><g><text class="legend-title" text-anchor="start" dx="180" dy="180">...</text><title>Inside a container</title></g><text x="200" y="220">An image in a container</text><image x="200" y="250" width="100" height="50" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjyHNz+g8ABBIB9kHiDqIAAAAASUVORK5CYII="></image></g><g><text class="legend-title" text-anchor="start" dx="180" dy="480">Outside a container</text></g><text x="200" y="520">An image</text><rect x="200" y="550" width="100" height="50" style="fill-opacity: 0; stroke: black;"></rect><image x="200" y="550" width="100" height="50" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjyHNz+g8ABBIB9kHiDqIAAAAASUVORK5CYII="></image></svg>';

// max column width: 50, max column height: 200
export const SAMPLE_SVG_COLUMN_CONSTRAINTS =
  '<svg class="geostyler-legend-renderer" viewBox="0 0 500 700" top="0" left="0" width="500" height="700" ' +
  'xmlns="http://www.w3.org/2000/svg">' +
  '<g class="legend-item" title="My Container">' +
  '<g>' +
  '<text class="legend-title" text-anchor="start" dx="180" dy="180">Inside ...</text>' +
  '<title>Inside a container</title>' +
  '</g>' +
  '<text x="200" y="220">An image in a container</text>' +
  '<image x="200" y="250" width="100" height="50" href="' + SAMPLE_IMAGE_SRC + '"></image>' +
  '</g>' +
  '<g>' +
  '<text class="legend-title" text-anchor="start" dx="180" dy="480">Outside a container</text>' +
  '</g>' +
  '<text x="200" y="520">An image</text>' +
  '<rect x="200" y="550" width="100" height="50" style="fill-opacity: 0; stroke: black;"></rect>' +
  '<image x="200" y="550" width="100" height="50" href="' + SAMPLE_IMAGE_SRC + '"></image>' +
  '</svg>';

// as reported by jest-canvas-mock
export const SAMPLE_PNG_EVENTS = [
  {
    'props': {
      'value': '14px sans-serif'
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'font'
  },
  {
    'props': {
      'maxWidth': null as number,
      'text': 'Inside a container',
      'x': 180,
      'y': 180
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'fillText'
  },
  {
    'props': {
      'maxWidth': null,
      'text': 'An image in a container',
      'x': 200,
      'y': 220
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'fillText'
  },
  {
    'props': {
      'dHeight': 1,
      'dWidth': 1,
      'dx': 200,
      'dy': 250,
      'img': expect.any(Image),
      'sHeight': 1,
      'sWidth': 1,
      'sx': 0,
      'sy': 0
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'drawImage'
  },
  {
    'props': {
      'maxWidth': null,
      'text': 'Outside a container',
      'x': 180,
      'y': 480
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'fillText'
  },
  {
    'props': {
      'maxWidth': null,
      'text': 'An image',
      'x': 200,
      'y': 520
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'fillText'
  },
  {
    'props': {
      'dHeight': 1,
      'dWidth': 1,
      'dx': 200,
      'dy': 550,
      'img': expect.any(Image),
      'sHeight': 1,
      'sWidth': 1,
      'sx': 0,
      'sy': 0
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'drawImage'
  },
  {
    'props': {
      'height': 50,
      'width': 100,
      'x': 200,
      'y': 550
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'strokeRect'
  }
];

// events when starting with a height of 200
export const SAMPLE_PNG_EVENTS_HEIGHT_TOO_LOW = [
  {
    'props': {
      'value': '14px sans-serif'
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'font'
  },
  {
    'props': {
      'dHeight': 300,
      'dWidth': 500,
      'dx': 0,
      'dy': 0,
      'img': expect.any(HTMLCanvasElement),
      'sHeight': 300,
      'sWidth': 500,
      'sx': 0,
      'sy': 0
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'drawImage'
  },
  {
    'props': {
      'dHeight': 1,
      'dWidth': 1,
      'dx': 200,
      'dy': 550,
      'img': expect.any(Image),
      'sHeight': 1,
      'sWidth': 1,
      'sx': 0,
      'sy': 0
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'drawImage'
  },
  {
    'props': {
      'height': 50,
      'width': 100,
      'x': 200,
      'y': 550
    },
    'transform': [
      1,
      0,
      0,
      1,
      0,
      0
    ],
    'type': 'strokeRect'
  }
];
