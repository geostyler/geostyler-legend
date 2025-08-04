abstract class AbstractOutput {
  protected constructor(
    protected size: [number, number],
    protected maxColumnWidth: number | null | 'fit-content',
    protected maxColumnHeight: number | null,
    protected legendItemTextSize: number | undefined
  ) {}
  abstract useContainer(title: string): void;
  abstract useRoot(): void;
  abstract addTitle(text: string, x: number|string, y: number|string): void;
  abstract addLabel(text: string, x: number|string, y: number|string, legendItemTextSize: number | undefined): number;
  abstract addImage(
    dataUrl: string,
    imgWidth: number,
    imgHeight: number,
    x: number|string,
    y: number|string,
    drawRect: boolean,
  ): Promise<void>;
  abstract generate(finalHeight: number): Element;
}
export default AbstractOutput;
