import AbstractOutput from './AbstractOutput';

const ROOT_CLASS = 'geostyler-legend-renderer';

function cssDimensionToPx(dimension: string | number, legendItemTextSize: number | undefined = undefined): number {
  if (typeof dimension === 'number') {
    return dimension;
  }
  const div = document.createElement('div');
  document.body.append(div);
  div.style.height = dimension;
  if (legendItemTextSize) {
    div.style.fontSize = legendItemTextSize + 'px';
  }
  const height = parseFloat(getComputedStyle(div).height.replace(/px$/, ''));
  div.remove();
  return height;
}

export default class PngOutput extends AbstractOutput {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(
    size: [number, number],
    maxColumnWidth: number | null | 'fit-content',
    maxColumnHeight: number | null,
    legendItemTextSize: number | undefined,
    private target?: HTMLElement,
  ) {
    super(size, maxColumnWidth, maxColumnHeight, legendItemTextSize);
    this.createCanvas(...size);
  }

  useContainer(title: string) {}

  useRoot() {}

  addTitle(text: string, x: number | string, y: number | string) {
    this.context.fillText(text, cssDimensionToPx(x), cssDimensionToPx(y));
  }

  addLabel(text: string, x: number | string, y: number | string, legendItemTextSize: number | undefined): number {
    const xPx = cssDimensionToPx(x);
    this.expandWidth(xPx + this.context.measureText(text).width);
    this.context.fillText(text, cssDimensionToPx(x), cssDimensionToPx(y), legendItemTextSize);
    return this.context.measureText(text).width;
  }

  async addImage(
    dataUrl: string,
    imgWidth: number,
    imgHeight: number,
    x: number|string,
    y: number|string,
    drawRect: boolean,
  ) {
    const xPx = cssDimensionToPx(x);
    const yPx = cssDimensionToPx(y);
    this.expandHeight(yPx + imgHeight);
    this.expandWidth(xPx + imgWidth);
    const image = new Image();
    const imageLoaded = new Promise(resolve => image.onload = resolve);
    image.src = dataUrl;
    await imageLoaded;
    this.context.drawImage(image, xPx, yPx, imgWidth, imgHeight);
    if (drawRect) {
      this.context.strokeStyle = '1px solid black';
      this.context.strokeRect(xPx, yPx, imgWidth, imgHeight);
    }
  }

  generate(finalHeight: number) {
    return this.canvas;
  }

  private createCanvas(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = ROOT_CLASS;
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.context.font = '14px sans-serif';

    if (this.target) {
      this.target.querySelectorAll(`.${ROOT_CLASS}`).forEach(e => e.remove());
      this.target.append(this.canvas);
    }
  }

  private expandHeight(newHeight: number) {
    if (this.canvas.height >= newHeight) {
      return;
    }
    const oldCanvas = this.canvas;
    this.createCanvas(this.canvas.width, newHeight);
    this.context.drawImage(oldCanvas, 0, 0);
  }

  private expandWidth(newWidth: number) {
    if (this.canvas.width >= newWidth) {
      return;
    }
    const oldCanvas = this.canvas;
    this.createCanvas(newWidth, this.canvas.height);
    this.context.drawImage(oldCanvas, 0, 0);
  }
}
