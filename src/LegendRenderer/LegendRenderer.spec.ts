/*eslint-env jest*/

import LegendRenderer from './LegendRenderer';
import { select } from 'd3-selection';

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
        wellKnownName: 'Circle'
      }],
      name: ''
    })).not.toThrow();
  });

  it('rejects to render a single empty legend item', done => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    const dom: any = document.createElement('svg');
    const result = renderer.renderLegendItem(select(<SVGSVGElement> dom), {
      title: 'Example',
      rule: {
        name: 'Item 1',
        symbolizers: [{
          kind: 'Icon'
        }]
      }
    }, [0, 0]);
    result.catch(() => {
      done();
    });
  });

  it('renders a single non-empty legend item', done => {
    const renderer = new LegendRenderer({
      size: [0, 0]
    });
    const dom: any = document.createElement('svg');
    const result = renderer.renderLegendItem(select(<SVGSVGElement> dom), {
      title: 'Example',
      rule: {
        name: 'Item 1',
        symbolizers: [{
          kind: 'Mark',
          wellKnownName: 'Circle'
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
            wellKnownName: 'Circle'
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

});
