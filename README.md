# geostyler-legend

[![Greenkeeper badge](https://badges.greenkeeper.io/geostyler/geostyler-legend.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/geostyler/geostyler-legend.svg?branch=master)](https://travis-ci.com/geostyler/geostyler-legend)
[![Coverage Status](https://coveralls.io/repos/github/geostyler/geostyler-legend/badge.svg?branch=master)](https://coveralls.io/github/geostyler/geostyler-legend?branch=master)

A simple legend component for geostyler-style.


## Installation

```javascript static
npm i geostyler-legend
```

## Usage

In order to render a legend, you construct a legend renderer like this:

```javascript
      const renderer = new LegendRenderer({
        maxColumnWidth: 300,
        maxColumnHeight: 300,
        overflow: 'auto',
        styles: [style],
        size: [600, 300],
        iconSize: [15, 15],
        legendItemTextSize: 14
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

The `size` and `iconSize` parameters refer to the legend overlay size and the legend icons size respectively.

The `legendItemTextSize` refers to the legend item's associated text font size. It's optional.

## Development

If you want to contribute, you can build the project like this:

* `git clone https://github.com/geostyler/geostyler-legend`
* `cd geostyler-legend`
* `npm i`

and then

* `npm run build`

in order to get a production build.

## <a name="funding"></a>Funding & financial sponsorship

Maintenance and further development of this code can be funded through the
[GeoStyler Open Collective](https://opencollective.com/geostyler). All contributions and
expenses can transparently be reviewed by anyone; you see what we use the donated money for.
Thank you for any financial support you give the GeoStyler project 💞

