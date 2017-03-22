# Mohill

<!-- [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

[![Build Status](https://travis-ci.org/nju33/mohill.svg?branch=master)](https://travis-ci.org/nju33/mohill) -->

💄 Hill-shaped modal element


![screenshot](https://github.com/nju33/mohill/raw/master/images/screenshot.gif?raw=true)

## Install or Download

```sh
yarn add mohill
npm i -S mohill
```

Or access to [releases page](https://github.com/nju33/mohill/releases).
Then, download the latest version.

## Usage

First, if you read as a separate file

```html
<script src="/path/tp/mohill.js"></script>
```

Please specify `id` for children of target element.
It will be used when opening.

```html
  <!-- ... -->
  <div id="foo-trigger"></div>
  <div id="bar-trigger"></div>

  <div id="target">
    <div id="foo" style="display:none">
      <div id="close-button"></div>
    </div>
    <div id="bar" style="display:none">
      ...
    </div>
  </div>
  <!-- ... -->
```

For example, if you want to set an event for an element in `#foo`, please set it before creating Mohill instance.

```js
import Mohill from 'mohill';

document.getElementById('close-button').addEventListener('click', () => {
  mohill.close();
});

const mohill = new Mohill({
  target: getElementById('target'),
  data: {
    style: {
      // defaults
      height: '70vh',
      width: '70%',
      coverBackgroundColor: 'rgba(0,0,0,.4)',
      backgroundColor: '#222',
      borderRadius: '6px'
    }
  }
});

document.getElementById('foo-trigger').addEventListener('click', () => {
  mihill.open('foo');
});

document.getElementById('bar-trigger').addEventListener('click', () => {
  // If you want to change the style
  mihill.setStyle({backgroundColor: '#ccc'});
  mihill.open('bar');
});
```

### Example

- `test/fixtures/index.js`
- `example/webpack/index.js`

## LICENSE

The MIT License (MIT)

Copyright (c) 2017 nju33 <nju33.ki@gmail.com>
