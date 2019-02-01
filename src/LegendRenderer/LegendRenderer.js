import select from 'd3-selection/src/select';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import {boundingExtent} from 'ol/extent';
import OlGeomPoint from 'ol/geom/Point';
import OlGeomPolygon from 'ol/geom/Polygon';
import OlGeomLineString from 'ol/geom/LineString';
import OlFeature from 'ol/Feature';

import OlStyleParser from 'geostyler-openlayers-parser';

const iconSize = [45, 30];

/**
 * A class that can be used to render svg legends.
 */
class LegendRenderer {

  /**
   * Constructs a new legend renderer.
   * @param {Object} config the legend configuration
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Constructs a legend configuration from a geostyler style object.
   * @param {Object} style a geostyler style
   */
  extractConfigFromStyle(style) {
    const config = {
      items: []
    };
    if (style.name) {
      config.title = style.name;
    }
    style.rules.forEach(rule => {
      config.items.push({
        title: rule.name,
        rule
      });
    });
    return config;
  }

  /**
   *
   * @param {*} item
   * @param {*} position
   */
  renderLegendItem(container, item, position) {
    if (item.rule) {
      const img = this.getRuleIcon(item.rule);
      // TODO image seems to have zero height
      img.then(uri => {
        container.append('image')
          .attr('x', position[0])
          .attr('y', position[1])
          .attr('width', iconSize[0])
          .attr('height', iconSize[1])
          .attr('xlink:href', uri);
      });
    }
  }

  /**
   *
   * @param {*} symbolizer
   */
  getGeometryForSymbolizer(symbolizer) {
    const kind = symbolizer.kind;
    switch (kind) {
      case 'Mark':
      case 'Icon':
      case 'Text':
        return new OlGeomPoint([iconSize[0] / 2, iconSize[1] / 2]);
      case 'Fill':
        return new OlGeomPolygon([[
          [0, 0], [iconSize[0], 0], [iconSize[0], iconSize[1]],
          [0, iconSize[1]], [0, 0]
        ]]);
      case 'Line':
        return new OlGeomLineString([
          [iconSize[0] / 6, iconSize[1] / 6],
          [iconSize[0] / 3, iconSize[1] / 3 * 2],
          [iconSize[0] / 2, iconSize[1] / 3],
          [iconSize[0] / 6 * 5, iconSize[1] / 6 * 5]
        ]);
      default:
        return new OlGeomPoint([iconSize[0] / 2, iconSize[1] / 2]);
    }
  }

  /**
   *
   * @param {*} rule
   */
  getRuleIcon(rule) {
    const layer = new OlLayerVector({
      source: new OlSourceVector()
    });
    // TODO this way the map canvas has display: none
    const div = document.createElement('div');
    new OlMap({
      layers: [layer],
      controls: [],
      interactions: [],
      target: div,
      view: new OlView({
        extent: boundingExtent([[0, 0], iconSize])
      })
    });
    rule.symbolizers.forEach(symbolizer => {
      layer.getSource().addFeature(new OlFeature({
        geometry: this.getGeometryForSymbolizer(symbolizer)
      }));
    });
    const styleParser = new OlStyleParser();

    const style = {
      rules: [{
        symbolizers: rule.symbolizers
      }]
    };
    const promise = new Promise((resolve, reject) => {
      styleParser.writeStyle(style)
        .then((olStyles) => {
          layer.setStyle(olStyles);
          // TODO image is empty, force render of the map somehow?
          resolve(div.querySelector('canvas').toDataURL('image/png'));
        })
        .catch(() => {
          reject();
        });
    });
    return promise;
  }

  /**
   * Render a single legend.
   * @param {Object} config the legend config
   * @param {d3.selection} svg the root node
   */
  renderLegend(config, svg, position) {
    const container = svg.append('g');
    if (config.title) {
      container.append('text')
        .text(config.title)
        .attr('text-anchor', 'start')
        .attr('dy', position[1])
        .attr('dx', position[0] + 25);
    }
    position[1] += 20;
    config.items.forEach(item => this.renderLegendItem(container, item, position));
  }

  /**
   * Renders the configured legend.
   */
  render() {
    const {
      styles,
      configs,
      size: [width, height]
    } = this.config;
    const legends = [];
    if (styles) {
      styles.forEach(style => legends.push(this.extractConfigFromStyle(style)));
    }
    if (configs) {
      legends.unshift.apply(legends, configs);
    }
    let svg = document.createElement('svg');
    svg = select(svg).attr('viewBox', `0 0 ${width} ${height}`);
    const position = [0, 0];
    legends.forEach(legend => this.renderLegend(legend, svg, position));
    return svg.node();
  }

}

export default LegendRenderer;