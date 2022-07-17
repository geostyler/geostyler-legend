import { boundingExtent } from 'ol/extent';
import OlGeometry from 'ol/geom/Geometry';
import OlGeomPoint from 'ol/geom/Point';
import OlGeomPolygon from 'ol/geom/Polygon';
import OlGeomLineString from 'ol/geom/LineString';
import OlStyle from 'ol/style/Style';
import Renderer from 'ol/render/canvas/Immediate';
import { create as createTransform } from 'ol/transform';
import {
  Style,
  Symbolizer,
  Rule
} from 'geostyler-style';
import OlStyleParser from 'geostyler-openlayers-parser';
import OlFeature from 'ol/Feature';
import SvgOutput from './SvgOutput';
import AbstractOutput from './AbstractOutput';

interface LegendItemConfiguration {
  rule?: Rule;
  title: string;
}

interface LegendConfiguration {
  items: LegendItemConfiguration[];
  title: string;
}

interface RemoteLegend {
  url: string;
  title: string;
}

interface LegendsConfiguration {
  styles?: Style[];
  configs?: LegendItemConfiguration[];
  remoteLegends?: RemoteLegend[];
  size: [number, number];
  maxColumnHeight?: number;
  maxColumnWidth?: number;
  overflow?: 'auto' | 'group';
  hideRect?: boolean;
}

const iconSize: [number, number] = [45, 30];

/**
 * A class that can be used to render legends as images.
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
   * @param {AbstractOutput} output
   * @param {LegendItemConfiguration} item configuration of the legend item
   * @param {[number, number]} position the current position
   */
  renderLegendItem(
    output: AbstractOutput,
    item: LegendItemConfiguration,
    position: [number, number]
  ) {

    const {
      hideRect,
      maxColumnHeight,
      maxColumnWidth
    } = this.config;

    if (item.rule) {
      output.useContainer(item.title);
      return this.getRuleIcon(item.rule)
        .then((uri) => {
          output.addImage(uri, ...iconSize, position[0] + 1, position[1], !hideRect);
          output.addLabel(item.title, position[0] + iconSize[0] + 5, position[1] + 20);
          position[1] += iconSize[1] + 5;
          if (maxColumnHeight && position[1] + iconSize[1] + 5 >= maxColumnHeight) {
            position[1] = 5;
            position[0] += maxColumnWidth;
          }
        })
        .catch(() => {
          return undefined;
        });
    }
    return undefined;
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
  getRuleIcon(rule: Rule): Promise<string> {
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
      name: '',
      rules: [{
        name: '',
        symbolizers: rule.symbolizers
      }]
    };
    return new Promise(async (resolve, reject) => {
      function drawGeoms(){
        geoms.forEach((geom: OlGeometry) => renderer.drawGeometry(geom));
      }
      try {
        let { output: olStyle, errors = [] } = await styleParser.writeStyle(style);
        if (errors.length > 0) {
          reject(errors[0]);
        }
        if (typeof olStyle == 'function') {
          olStyle = <OlStyle | OlStyle[]>olStyle(new OlFeature(geoms[0]), 1);
        }
        if (Array.isArray(olStyle)) {
          olStyle.forEach((styleItem: OlStyle) => {
            renderer.setStyle(styleItem);
            drawGeoms();
          });
        } else {
          renderer.setStyle(olStyle);
          drawGeoms();
        }
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject();
      }
    });
  };

  /**
   * Render a single legend.
   * @param {LegendConfiguration} config the legend config
   * @param {AbstractOutput} output
   * @param {[number, number]} position the current position
   */
  renderLegend(
    config: LegendConfiguration,
    output: AbstractOutput,
    position: [number, number]
  ) {
    output.useRoot();
    if (this.config.overflow !== 'auto' && position[0] !== 0) {
      const legendHeight = config.items.length * (iconSize[1] + 5) + 20;
      if (legendHeight + position[1] > this.config.maxColumnHeight) {
        position[0] += this.config.maxColumnWidth;
        position[1] = 0;
      }
    }
    if (config.title) {
      output.addTitle(config.title, position[0], position[1] === 0 ? '1em': position[1] + 15);
      position[1] += 20;
    }

    return config.items.reduce((cur, item) => {
      return cur.then(() => this.renderLegendItem(output, item, position));
    }, Promise.resolve());
  }

  /**
   * Render all images given by URL and append them to the legend
   * @param {RemoteLegend[]} remoteLegends the array of remote legend objects
   * @param {AbstractOutput} output
   * @param {[number, number]} position the current position
   */
  async renderImages(
    remoteLegends: RemoteLegend[],
    output: AbstractOutput,
    position: [number, number]
  ) {
    const legendSpacing = 20;
    const titleSpacing = 5;
    for (let i = 0; i < remoteLegends.length; i++) {
      const legendUrl = remoteLegends[i].url;
      const legendTitle = remoteLegends[i].title;
      try {
        const response = await fetch(legendUrl);
        const blob = await response.blob();
        const readBlob = async (imageBlob: Blob): Promise<string | ArrayBuffer> => {
          return new Promise((resolve, reject) => {
            try {
              const fileReader = new FileReader();
              fileReader.onload = async (e) => {
                const result = e.target.result;
                resolve(result) ;
              };
              fileReader.readAsDataURL(imageBlob) ;
            } catch (e) {
              reject(e);
            }
          });
        };
        const base64 = await readBlob(blob);

        let img: HTMLImageElement = new Image();
        img.src = base64.toString();
        await img.decode();

        if (this.config.overflow === 'auto' &&
            img.height + legendSpacing + titleSpacing +
            position[1] > this.config.maxColumnHeight) {
          position[0] += this.config.maxColumnWidth;
          position[1] = 0;
        }
        if (legendTitle) {
          output.useRoot();
          position[1] += legendSpacing;
          output.addTitle(legendTitle, ...position);
          position[1] += titleSpacing;
        }
        output.addImage(base64.toString(), img.width, img.height,...position, false);

        position[1] += img.height;
      } catch (err) {
        console.error('Error on fetching legend: ', err);
        continue;
      }
    }
  }

  /**
   * Renders the configured legend.
   * @param {HTMLElement} target a node to append the svg to
   * @return {SVGSVGElement} The final SVG legend
   */
  async render(target: HTMLElement) {
    const {
      styles,
      configs,
      size: [width, height],
      remoteLegends,
      maxColumnWidth,
      maxColumnHeight,
    } = this.config;
    const legends: LegendConfiguration[] = [];
    if (styles) {
      styles.forEach(style => legends.push(this.extractConfigFromStyle(style)));
    }
    if (configs) {
      legends.unshift.apply(legends, configs);
    }
    const svgOutput = new SvgOutput(target, [width, height], maxColumnWidth, maxColumnHeight);
    const position: [number, number] = [0, 0];
    for (let i = 0; i < legends.length; i++) {
      await this.renderLegend(legends[i], svgOutput, position);
    }
    if (remoteLegends) {
      await this.renderImages(remoteLegends, svgOutput, position);
    }
    return svgOutput.generate(position[1]);
  }
}
export default LegendRenderer;
