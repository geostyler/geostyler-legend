import { BaseType, create, select, Selection } from 'd3-selection';
import AbstractOutput from './AbstractOutput';

const ROOT_CLASS = 'geostyler-legend-renderer';

function textToPx(text: string, legendItemTextSize: number | undefined): number {
  const legendItemTextSizeString = legendItemTextSize === undefined ?
    getComputedStyle(document.body).fontSize : legendItemTextSize + 'px';
  const canvas = document.createElement('canvas');
  const canvasContext = canvas.getContext('2d');
  if (canvasContext){
    canvasContext.font = legendItemTextSizeString + ' ' +  getComputedStyle(document.body).fontFamily;
    return canvasContext.measureText(text).width;
  }
  return 0;
}

export default class SvgOutput extends AbstractOutput {
  root: Selection<SVGSVGElement, unknown, null, undefined> | null | undefined = null;
  currentContainer: Selection<SVGGElement, unknown, null, undefined> | null | undefined = null;

  constructor(
    size: [number, number],
    maxColumnWidth: number | undefined,
    maxColumnHeight: number | undefined,
    legendItemTextSize: number | undefined,
    target?: HTMLElement
  ) {
    super(size, maxColumnWidth || 0, maxColumnHeight || 0, legendItemTextSize);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;

    this.root = select(svg)
      .attr('class', ROOT_CLASS)
      .attr('viewBox', `0 0 ${size[0]} ${size[1]}`)
      .attr('top', 0)
      .attr('left', 0)
      .attr('width', size[0])
      .attr('height', size[1]);
    this.currentContainer = this.root;

    if (target) {
      select(target).select(`.${ROOT_CLASS}`).remove();
      target.append(this.root.node() as Node);
    }
  }

  useContainer(title: string) {
    this.currentContainer = this.root?.append('g')
      .attr('class', 'legend-item')
      .attr('title', title);
  };

  useRoot() {
    this.currentContainer = this.root;
  };

  addTitle(text: string, x: number | string, y: number | string) {
    this.currentContainer?.append('g').append('text')
      .text(text)
      .attr('class', 'legend-title')
      .attr('text-anchor', 'start')
      .attr('dx', x)
      .attr('dy', y);
  }

  addLabel(text: string, x: number | string, y: number | string, legendItemTextSize: number | undefined) {
    const textElement = this.currentContainer?.append('text');
    if (textElement) {
      textElement.text(text)
        .attr('x', x)
        .attr('y', y);
      if (legendItemTextSize !== undefined) {
        textElement.style('font-size', legendItemTextSize + 'px');
      }
    }
  };

  addImage(
    dataUrl: string,
    imgWidth: number,
    imgHeight: number,
    x: number | string,
    y: number | string,
    drawRect: boolean
  ) {
    if (drawRect) {
      this.currentContainer?.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', imgWidth)
        .attr('height', imgHeight)
        .style('fill-opacity', 0)
        .style('stroke', 'black');
    }
    this.currentContainer?.append('svg:image')
      .attr('x', x)
      .attr('y', y)
      .attr('width', imgWidth)
      .attr('height', imgHeight)
      .attr('href', dataUrl);
    this.root?.attr('xmlns', 'http://www.w3.org/2000/svg');
    return Promise.resolve();
  };

  generate(finalHeight: number) {
    const nodes = this.root?.selectAll('g.legend-item');
    this.shortenLabels(nodes, this.maxColumnWidth || 0, this.legendItemTextSize);
    if (!this.maxColumnHeight) {
      this.root
        ?.attr('viewBox', `0 0 ${this.size[0]} ${finalHeight}`)
        .attr('height', finalHeight);
    }
    return this.root?.node() as SVGElement;
  }

  /**
   * Shortens the labels if they overflow.
   * @param {Selection} nodes the legend item group nodes
   * @param {number} maxWidth the maximum column width
   */
  private shortenLabels(
    nodes: Selection<BaseType, unknown, SVGElement, {}> | undefined,
    maxWidth: number,
    legendItemTextSize: number | undefined
  ) {
    nodes?.each(function () {
      const node = select(this);
      const text = node.select('text');
      if (!(node.node() instanceof SVGElement) || !text.size()) {
        return;
      }
      const originalStr = text.text();
      const elem: Element = <Element>text.node();
      const xPosition = parseFloat(elem.getAttribute('x') ?? '0');
      const xModuloPosition = isNaN(xPosition % maxWidth) ? 0 : xPosition % maxWidth;
      let width = textToPx(originalStr ?? '', legendItemTextSize);
      width = width + xModuloPosition;
      let adapted = false;
      while (width > maxWidth && width !== 0) {
        let str = text.text();
        str = str.substring(0, str.length - 1);
        text.text(str);
        width = textToPx(str, legendItemTextSize);
        width = width + xModuloPosition;
        adapted = true;
      }
      if (adapted) {
        let str = text.text();
        if (node.node() instanceof Element) {
          const titleNode = create('title');
          titleNode.text(originalStr);
          if (elem.nextSibling) {
            (node.node() as Element)?.insertBefore(titleNode.node()!, elem.nextSibling);
          } else {
            elem.parentNode?.append(titleNode.node()!);
          }
        }
        str = str.substring(0, str.length - 3);
        text.text(str + '...');
      }
    });
  }
}
