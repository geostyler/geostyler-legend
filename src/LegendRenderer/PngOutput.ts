import AbstractOutput from './AbstractOutput';

const ROOT_CLASS = 'geostyler-legend-renderer';

export default class PngOutput extends AbstractOutput {
  canvas: HTMLCanvasElement;

  constructor(
    size: [number, number],
    maxColumnWidth: number | null,
    maxColumnHeight: number | null,
    private target?: HTMLElement,
  ) {
    super(size, maxColumnWidth, maxColumnHeight);
    this.canvas = document.createElement('canvas');
    this.canvas.className = ROOT_CLASS;
    this.canvas.width = size[0];
    this.canvas.height = size[1];
    if (this.target) {
      target.querySelectorAll(`.${ROOT_CLASS}`).forEach(e => e.remove());
      target.append(this.canvas);
    }
  }

  useContainer(title: string) {
  }

  useRoot() {
  }

  addTitle(text: string, x: number | string, y: number | string) {
  }

  addLabel(text: string, x: number | string, y: number | string) {
  }

  addImage(
    dataUrl: string,
    imgWidth: number,
    imgHeight: number,
    x: number|string,
    y: number|string,
    drawRect: boolean,
  ) {
  }

  generate(finalHeight: number) {
    const ctx = this.canvas.getContext('2d');
    ctx.fillText(`Hello world! size = ${this.size[0]}x${this.size[1]}`, 20, 20);
    return this.canvas;
  }
}
