import { select, Selection, BaseType } from 'd3-selection';

import { boundingExtent } from 'ol/extent';
import OlGeomPoint from 'ol/geom/Point';
import OlGeomPolygon from 'ol/geom/Polygon';
import OlGeomLineString from 'ol/geom/LineString';
import Renderer from 'ol/render/canvas/Immediate';
import { create as createTransform } from 'ol/transform';
import {
  Style,
  Symbolizer,
  Rule
 } from 'geostyler-style';

import OlStyleParser from 'geostyler-openlayers-parser';

interface OlStyle {}
interface OlGeometry {}

interface LegendItemConfiguration {
  rule?: Rule;
  title: string;
}

interface LegendConfiguration {
  items: LegendItemConfiguration[];
  title: string;
}

interface LegendsConfiguration {
  styles?: Style[];
  configs?: LegendItemConfiguration[];
  size: [number, number];
  maxColumnHeight?: number;
  maxColumnWidth?: number;
  overflow?: 'auto' | 'group';
}

const iconSize = [45, 30];

/**
 * A class that can be used to render svg legends.
 */
class LegendRenderer {

  config: LegendsConfiguration = null;

  /**
   * Constructs a new legend renderer.
   * @param {LegendsConfiguration} config the legend configuration
   */
  constructor(config: LegendsConfiguration) {
    this.config = config;
  }

  /**
   * Constructs a legend configuration from a geostyler style object.
   * @param {Style} style a geostyler style
   */
  extractConfigFromStyle(style: Style) {
    const config: LegendConfiguration = {
      items: [],
      title: ''
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
   * @param {Selection} container the container to append the legend item to
   * @param {LegendItemConfiguration} item configuration of the legend item
   * @param {[number, number]} position the current position
   */
  renderLegendItem(
    container: Selection<SVGGElement, {}, null, undefined>,
    item: LegendItemConfiguration,
    position: [number, number]
  ) {
    if (item.rule) {
      container = container.append('g')
        .attr('class', 'legend-item')
        .attr('title', item.title);
      const img = this.getRuleIcon(item.rule);
      return img.then((uri: string) => {
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
        if (this.config.maxColumnHeight && position[1] + iconSize[1] + 5 >= this.config.maxColumnHeight) {
          position[1] = 5;
          position[0] += this.config.maxColumnWidth;
        }
      });
    }
    return undefined;
  }

  /**
   * Shortens the labels if they overflow.
   * @param {Selection} nodes the legend item group nodes
   * @param {number} maxWidth the maximum column width
   */
  shortenLabels(nodes: Selection<BaseType, {}, SVGSVGElement, {}>, maxWidth: number) {
    nodes.each(function() {
      const node = select(this);
      const text = node.select('text');
      if (!(node.node() instanceof SVGElement)) {
        return;
      }
      const elem: Element = <Element> (node.node());
      let width = elem.getBoundingClientRect().width;
      let adapted = false;
      while (width > maxWidth) {
        let str = text.text();
        str = str.substring(0, str.length - 1);
        text.text(str);
        width = elem.getBoundingClientRect().width;
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
   * @param {Symbolizer} symbolizer the symbolizer object
   */
  getGeometryForSymbolizer(symbolizer: Symbolizer): OlGeometry {
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
  getRuleIcon(rule: Rule): Promise<OlStyle> {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', `${iconSize[0]}`);
    canvas.setAttribute('height', `${iconSize[1]}`);
    const extent = boundingExtent([[0, 0], [iconSize[0], iconSize[1]]]);
    const pixelRatio = 1;
    const context = canvas.getContext('2d');
    const transform = createTransform();
    const renderer = new Renderer(context, pixelRatio, extent, transform, 0);
    const geoms: OlGeometry[] = [];
    rule.symbolizers.forEach(symbolizer => geoms.push(this.getGeometryForSymbolizer(symbolizer)));

    const styleParser = new OlStyleParser();

    const style = {
      rules: [{
        symbolizers: rule.symbolizers
      }]
    };
    const promise = new Promise((resolve, reject) => {
      styleParser.writeStyle(style)
        .then((olStyle: OlStyle) => {
          renderer.setStyle(olStyle);
          geoms.forEach((geom: OlGeometry) => renderer.drawGeometry(geom));
          resolve(canvas.toDataURL('image/png'));
        })
        .catch(() => {
          reject();
        });
    });
    return promise;
  }

  /**
   * Render a single legend.
   * @param {LegendConfiguration} config the legend config
   * @param {Selection} svg the root node
   * @param {[number, number]} position the current position
   */
  renderLegend(
    config: LegendConfiguration,
    svg: Selection<SVGSVGElement, {}, null, undefined>,
    position: [number, number]
  ) {
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
  render(parent: HTMLElement) {
    const {
      styles,
      configs,
      size: [width, height]
    } = this.config;
    const legends: LegendConfiguration[] = [];
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

    const position: [number, number] = [0, 0];

    const promise = legends.reduce((cur, legend) => {
      return cur.then(() => this.renderLegend(legend, svg, position));
    }, Promise.resolve());
    promise.then(() => {
      const nodes = svg.selectAll('g.legend-item');
      this.shortenLabels(nodes, this.config.maxColumnWidth);
      if (!this.config.maxColumnHeight) {
        svg
          .attr('viewBox', `0 0 ${width} ${position[1]}`)
          .attr('height', position[1]);
      }
    });

    return svg.node();
  }

}

export default LegendRenderer;
