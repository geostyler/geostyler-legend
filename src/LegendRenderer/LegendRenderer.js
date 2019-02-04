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
   * Renders a single legend item.
   * @param {d3.selection} container the container to append the legend item to
   * @param {Object} item configuration of the legend item
   * @param {Number[]} position the current position
   */
  renderLegendItem(container, item, position) {
    if (item.rule) {
      container = container.append('g')
        .attr('class', 'legend-item')
        .attr('title', item.title);
      const img = this.getRuleIcon(item.rule);
      return img.then(uri => {
        container.append('rect')
          .attr('x', position[0] + 1)
          .attr('y', position[1])
          .attr('width', iconSize[0])
          .attr('height', iconSize[1])
          .style('fill-opacity', 0)
          .style('stroke', 'black');
        container.append('image')
          .attr('x', position[0] + 1)
          .attr('y', position[1])
          .attr('width', iconSize[0])
          .attr('height', iconSize[1])
          .attr('href', uri);
        container.append('text')
          .text(item.title)
          .attr('x', position[0] + iconSize[0] + 5)
          .attr('y', position[1] + 20);
        position[1] += iconSize[1] + 5;
        if (position[1] + iconSize[1] + 5 >= this.config.maxColumnHeight) {
          position[1] = 5;
          position[0] += this.config.maxColumnWidth;
        }
      });
    }
  }

  /**
   * Shortens the labels if they overflow.
   * @param {d3.selection} nodes the legend item group nodes
   * @param {Number} maxWidth the maximum column width
   */
  shortenLabels(nodes, maxWidth) {
    nodes.each(function() {
      const node = select(this);
      const text = node.select('text');
      let width = node.node().getBoundingClientRect().width;
      let adapted = false;
      while (width > maxWidth) {
        let str = text.text();
        str = str.substring(0, str.length - 1);
        text.text(str);
        width = node.node().getBoundingClientRect().width;
        adapted = true;
      }
      if (adapted) {
        let str = text.text();
        str = str.substring(0, str.length - 3);
        text.text(str + '...');
      }
    });
  }

  /**
   * Constructs a geometry for rendering a specific symbolizer.
   * @param {Object} symbolizer the symbolizer object
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
          [3, 3], [iconSize[0] - 3, 3], [iconSize[0] - 3, iconSize[1] - 3],
          [3, iconSize[1] - 3], [3, 3]
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
   * Returns a promise resolving to a data uri with the appropriate rule icon.
   * @param {Object} rule the geostyler rule
   */
  getRuleIcon(rule) {
    const layer = new OlLayerVector({
      source: new OlSourceVector()
    });
    const div = document.createElement('div');
    document.body.append(div);
    div.style.width = `${iconSize[0]}px`;
    div.style.height = `${iconSize[1]}px`;
    const map = new OlMap({
      layers: [layer],
      controls: [],
      interactions: [],
      target: div,
      view: new OlView({
        extent: boundingExtent([[0, 0], [iconSize[0], iconSize[1]]])
      })
    });
    map.getView().fit([0, 0, iconSize[0], iconSize[1]]);
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
          map.on('rendercomplete', () => {
            div.remove();
            resolve(div.querySelector('canvas').toDataURL('image/png'));
          });
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
    if (this.config.overflow !== 'auto' && position[0] !== 0) {
      const legendHeight = config.items.length * (iconSize[1] + 5) + 20;
      if (legendHeight + position[1] > this.config.maxColumnHeight) {
        position[0] += this.config.maxColumnWidth;
        position[1] = 0;
      }
    }
    if (config.title) {
      container.append('text')
        .text(config.title)
        .attr('text-anchor', 'start')
        .attr('dy', position[1] + 10)
        .attr('dx', position[0]);
      position[1] += 20;
    }

    return config.items.reduce((cur, item) => {
      return cur.then(() => this.renderLegendItem(svg, item, position));
    }, Promise.resolve());
  }

  /**
   * Renders the configured legend.
   * @param {HTMLElement} parent a node to append the svg to
   */
  render(parent) {
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
    const svg = select(parent)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('top', 0)
      .attr('left', 0)
      .attr('width', width)
      .attr('height', height);

    const position = [0, 0];

    const promise = legends.reduce((cur, legend) => {
      return cur.then(() => this.renderLegend(legend, svg, position));
    }, Promise.resolve());
    promise.then(() => {
      const nodes = svg.selectAll('g.legend-item');
      this.shortenLabels(nodes, this.config.maxColumnWidth);
    });

    return svg.node();
  }

}

export default LegendRenderer;
