/* eslint-env jest */

import PngOutput from './PngOutput';
import {
  makeSampleOutput, SAMPLE_IMAGE_SRC,
  SAMPLE_OUTPUT_FINAL_HEIGHT,
  SAMPLE_PNG_EVENTS,
  SAMPLE_PNG_EVENTS_HEIGHT_TOO_LOW
} from '../fixtures/outputs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function getContextEvents(context: CanvasRenderingContext2D) {
  // eslint-disable-next-line no-underscore-dangle
  return (context as any).__getEvents();
}

describe('PngOutput', () => {
  let output: PngOutput;

  it('is defined', () => {
    expect(PngOutput).not.toBeUndefined();
  });

  describe('individual actions', () => {
    beforeEach(() => {
      output = new PngOutput([500, 700], null, null);
      vi.spyOn(output.context, 'drawImage');
      vi.spyOn(output.context, 'fillText');
      vi.spyOn(output.context, 'strokeRect');
    });

    describe('#addTitle', () => {
      it('inserts a title', () => {
        output.addTitle('My Title', 100, 150);
        expect(output.context.fillText).toHaveBeenCalledWith('My Title', 100, 150);
        expect(output.context.fillStyle).toEqual('#000000');
      });
    });
    describe('#addLabel', () => {
      it('inserts a label', () => {
        output.addLabel('My Label', 100, 150);
        expect(output.context.fillText).toHaveBeenCalledWith('My Label', 100, 150);
        expect(output.context.fillStyle).toEqual('#000000');
      });
    });
    describe('#addImage', () => {
      it('inserts an image (no frame)', async () => {
        await output.addImage(SAMPLE_IMAGE_SRC, 100, 50, 200, 250, false);
        const calledImg = (output.context.drawImage as any).mock.calls[0][0];
        expect(output.context.drawImage).toHaveBeenCalledWith(expect.any(Image), 200, 250, 100, 50);
        expect(calledImg.src).toBe(SAMPLE_IMAGE_SRC);
        expect(output.context.strokeRect).not.toHaveBeenCalled();
        expect(output.context.strokeStyle).toEqual('#000000');
      });
      it('inserts an image (with frame)', async() => {
        await output.addImage(SAMPLE_IMAGE_SRC, 100, 50, 200, 250, true);
        const calledImg = (output.context.drawImage as any).mock.calls[0][0];
        expect(output.context.drawImage).toHaveBeenCalledWith(expect.any(Image), 200, 250, 100, 50);
        expect(calledImg.src).toBe(SAMPLE_IMAGE_SRC);
        expect(output.context.strokeRect).toHaveBeenCalledWith(200, 250, 100, 50);
        expect(output.context.strokeStyle).toEqual('#000000');
      });
    });
  });

  describe('without column constraints', () => {
    beforeEach(async () => {
      output = new PngOutput([500, 700], null, null);
      await makeSampleOutput(output);
    });
    it('generates the right output', () => {
      const canvas = output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT);
      expect(getContextEvents(canvas.getContext('2d')!)).toEqual(SAMPLE_PNG_EVENTS);
    });
  });

  describe('with column constraints', () => {
    beforeEach(async () => {
      output = new PngOutput([500, 700], 50, 200);
      await makeSampleOutput(output);
    });
    it('generates the same output as without constraints', () => {
      const canvas = output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT);
      expect(getContextEvents(canvas.getContext('2d')!)).toEqual(SAMPLE_PNG_EVENTS);
    });
  });

  describe('with a height too low',  () => {
    beforeEach(async () => {
      output = new PngOutput([500, 200], 50, 200);
      await makeSampleOutput(output);
    });
    it('resizes the final canvas', () => {
      const canvas = output.generate(SAMPLE_OUTPUT_FINAL_HEIGHT);
      expect(getContextEvents(canvas.getContext('2d')!)).toEqual(SAMPLE_PNG_EVENTS_HEIGHT_TOO_LOW);
    });
  });

  describe('when a target is given', () => {
    let root: HTMLDivElement;
    beforeEach(() => {
      root = document.createElement('div');
      output = new PngOutput([500, 700], 250, 500, root);
    });
    it('appends the output to the target element', () => {
      output.generate(123);
      expect(root.children.item(0)?.outerHTML).toEqual(
        '<canvas class="geostyler-legend-renderer" width="500" height="700"></canvas>'
      );
    });
  });
});
