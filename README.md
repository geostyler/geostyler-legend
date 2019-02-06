# legend-util

[![Greenkeeper badge](https://badges.greenkeeper.io/terrestris/legend-util.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/terrestris/legend-util.svg?branch=master)](https://travis-ci.com/terrestris/legend-util)
[![Coverage Status](https://coveralls.io/repos/github/terrestris/legend-util/badge.svg?branch=master)](https://coveralls.io/github/terrestris/legend-util?branch=master)

A helper class for rendering legends.

## Installation

```javascript static
npm i @terrestris/legend-util
```

## Usage

In order to render a legend, you construct a legend renderer like this:

```javascript
      const renderer = new LegendRenderer({
        maxColumnWidth: 300,
        maxColumnHeight: 300,
        overflow: 'auto',
        styles: [style],
        size: [600, 300]
      });
      renderer.render(someElement);
```

The `styles` property can contain a list of geostyler style objects that
each correspond to one legend rendered.

There are currently three modes. If constructed as above, the renderer will
render multiple columns if needed, with a maximum width and height as specified.
The columns will break on any legend element.

If the `overflow` property is set to `'group'`, the columns will break on
legend boundaries only, leaving the rest of the column empty if starting
on a new legend.

If the `maxColumnHeight` property is not set, the renderer will render just
one column with all the legends, thus ignoring the size parameter for the height.

## Development

If you want to contribute, you can build the project like this:

* `git clone https://github.com/terrestris/legend-util`
* `cd legend-util`
* `npm i`

and then either

* `npm run build:dev`

in order to get a development build or

* `npm run build:dist`

in order to get a production build.