import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { append as svgAppend, create as svgCreate } from 'tiny-svg';

const HIGH_PRIORITY = 1500;


const elementCategories = [
  { type: 'tasks', label: 'Tasks' },
  { type: 'events', label: 'Events' },
  { type: 'gateways', label: 'Gateways' },
  { type: 'sequenceFlows', label: 'Sequence Flows' },
  { type: 'dataObjects', label: 'Data Objects' },
  { type: 'others', label: 'Others' }
];

function categorizeBpmnElement(elementType) {
  switch (elementType) {
  case 'bpmn:Task':
  case 'bpmn:ServiceTask':
  case 'bpmn:ReceiveTask':
  case 'bpmn:UserTask':
  case 'bpmn:ManualTask':
  case 'bpmn:ScriptTask':
  case 'bpmn:BusinessRuleTask':
  case 'bpmn:SendTask': {
    return elementCategories[0];
  }
  case 'bpmn:StartEvent':
  case 'bpmn:EndEvent':
  case 'bpmn:IntermediateThrowEvent':
  case 'bpmn:BoundaryEvent':
  case 'bpmn:IntermediateCatchEvent': {
    return elementCategories[1];
  }
  case 'bpmn:ExclusiveGateway':
  case 'bpmn:InclusiveGateway':
  case 'bpmn:ParallelGateway':
  case 'bpmn:EventBasedGateway': {
    return elementCategories[2];
  }
  case 'bpmn:SequenceFlow':{
    return elementCategories[3];
  }
  case 'bpmn:DataObjectReference':
  case 'bpmn:DataStoreReference':
  case 'bpmn:DataInput':
  case 'bpmn:DataOutput': {
    return elementCategories[4];
  }
  default: {
    return elementCategories[5];
  }
  }
}

export default class ElementIdDisplayer extends BaseRenderer {
  constructor(eventBus, canvas, bpmnRenderer, textRenderer) {
    super(eventBus, HIGH_PRIORITY);
    this.canvas = canvas;
    this.bpmnRenderer = bpmnRenderer;
    this.textRenderer = textRenderer;
    this.showIds = false;
    this.elementTypesToShow = new Set();

    this._loadSettingsFromLocalStorage();
    this._addToggleControl(eventBus);
  }

  canRender(element) {
    return is(element, 'bpmn:BaseElement') && !element.labelTarget;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    if (element.type === 'label' || element.labelTarget || !this.showIds || !this._shouldShowId(element)) {
      return shape;
    }

    const text = svgCreate('text');
    text.textContent = element.id;
    text.setAttribute('font-size', '12px');
    text.setAttribute('fill', '#0000ff');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('x', element.width / 2);
    text.setAttribute('y', -5);

    svgAppend(parentNode, text);

    return shape;
  }

  drawConnection(parentNode, element) {
    const connection = this.bpmnRenderer.drawConnection(parentNode, element);

    if (element.type === 'label' || element.labelTarget || !this.showIds || !this._shouldShowId(element)) {
      return connection;
    }

    const text = svgCreate('text');
    text.textContent = element.id;
    text.setAttribute('font-size', '12px');
    text.setAttribute('fill', '#0000ff');
    text.setAttribute('text-anchor', 'middle');

    const mid = this.getMidPoint(element.waypoints);
    text.setAttribute('x', mid.x);
    text.setAttribute('y', mid.y - 5);

    svgAppend(parentNode, text);

    return connection;
  }

  getMidPoint(waypoints) {
    const midIndex = Math.floor(waypoints.length / 2);
    const start = waypoints[midIndex - 1];
    const end = waypoints[midIndex];
    const mid = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
    return mid;
  }

  _addToggleControl(eventBus) {
    const container = document.createElement('div');
    container.id = 'toggle-container';
    container.style.position = 'absolute';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.width = '150px';
    container.style.background = '#fff';
    container.style.border = '1px solid #ccc';
    container.style.padding = '10px';
    container.style.zIndex = 1000;
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    const showIdsContainer = document.createElement('div');
    showIdsContainer.style.display = 'flex';
    showIdsContainer.style.alignItems = 'center';
    showIdsContainer.style.cursor = 'pointer';

    const showIdsCheckbox = document.createElement('input');
    showIdsCheckbox.type = 'checkbox';
    showIdsCheckbox.id = 'toggle-ids';
    showIdsCheckbox.checked = this.showIds;

    const showIdsLabel = document.createElement('label');
    showIdsLabel.setAttribute('for', 'toggle-ids');
    showIdsLabel.textContent = 'Show IDs';

    showIdsContainer.appendChild(showIdsCheckbox);
    showIdsContainer.appendChild(showIdsLabel);
    container.appendChild(showIdsContainer);

    const additionalControlsContainer = document.createElement('div');
    additionalControlsContainer.style.flexDirection = 'column';
    additionalControlsContainer.style.marginTop = '10px';
    additionalControlsContainer.style.display = this.showIds ? 'flex' : 'none';


    elementCategories.forEach(category => {
      const categoryCheckbox = document.createElement('input');
      categoryCheckbox.type = 'checkbox';
      categoryCheckbox.id = `toggle-${category.type}`;
      categoryCheckbox.checked = this.elementTypesToShow.has(category.type);

      const categoryLabel = document.createElement('label');
      categoryLabel.setAttribute('for', `toggle-${category.type}`);
      categoryLabel.textContent = category.label;

      categoryCheckbox.addEventListener('change', () => {
        if (categoryCheckbox.checked) {
          this.elementTypesToShow.add(category.type);
        } else {
          this.elementTypesToShow.delete(category.type);
        }
        this._saveSettingsToLocalStorage();
        this._updateDiagram(eventBus);
      });

      additionalControlsContainer.appendChild(this._createCheckboxLabelPair(categoryCheckbox, categoryLabel));
    });

    container.appendChild(additionalControlsContainer);

    document.body.appendChild(container);

    showIdsCheckbox.addEventListener('change', () => {
      this.showIds = showIdsCheckbox.checked;
      additionalControlsContainer.style.display = this.showIds ? 'flex' : 'none';
      this._saveSettingsToLocalStorage();
      this._updateDiagram(eventBus);
    });

    container.addEventListener('mouseenter', () => {
      additionalControlsContainer.style.display = 'flex';
    });

    container.addEventListener('mouseleave', () => {
      additionalControlsContainer.style.display = this.showIds ? 'flex' : 'none';
    });
  }

  _createCheckboxLabelPair(checkbox, label) {
    const pairContainer = document.createElement('div');
    pairContainer.style.display = 'flex';
    pairContainer.style.alignItems = 'center';
    pairContainer.style.marginBottom = '5px';

    pairContainer.appendChild(checkbox);
    pairContainer.appendChild(label);

    return pairContainer;
  }

  _shouldShowId(element) {
    const category = categorizeBpmnElement(element.type);
    return this.elementTypesToShow.has(category.type);
  }

  _updateDiagram(eventBus) {
    const allElements = this._getAllElements();
    eventBus.fire('elements.changed', { elements: allElements });
  }

  _getAllElements() {
    const elements = [];
    const rootElements = this.canvas.getRootElement().children;

    function collectElements(element) {
      elements.push(element);
      if (element.children) {
        element.children.forEach(collectElements);
      }
    }

    rootElements.forEach(collectElements);
    return elements;
  }

  _loadSettingsFromLocalStorage() {
    const showIds = localStorage.getItem('showIds');
    if (showIds !== null) {
      this.showIds = JSON.parse(showIds);
    }

    const elementTypesToShow = localStorage.getItem('elementTypesToShow');
    if (elementTypesToShow !== null) {
      this.elementTypesToShow = new Set(JSON.parse(elementTypesToShow));
    }
  }

  _saveSettingsToLocalStorage() {
    localStorage.setItem('showIds', JSON.stringify(this.showIds));
    localStorage.setItem('elementTypesToShow', JSON.stringify(Array.from(this.elementTypesToShow)));
  }
}

ElementIdDisplayer.$inject = [ 'eventBus', 'canvas', 'bpmnRenderer', 'textRenderer' ];
