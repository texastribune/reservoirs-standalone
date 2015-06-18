# Texas Reservoir Levels

A revamped version of one of the Texas Tribune's most popular data visualizations &mdash; a [live tracker of the current state of Texas' reservoirs](http://apps.texastribune.org/reservoirs/).

This project was mostly an experiment with ECMAScript 6 with the help of the transpiler [Babel](https://babeljs.io/). [Browserify](http://browserify.org/) was also thrown in there for some extra fun because the JavaScript wasn't complicated enough!

Built using a greatly modified variation of News Apps' [App Kit](https://github.com/texastribune/newsapps-app-kit).

## Requirements

- [Node.js](https://nodejs.org/) + npm
- [Gulp](http://gulpjs.com/) installed globally

## Installation

Clone the repo, then install the dependencies.

```sh
npm install
```

To launch the test server, run:

```sh
gulp serve
```

To build for production, run:

```
gulp --production
```

## Where's the data?

The app is being powered via a separate API that shoves the `json` file it uses where it expects it on `S3`. As a result, the data will not be available in this repo.
