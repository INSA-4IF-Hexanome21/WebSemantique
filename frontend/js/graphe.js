document.addEventListener('DOMContentLoaded', () => {
  cytoscape({
    container: document.getElementById('graph-container'),

    elements: [
      { data: { id: 'a', label: 'A' } },
      { data: { id: 'b', label: 'B' } },
      { data: { source: 'a', target: 'b' } }
    ],

    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'background-color': '#0074D9'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#aaa'
        }
      }
    ],

    layout: {
      name: 'grid'
    }
  });
});
