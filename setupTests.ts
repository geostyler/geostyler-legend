import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.Image = dom.window.Image;
global.Element = dom.window.Element;
global.getComputedStyle = dom.window.getComputedStyle;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
global.SVGElement = dom.window.SVGElement;
global.HTMLImageElement = dom.window.HTMLImageElement;
global.FileReader = dom.window.FileReader;
global.Blob = dom.window.Blob;
global.File = dom.window.File;
