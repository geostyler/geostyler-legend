/*eslint-env jest*/

import LegendRenderer from './LegendRenderer.js';

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
    expect(config.title).toBe(undefined);
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

});
