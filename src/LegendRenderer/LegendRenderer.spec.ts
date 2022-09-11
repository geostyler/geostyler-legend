/* eslint-env jest */

import LegendRenderer from './LegendRenderer';

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
    const dom: any = document.createElement('svg');
    const returnValue = await renderer.renderLegendItem(select(<SVGGElement> dom), {
      title: 'Example',
      rule: {
        name: 'Item 1',
        symbolizers: [{
          kind: 'Icon'
        }]
      }
    }, [0, 0]);
    expect(returnValue).toBeUndefined();
  });

  it('renders a single non-empty legend item', done => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    const dom: any = document.createElement('svg');
    const result = renderer.renderLegendItem(select(<SVGGElement> dom), {
      title: 'Example',
      rule: {
        name: 'Item 1',
        symbolizers: [{
          kind: 'Mark',
          wellKnownName: 'circle'
        }]
      }
    }, [0, 0]);
    result.then(() => {
      expect(dom.querySelector('text').textContent).toBe('Example');
      done();
    });
  });

  it('renders legend with a single non-empty legend item', done => {
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
    const result: Promise<void> = renderer.render(dom);
    result.then(() => {
      const texts = dom.querySelectorAll('text');
      expect(texts[0].textContent).toBe('Example');
      expect(texts[1].textContent).toBe('Item 1');
      done();
    });
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
    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(
          ['<image src="data:image/png;base64,"></image>'],
          {type: 'image/png'}))
      })
    );
    HTMLImageElement.prototype.decode = () => new Promise(
      (resolve) => resolve());
    await renderer.render(dom);

    const texts = dom.querySelectorAll('text');
    expect(texts).toHaveLength(3);
    expect(texts[0].textContent).toBe('Example');
    expect(texts[1].textContent).toBe('Item 1');
    expect(texts[2].textContent).toBe('OSM-WMS');
    const images = dom.querySelectorAll('image');
    expect(images).toHaveLength(2);
  });

});
