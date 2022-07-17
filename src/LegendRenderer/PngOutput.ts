import AbstractOutput from './AbstractOutput';

const ROOT_CLASS = 'geostyler-legend-renderer';

function cssDimensionToPx(dimension: string | number): number {
  if (typeof dimension === 'number') {
    return dimension;
  }
  const div = document.createElement('div');
  document.body.append(div);
  div.style.height = dimension;
  const height = parseFloat(getComputedStyle(div).height.replace(/px$/, ''));
  div.remove();
  return height;
}

export default class PngOutput extends AbstractOutput {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(
    size: [number, number],
    maxColumnWidth: number | null,
    maxColumnHeight: number | null,
    private target?: HTMLElement,
  ) {
    super(size, maxColumnWidth, maxColumnHeight);
    this.createCanvas(...size);
  }

  private createCanvas(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = ROOT_CLASS;
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');
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

  useContainer(title: string) {}

  useRoot() {}

  addTitle(text: string, x: number | string, y: number | string) {
    this.context.fillText(text, cssDimensionToPx(x), cssDimensionToPx(y));
  }

  addLabel(text: string, x: number | string, y: number | string) {
    this.context.fillText(text, cssDimensionToPx(x), cssDimensionToPx(y));
  }

  addImage(
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
    const image = new Image();
    image.src = dataUrl;
    this.context.drawImage(image, xPx, yPx, imgWidth, imgHeight);
    if (drawRect) {
      this.context.strokeStyle = '1px solid black';
      this.context.strokeRect(xPx, yPx, imgWidth, imgHeight);
    }
  }

  generate(finalHeight: number) {
    return this.canvas;
  }
}
