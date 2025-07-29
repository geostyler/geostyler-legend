import { boundingExtent } from 'ol/extent';
import OlGeometry from 'ol/geom/Geometry';
import OlGeomPoint from 'ol/geom/Point';
import OlGeomPolygon from 'ol/geom/Polygon';
import OlGeomLineString from 'ol/geom/LineString';
import OlImageState from 'ol/ImageState';
import OlStyle from 'ol/style/Style';
import Renderer from 'ol/render/canvas/Immediate';
import { isRule, isSymbolizer, Rule, Style, Symbolizer } from 'geostyler-style';
import { create as createTransform } from 'ol/transform';
import OlStyleParser from 'geostyler-openlayers-parser/dist/OlStyleParser';
import OlFeature from 'ol/Feature';
import SvgOutput from './SvgOutput';
import AbstractOutput from './AbstractOutput';
import PngOutput from './PngOutput';

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
  maxColumnWidth?: number | 'fit-content';
  overflow?: 'auto' | 'group';
  hideRect?: boolean;
  iconSize?: [number, number];
  legendItemTextSize?: number;
}

const defaultIconSize: [number, number] = [45, 30];

/**
 * A class that can be used to render legends as images.
 */
export class LegendRenderer {
  config: LegendsConfiguration | null = null;
  private _iconSize: [number, number];

  /**
   * Constructs a new legend renderer.
   * @param {LegendsConfiguration} config the legend configuration
   */
  constructor(config: LegendsConfiguration) {
    this.config = config;
    this.config.iconSize = this.config.iconSize ?? defaultIconSize;
    this._iconSize = this.config.iconSize;
  }

  /**
   * Constructs a legend configuration from a geostyler style object.
   * @param {Style} style a geostyler style
   */
  extractConfigFromStyle(style: Style) {
    const config: LegendConfiguration = {
      items: [],
      title: '',
    };
    if (style.name) {
      config.title = style.name;
    }
    style.rules.forEach((rule) => {
      config.items.push({
        title: rule.name,
        rule,
      });
    });
    return config;
  }

  /**
   * Renders a single legend item.
   * @param {AbstractOutput} output
   * @param {LegendItemConfiguration} item configuration of the legend item
   * @param {[number, number]} position the current position
   * @param {[number, number]} iconSize the icon size defined in config
   */
  renderLegendItem(
    output: AbstractOutput,
    item: LegendItemConfiguration,
    position: [number, number],
    iconSize: [number, number],
    autoMaxColumnWidth: number
  ) {
    if (!this.config) {
      return;
    }

    const {
      hideRect,
      maxColumnHeight,
      maxColumnWidth,
      legendItemTextSize
    } = this.config;

    if (item.rule) {
      output.useContainer(item.title);
      return this.getRuleIcon(item.rule)
        .then(async (uri) => {
          await output.addImage(
            uri,
            ...iconSize,
            position[0] + 1,
            position[1],
            !hideRect
          );
          const columnWidth = output.addLabel(
            item.title,
            position[0] + iconSize[0] + 5,
            position[1] + iconSize[1] / 2 + 5,
            legendItemTextSize
          );
          if (
            columnWidth + position[0] + iconSize[0] + 5 >
            autoMaxColumnWidth
          ) {
            autoMaxColumnWidth = columnWidth + position[0] + iconSize[0] + 5;
          }
          position[1] += iconSize[1] + 5;
          if (
            maxColumnHeight &&
            position[1] + iconSize[1] + 5 >= maxColumnHeight
          ) {
            position[1] = 5;
            if (maxColumnWidth === 'fit-content') {
              position[0] = autoMaxColumnWidth;
            } else {
              position[0] += maxColumnWidth || 0;
            }
          }
          return autoMaxColumnWidth;
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
    if (!isSymbolizer(symbolizer)) {
      throw new Error('Invalid symbolizer');
    }

    const kind = symbolizer.kind;
    switch (kind) {
      case 'Mark':
      case 'Icon':
      case 'Text':
        return new OlGeomPoint([this._iconSize[0] / 2, this._iconSize[1] / 2]);
      case 'Fill':
        return new OlGeomPolygon([
          [
            [3, 3],
            [this._iconSize[0] - 3, 3],
            [this._iconSize[0] - 3, this._iconSize[1] - 3],
            [3, this._iconSize[1] - 3],
            [3, 3],
          ],
        ]);
      case 'Line':
        return new OlGeomLineString([
          [this._iconSize[0] / 6, this._iconSize[1] / 6],
          [this._iconSize[0] / 3, (this._iconSize[1] / 3) * 2],
          [this._iconSize[0] / 2, this._iconSize[1] / 3],
          [(this._iconSize[0] / 6) * 5, (this._iconSize[1] / 6) * 5],
        ]);
      case 'Raster': {
        throw new Error('Not implemented yet: "Raster" case');
      }
      default:
        return new OlGeomPoint([this._iconSize[0] / 2, this._iconSize[1] / 2]);
    }
  }

  /**
   * Returns a promise resolving to a data uri with the appropriate rule icon.
   * @param {Object} rule the geostyler rule
   */
  getRuleIcon(rule: Rule): Promise<string> {
    if (!isRule(rule)) {
      return Promise.reject('Invalid rule');
    }

    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', `${this._iconSize[0]}`);
    canvas.setAttribute('height', `${this._iconSize[1]}`);
    const extent = boundingExtent([
      [0, 0],
      [this._iconSize[0], this._iconSize[1]],
    ]);
    const pixelRatio = 1;
    const context = canvas.getContext('2d');
    const transform = createTransform();
    const renderer = new Renderer(
      context as CanvasRenderingContext2D,
      pixelRatio,
      extent,
      transform,
      0
    );
    const geoms: OlGeometry[] = [];

    rule.symbolizers.forEach((symbolizer) =>
      geoms.push(this.getGeometryForSymbolizer(symbolizer))
    );

    const styleParser = new OlStyleParser();

    const style = {
      name: '',
      rules: [
        {
          name: '',
          symbolizers: rule.symbolizers,
        },
      ],
    };

    return new Promise(async (resolve, reject) => {
      function drawGeoms() {
        geoms.forEach((geom: OlGeometry) => renderer.drawGeometry(geom));
      }
      try {
        let { output: olStyle, errors = [] } = await styleParser.writeStyle(
          style
        );
        if (errors.length > 0) {
          reject(errors[0]);
        }
        if (typeof olStyle == 'function') {
          olStyle = <OlStyle | OlStyle[]>olStyle(new OlFeature(geoms[0]), 1);
        }
        if (Array.isArray(olStyle)) {
          // Trigger loading of all images and wait for them to complete loading
          await Promise.all(olStyle.map((styleItem) => this.loadStyleImage(styleItem)));

          olStyle.forEach((styleItem: OlStyle) => {
            renderer.setStyle(styleItem);
            drawGeoms();
          });
        } else {
          // Trigger loading of image and wait for it to complete loading
          await this.loadStyleImage(olStyle);

          // @ts-expect-error TODO fix type errors
          renderer.setStyle(olStyle);
          drawGeoms();
        }
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject();
      }
    });
  }

  /**
    * Loads the image of a style item and resolves with true if loaded, false otherwise.
    * @param {OlStyle} styleItem the style item to load
    * @returns {Promise<boolean>} a promise resolving to true if the image is loaded, false otherwise
    */
  loadStyleImage = (styleItem?: OlStyle) => new Promise((resolve) => {
    const imgLoaded = () => resolve(true);
    const imgNotLoaded = () => resolve(false);

    const styleItemImage = styleItem?.getImage();
    if (!styleItemImage) {
      return imgNotLoaded();
    }

    // If image is already loaded, resolve immediately
    if (styleItemImage.getImageState() === OlImageState.LOADED) {
      return imgLoaded();
    }

    const img = styleItemImage.getImage(1);

    // Check if img is an HTMLImageElement before adding event listeners
    if (img instanceof HTMLImageElement) {
      const cleanup = () => {
        img.removeEventListener('error', onError);
        img.removeEventListener('load', onLoad);
      };

      const onError = () => {
        cleanup();
        imgNotLoaded();
      };
      const onLoad = () => {
        cleanup();
        imgLoaded();
      };

      img.addEventListener('error', onError);
      img.addEventListener('load', onLoad);

      styleItemImage.load();
    } else {
      // If img is HTMLCanvasElement | HTMLVideoElement | ImageBitmap, just resolve as not loaded
      // TODO handle these cases properly
      return imgNotLoaded();
    }
  });

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
    if (!this.config) {
      return;
    }
    output.useRoot();
    if (this.config.overflow !== 'auto' && position[0] !== 0) {
      const legendHeight = config.items.length * (this._iconSize[1] + 5) + 20;
      // @ts-expect-error TODO fix type errors
      if (legendHeight + position[1] > this.config.maxColumnHeight) {
        // @ts-expect-error TODO fix type errors
        position[0] += this.config.maxColumnWidth;
        position[1] = 0;
      }
    }
    if (config.title) {
      output.addTitle(
        config.title,
        position[0],
        position[1] === 0 ? '1em' : position[1] + 15
      );
      position[1] += 20;
    }
    let autoMaxColumnWidth: number | undefined = 0;
    return config.items.reduce((cur, item) => {
      return cur.then(async () => {
        autoMaxColumnWidth = await this.renderLegendItem(
          output,
          item,
          position,
          this._iconSize,
          autoMaxColumnWidth ?? 0
        );
      });
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
        const readBlob = async (
          imageBlob: Blob
        ): Promise<string | ArrayBuffer> => {
          return new Promise((resolve, reject) => {
            try {
              const fileReader = new FileReader();
              fileReader.onload = async (e) => {
                // @ts-expect-error TODO fix type errors
                const result = e.target.result;
                // @ts-expect-error TODO fix type errors
                resolve(result);
              };
              fileReader.readAsDataURL(imageBlob);
            } catch (e) {
              reject(e);
            }
          });
        };
        const base64 = await readBlob(blob);

        let img: HTMLImageElement = new Image();
        img.src = base64.toString();
        await img.decode();

        // @ts-expect-error TODO fix type errors
        if (this.config.overflow === 'auto' &&
          img.height +
            legendSpacing +
            titleSpacing +
            // @ts-expect-error TODO fix type errors
            position[1] > this.config.maxColumnHeight
        ) {
          // @ts-expect-error TODO fix type errors
          position[0] += this.config.maxColumnWidth;
          position[1] = 0;
        }
        if (legendTitle) {
          output.useRoot();
          position[1] += legendSpacing;
          output.addTitle(legendTitle, ...position);
          position[1] += titleSpacing;
        }
        await output.addImage(
          base64.toString(),
          img.width,
          img.height,
          ...position,
          false
        );

        position[1] += img.height;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error on fetching legend: ', err);
        continue;
      }
    }
  }

  async renderAsImage(
    format?: 'svg' | 'png',
    target?: HTMLElement
  ): Promise<Element> {
    if (!this.config) {
      return Promise.reject();
    }
    const {
      styles,
      configs,
      size: [width, height],
      remoteLegends,
      maxColumnWidth,
      maxColumnHeight,
      legendItemTextSize
    } = this.config;
    const legends: LegendConfiguration[] = [];
    if (styles) {
      styles.forEach((style) =>
        legends.push(this.extractConfigFromStyle(style))
      );
    }
    if (configs) {
      legends.unshift.apply(legends, configs);
    }
    const outputClass = format === 'svg' ? SvgOutput : PngOutput;
    const output = new outputClass([width, height], maxColumnWidth || 0, maxColumnHeight || 0,
      legendItemTextSize, target);
    const position: [number, number] = [0, 0];
    for (let i = 0; i < legends.length; i++) {
      await this.renderLegend(legends[i], output, position);
    }
    if (remoteLegends) {
      await this.renderImages(remoteLegends, output, position);
    }
    return output.generate(position[1]);
  }

  /**
   * Renders the configured legend as an SVG or PNG image in the given target container. All pre-existing legends
   * will be removed.
   * @param {HTMLElement} target a node to append the svg to
   * @param format
   * @return {SVGSVGElement} The final SVG legend
   */
  async render(target: HTMLElement, format: 'svg' | 'png' = 'svg') {
    await this.renderAsImage(format, target);
  }
}
export default LegendRenderer;
