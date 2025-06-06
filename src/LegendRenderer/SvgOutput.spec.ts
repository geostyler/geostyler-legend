/* eslint-env jest */

import SvgOutput from './SvgOutput';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  makeSampleOutput,
  SAMPLE_SVG,
  SAMPLE_SVG_COLUMN_CONSTRAINTS,
  SAMPLE_OUTPUT_FINAL_HEIGHT
} from '../fixtures/outputs';

// mock getBoundingClientRect on created DOM elements
// (by default jsdom always return 0 so there's no way to test label shortening)
(document as any).originalCreateElementNS = document.createElementNS;
document.createElementNS = function(namespace: string, eltName: string) {
  const el = (document as any).originalCreateElementNS(namespace, eltName);
  el.getBoundingClientRect = function(): DOMRect {
    const charCount = this.textContent.length;
    return {
      height: 10,
      width: charCount * 6,
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      toJSON: () => ''
    };
  };
  return el;
};

describe('SvgOutput', () => {
  let output: SvgOutput;

  it('is defined', () => {
    expect(SvgOutput).not.toBeUndefined();
  });

  describe('individual actions', () => {
    beforeEach(() => {
      output = new SvgOutput([500, 700], undefined, undefined);
    });

    describe('#useContainer', () => {
      it('inserts elements in a container', () => {
        output.useContainer('My Container');
        output.addImage('bla', 100, 50, 200, 250, false);
        expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).innerHTML).toContain(
          '<g class="legend-item" title="My Container"><image'
        );
      });
    });
    describe('#useRoot', () => {
      it('closes container and inserts elements at the root', () => {
        output.useContainer('My Container');
        output.useRoot();
        output.addImage('bla', 100, 50, 200, 250, false);
        expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).innerHTML).toContain(
          '<g class="legend-item" title="My Container"></g><image'
        );
      });
    });
    describe('#addTitle', () => {
      it('inserts a title', () => {
        output.addTitle('My Title', 100, 150);
        expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).innerHTML).toEqual(
          '<g><text class="legend-title" text-anchor="start" dx="100" dy="150">My Title</text></g>'
        );
      });
    });
    describe('#addLabel', () => {
      it('inserts a label', () => {
        output.addLabel('My Label', 100, 150);
        expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).innerHTML).toEqual(
          '<text x="100" y="150">My Label</text>'
        );
      });
    });
    describe('#addImage', () => {
      it('inserts an image (no frame)', () => {
        output.addImage('bla', 100, 50, 200, 250, false);
        expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).innerHTML).toEqual(
          '<image x="200" y="250" width="100" height="50" href="bla"></image>'
        );
      });
      it('inserts an image (with frame)', () => {
        output.addImage('bla', 100, 50, 200, 250, true);
        expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).innerHTML).toEqual(
          '<rect x="200" y="250" width="100" height="50" style="fill-opacity: 0; stroke: black;"></rect>' +
          '<image x="200" y="250" width="100" height="50" href="bla"></image>'
        );
      });
    });
  });

  describe('without column constraints', () => {
    beforeEach(async () => {
      output = new SvgOutput([500, 700], undefined, undefined);
      await makeSampleOutput(output);
    });
    it('generates the right output', () => {
      expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).outerHTML).toEqual(SAMPLE_SVG);
    });
  });

  describe('with column constraints', () => {
    beforeEach(async () => {
      output = new SvgOutput([500, 700], 50, 200);
      await makeSampleOutput(output);
    });
    it('generates the right output', () => {
      expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).outerHTML).toEqual(SAMPLE_SVG_COLUMN_CONSTRAINTS);
    });
  });

  describe('with a height too low', () => {
    beforeEach(async () => {
      output = new SvgOutput([500, 200], 50, 200);
      await makeSampleOutput(output);
    });
    it('sets the height on the final canvas', () => {
      expect(output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT).outerHTML).toEqual(SAMPLE_SVG_COLUMN_CONSTRAINTS
        .replace('viewBox="0 0 500 700" top="0" left="0" width="500" height="700"',
          'viewBox="0 0 500 200" top="0" left="0" width="500" height="200"'));
    });
  });

  describe('when a target is given', () => {
    let root: HTMLDivElement;
    beforeEach(() => {
      root = document.createElement('div');
      output = new SvgOutput([500, 700], 250, 500, root);
    });
    it('appends the output to the target element', () => {
      output.generate(123);
      expect(root.children.item(0)?.outerHTML).toEqual(
        '<svg class="geostyler-legend-renderer" viewBox="0 0 500 700" top="0" left="0" width="500" height="700"></svg>'
      );
    });
  });
});
