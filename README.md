# bpmn-js Element ID Displayer

A plugin for BPMN diagrams that displays element IDs directly on the diagram. This plugin is essential for debugging and understanding complex BPMN workflows, allowing you to easily visualize and identify each element by its unique ID.

![Sample](https://raw.githubusercontent.com/loremipsumowski/bpmn-js-element-id-displayer/main/resources/sample.png)

## Features

- **ID Display**: Automatically displays the IDs of BPMN elements.
- **Customizable**: Easily toggle which types of elements should display their IDs.
- **Seamless Integration**: Works with BPMN-js out of the box.
- **Development and Production Builds**: Optimized builds for both development and production environments.
- **Persistent Settings**: User preferences for displaying IDs are saved in localStorage, ensuring settings persist across sessions.

## Demo

You can see a live demo of this project [here](https://loremipsumowski.github.io/bpmn-js-element-id-displayer/).

## Usage

### Installation

First, install the plugin using npm:

```bash
npm install bpmn-js-element-id-displayer
```

### Example with BpmnModeler

Here is an example of how to use the `bpmn-js Element ID Displayer` plugin with `BpmnModeler`:

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import ElementIdDisplayer from 'bpmn-js-element-id-displayer';
import diagramXML from './diagram.bpmn';

const modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    ElementIdDisplayer
  ]
});

modeler.importXML(diagramXML, function(err) {
  if (err) {
    console.error('Error importing BPMN diagram', err);
  } else {
    console.log('BPMN diagram imported successfully');
  }
});
```

## Development

To start the development server, run:

```bash
npm start
```

## Build

To build the library for production, run:

```bash
npm run build
```

This will create a bundled file `bpmn-js-element-id-displayer.bundle.js` in the `dist` directory.

## Linting

To lint the code and automatically fix issues, run:

```bash
npm run lint
```