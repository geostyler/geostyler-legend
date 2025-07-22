/* eslint-env jest */

import LegendRenderer from './LegendRenderer';
import AbstractOutput from './AbstractOutput';
import { describe, expect, it, vi } from 'vitest';

class MockOutput extends AbstractOutput {
  useContainer = vi.fn();
  useRoot = vi.fn();
  addTitle = vi.fn();
  addLabel = vi.fn();
  addImage = vi.fn();
  generate = vi.fn();
  constructor(
    protected size: [number, number],
    protected maxColumnWidth: number | null,
    protected maxColumnHeight: number | null,
    protected legendItemTextSize: number | undefined
  ) {
    super(size, maxColumnWidth, maxColumnHeight, legendItemTextSize);
  }
}

describe('LegendRenderer', () => {

  it('is defined', () => {
    expect(LegendRenderer).not.toBeUndefined();
  });

  it('can be constructed', () => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    expect(renderer).not.toBeUndefined();
  });

  it('can convert config objects', () => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    const config = renderer.extractConfigFromStyle({
      rules: [{
        name: 'Legend item 1',
        symbolizers: []
      }],
      name: 'Legend 1'
    });
    expect(config.title).toBe('Legend 1');
    expect(config.items[0].title).toBe('Legend item 1');
  });

  it('can convert config objects without style name', () => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    const config = renderer.extractConfigFromStyle({
      rules: [{
        name: 'Legend item 1',
        symbolizers: []
      }],
      name: ''
    });
    expect(config.title).toBe('');
  });

  it('will not throw when constructing a rule icon', () => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    expect(() => renderer.getRuleIcon({
      symbolizers: [{
        kind: 'Mark',
        wellKnownName: 'circle'
      }],
      name: ''
    })).not.toThrow();
    expect(() => renderer.getRuleIcon({
      symbolizers: [{
        kind: 'Text',
        label: 'X'
      }],
      name: ''
    })).not.toThrow();
    expect(() => renderer.getRuleIcon({
      symbolizers: [{
        kind: 'Mark',
        wellKnownName: 'circle'
      }, {
        kind: 'Icon',
        image: 'http://domain/image.png'
      }],
      name: ''
    })).not.toThrow();
  });

  it('rejects to render a single empty legend item', async () => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    const output = new MockOutput([0, 0], null, null, undefined);
    const returnValue = await renderer.renderLegendItem(output, {
      title: 'Example',
      rule: {
        name: 'Item 1',
        symbolizers: [{
          kind: 'Icon'
        }]
      },
    }, [0, 0], [45, 30]);
    expect(returnValue).toBeUndefined();
  });

  it('renders a single non-empty legend item', async () => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    const output = new MockOutput([0, 0], null, null, undefined);
    await renderer.renderLegendItem(output, {
      title: 'Example',
      rule: {
        name: 'Item 1',
        symbolizers: [{
          kind: 'Mark',
          wellKnownName: 'circle'
        }]
      }
    }, [0, 0], [45, 30]);
    expect(output.useContainer).toHaveBeenCalledWith('Example');
    expect(output.addLabel).toHaveBeenCalledWith('Example', 50, (30 / 2) + 5, undefined);
  });

  it('renders legend with a single non-empty legend item', async () => {
    const renderer = new LegendRenderer({
      size: [0, 0],
      styles: [{
        name: 'Example',
        rules: [{
          name: 'Item 1',
          symbolizers: [{
            kind: 'Mark',
            wellKnownName: 'circle'
          }]
        }]
      }]
    });
    const dom: any = document.createElement('div');
    await renderer.render(dom);
    window.setTimeout(() => {
      const texts = dom.querySelectorAll('text');
      expect(texts[0].textContent).toBe('Example');
      expect(texts[1].textContent).toBe('Item 1');
    }, 100);
  });

  it('renders raster and vector legends', async() => {
    const renderer = new LegendRenderer({
      size: [100, 100],
      styles: [{
        name: 'Example',
        rules: [{
          name: 'Item 1',
          symbolizers: [{
            kind: 'Mark',
            wellKnownName: 'circle'
          }]
        }]
      }],
      remoteLegends: [{
        title: 'OSM-WMS',
        url: 'https://ows.terrestris.de/osm/service?' +
          'REQUEST=GetLegendGraphic&SERVICE=WMS&' +
          'VERSION=1.3.0&LAYER=OSM-WMS&FORMAT=image%2Fpng'
      }]
    });
    const dom: any = document.createElement('div');
    // @ts-expect-error mock is just missing a few properties that are not needed
    global.fetch = vi.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(
          ['<image src="data:image/png;base64,"></image>'],
          {type: 'image/png'}))
      })
    );
    HTMLImageElement.prototype.decode = () => new Promise(
      (resolve) => resolve());
    await renderer.render(dom);

    window.setTimeout(() => {
      const texts = dom.querySelectorAll('text');
      expect(texts).toHaveLength(3);
      expect(texts[0].textContent).toBe('Example');
      expect(texts[1].textContent).toBe('Item 1');
      expect(texts[2].textContent).toBe('OSM-WMS');
      const images = dom.querySelectorAll('image');
      expect(images).toHaveLength(2);
    }, 100);
  });

});
