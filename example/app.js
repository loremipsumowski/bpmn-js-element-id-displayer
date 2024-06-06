import newDiagramXML from './newDiagram.bpmn';

import ElementIdDisplayer from '..';

import BpmnModeler from 'bpmn-js/lib/Modeler';

const canvas = document.querySelector('#canvas');
const modeler = new BpmnModeler({
  container: canvas,
  additionalModules: [
    ElementIdDisplayer,
  ],
  keyboard: {
    bindTo: document
  }
});

modeler.importXML(newDiagramXML).then(result => {

  const {
    warnings = []
  } = result;

  if (warnings.length) {
    console.log('imported with warnings', warnings);
  }
}).catch(error => {
  console.error('import error', error);
});

