/**
 * D3 Icon Registry
 * Vendor-themed, custom-drawn SVG primitives for renderer nodes.
 * Note: These are original icon drawings inspired by vendor color systems,
 * not copies of trademarked logos.
 */

const VENDOR_COLORS = {
  aws: {
    bg: '#FFF7E8',
    stroke: '#FF9900',
    glyph: '#232F3E'
  },
  azure: {
    bg: '#EAF6FF',
    stroke: '#0078D4',
    glyph: '#005A9E'
  },
  gcp: {
    bg: '#F1F8FE',
    stroke: '#1A73E8',
    glyph: '#188038'
  },
  ibm: {
    bg: '#EEF3FF',
    stroke: '#0F62FE',
    glyph: '#0043CE'
  },
  enterprise: {
    bg: '#F4F7FA',
    stroke: '#5E6A7D',
    glyph: '#2E3A4F'
  }
};

const SAMPLE_GEOMETRY = {
  compute: [
    { type: 'rect', x: -7.4, y: -7.4, width: 14.8, height: 14.8, rx: 1.8 },
    { type: 'rect', x: -4.1, y: -4.1, width: 8.2, height: 8.2, rx: 1.4 },
    { type: 'line', x1: -4.1, y1: -10.2, x2: -4.1, y2: -8.1 },
    { type: 'line', x1: 0, y1: -10.2, x2: 0, y2: -8.1 },
    { type: 'line', x1: 4.1, y1: -10.2, x2: 4.1, y2: -8.1 },
    { type: 'line', x1: -4.1, y1: 8.1, x2: -4.1, y2: 10.2 },
    { type: 'line', x1: 0, y1: 8.1, x2: 0, y2: 10.2 },
    { type: 'line', x1: 4.1, y1: 8.1, x2: 4.1, y2: 10.2 },
    { type: 'line', x1: -10.2, y1: -4.1, x2: -8.1, y2: -4.1 },
    { type: 'line', x1: -10.2, y1: 0, x2: -8.1, y2: 0 },
    { type: 'line', x1: -10.2, y1: 4.1, x2: -8.1, y2: 4.1 },
    { type: 'line', x1: 8.1, y1: -4.1, x2: 10.2, y2: -4.1 },
    { type: 'line', x1: 8.1, y1: 0, x2: 10.2, y2: 0 },
    { type: 'line', x1: 8.1, y1: 4.1, x2: 10.2, y2: 4.1 }
  ],
  storage: [
    { type: 'ellipse', cx: 0, cy: -6.4, rx: 7.2, ry: 2.6 },
    { type: 'path', d: 'M-7.2,-6.4 L-7.2,6.4 C-7.2,8 7.2,8 7.2,6.4 L7.2,-6.4' },
    { type: 'ellipse', cx: 0, cy: 6.4, rx: 7.2, ry: 2.6 },
    { type: 'ellipse', cx: 0, cy: -1.2, rx: 7.2, ry: 2.2 },
    { type: 'ellipse', cx: 0, cy: 3.2, rx: 7.2, ry: 2.2 }
  ],
  network: [
    { type: 'circle', cx: 0, cy: 0, r: 2.6 },
    { type: 'circle', cx: -8.1, cy: 8.1, r: 2.3 },
    { type: 'circle', cx: 8.1, cy: 8.1, r: 2.3 },
    { type: 'circle', cx: 8.1, cy: -8.1, r: 2.3 },
    { type: 'line', x1: -6.1, y1: 6.1, x2: -1.8, y2: 1.8 },
    { type: 'line', x1: 6.1, y1: 6.1, x2: 1.8, y2: 1.8 },
    { type: 'line', x1: 6.1, y1: -6.1, x2: 1.8, y2: -1.8 }
  ]
};

const ICON_DEFINITIONS = {
  aws: {
    compute: {
      vendor: 'aws',
      primitives: SAMPLE_GEOMETRY.compute
    },
    storage: {
      vendor: 'aws',
      primitives: SAMPLE_GEOMETRY.storage
    },
    network: {
      vendor: 'aws',
      primitives: SAMPLE_GEOMETRY.network
    },
    messaging: {
      vendor: 'aws',
      primitives: [
        { type: 'rect', x: -8, y: -5, width: 16, height: 10, rx: 2 },
        { type: 'polyline', points: '-8,-5 0,1 8,-5' },
        { type: 'line', x1: -8, y1: 5, x2: 8, y2: 5 }
      ]
    }
  },
  azure: {
    compute: {
      vendor: 'azure',
      primitives: SAMPLE_GEOMETRY.compute
    },
    storage: {
      vendor: 'azure',
      primitives: SAMPLE_GEOMETRY.storage
    },
    network: {
      vendor: 'azure',
      primitives: SAMPLE_GEOMETRY.network
    },
    messaging: {
      vendor: 'azure',
      primitives: [
        { type: 'path', d: 'M-8,4 L-8,-4 L0,-8 L8,-4 L8,4 L0,8 Z' },
        { type: 'line', x1: -8, y1: -4, x2: 8, y2: 4 },
        { type: 'line', x1: -8, y1: 4, x2: 8, y2: -4 }
      ]
    }
  },
  gcp: {
    compute: {
      vendor: 'gcp',
      primitives: SAMPLE_GEOMETRY.compute
    },
    storage: {
      vendor: 'gcp',
      primitives: SAMPLE_GEOMETRY.storage
    },
    network: {
      vendor: 'gcp',
      primitives: SAMPLE_GEOMETRY.network
    },
    messaging: {
      vendor: 'gcp',
      primitives: [
        { type: 'circle', cx: 0, cy: 0, r: 7 },
        { type: 'path', d: 'M-3,3 L-3,-3 L3,0 Z' }
      ]
    }
  },
  ibm: {
    compute: {
      vendor: 'ibm',
      primitives: SAMPLE_GEOMETRY.compute
    },
    storage: {
      vendor: 'ibm',
      primitives: SAMPLE_GEOMETRY.storage
    },
    network: {
      vendor: 'ibm',
      primitives: SAMPLE_GEOMETRY.network
    },
    messaging: {
      vendor: 'ibm',
      primitives: [
        { type: 'rect', x: -8, y: -6, width: 16, height: 12, rx: 2 },
        { type: 'line', x1: -8, y1: 0, x2: 8, y2: 0 },
        { type: 'circle', cx: -4, cy: 3, r: 1.2 },
        { type: 'circle', cx: 0, cy: 3, r: 1.2 },
        { type: 'circle', cx: 4, cy: 3, r: 1.2 }
      ]
    }
  },
  enterprise: {
    compute: {
      vendor: 'enterprise',
      primitives: SAMPLE_GEOMETRY.compute
    },
    gateway: {
      vendor: 'enterprise',
      primitives: [
        { type: 'path', d: 'M-8,0 L-2,-6 L2,-6 L8,0 L2,6 L-2,6 Z' },
        { type: 'line', x1: -2, y1: -2, x2: 2, y2: -2 },
        { type: 'line', x1: -2, y1: 2, x2: 2, y2: 2 }
      ]
    },
    queue: {
      vendor: 'enterprise',
      primitives: [
        { type: 'rect', x: -8, y: -7, width: 16, height: 4, rx: 1 },
        { type: 'rect', x: -8, y: -1, width: 16, height: 4, rx: 1 },
        { type: 'rect', x: -8, y: 5, width: 16, height: 4, rx: 1 }
      ]
    },
    service: {
      vendor: 'enterprise',
      primitives: [
        { type: 'circle', cx: 0, cy: 0, r: 6 },
        { type: 'line', x1: 0, y1: -9, x2: 0, y2: -6 },
        { type: 'line', x1: 9, y1: 0, x2: 6, y2: 0 },
        { type: 'line', x1: 0, y1: 9, x2: 0, y2: 6 },
        { type: 'line', x1: -9, y1: 0, x2: -6, y2: 0 }
      ]
    },
    database: {
      vendor: 'enterprise',
      primitives: SAMPLE_GEOMETRY.storage
    },
    storage: {
      vendor: 'enterprise',
      primitives: SAMPLE_GEOMETRY.storage
    },
    cache: {
      vendor: 'enterprise',
      primitives: [
        { type: 'rect', x: -7, y: -7, width: 14, height: 14, rx: 3 },
        { type: 'path', d: 'M-4,-1 C-4,-4 4,-4 4,-1 C4,1 -4,1 -4,3 C-4,5 4,5 4,2' }
      ]
    },
    network: {
      vendor: 'enterprise',
      primitives: SAMPLE_GEOMETRY.network
    }
  }
};

function pickVendor(component = {}) {
  const source = [
    component.type,
    component.name,
    component.metadata?.title,
    component.metadata?.description,
    component.metadata?.metadata?.vendor,
    component.metadata?.metadata?.provider,
    component.metadata?.metadata?.cloud
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/\b(aws|ec2|lambda|s3|rds|sns|sqs|dynamodb|eks)\b/.test(source)) return 'aws';
  if (/\b(azure|aks|cosmos|blob|event hub|service bus|functions)\b/.test(source)) return 'azure';
  if (/\b(gcp|google|gke|cloud run|pubsub|bigquery|spanner)\b/.test(source)) return 'gcp';
  if (/\b(ibm|cloudant|watson|mq|openshift)\b/.test(source)) return 'ibm';
  return 'enterprise';
}

function pickService(component = {}) {
  const source = [
    component.type,
    component.name,
    component.metadata?.title,
    component.metadata?.description
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/\b(gateway|ingress|api)\b/.test(source)) return 'gateway';
  if (/\b(queue|topic|pubsub|event|message|messaging|bus)\b/.test(source)) return 'messaging';
  if (/\b(db|database|sql|nosql|store|storage|bucket)\b/.test(source)) return 'storage';
  if (/\b(cache|redis|mem)\b/.test(source)) return 'cache';
  if (/\b(network|vpc|lb|load balancer|dns)\b/.test(source)) return 'network';
  if (/\b(service|worker|processor|compute|function|api)\b/.test(source)) return 'compute';
  return 'service';
}

export function resolveIconDefinition(component = {}) {
  const vendor = pickVendor(component);
  const service = pickService(component);

  const vendorSet = ICON_DEFINITIONS[vendor] || ICON_DEFINITIONS.enterprise;
  const fallbackSet = ICON_DEFINITIONS.enterprise;

  const icon =
    vendorSet[service] ||
    fallbackSet[service] ||
    fallbackSet.service;

  const palette = VENDOR_COLORS[icon.vendor] || VENDOR_COLORS.enterprise;

  return {
    palette,
    primitives: icon.primitives
  };
}

export function createNodeIcon(svgDocument, x, y, component) {
  const { palette, primitives } = resolveIconDefinition(component);

  const group = svgDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('transform', `translate(${x},${y})`);
  group.setAttribute('pointer-events', 'none');

  const badge = svgDocument.createElementNS('http://www.w3.org/2000/svg', 'circle');
  badge.setAttribute('cx', '0');
  badge.setAttribute('cy', '0');
  badge.setAttribute('r', '11');
  badge.setAttribute('fill', palette.bg);
  badge.setAttribute('stroke', palette.stroke);
  badge.setAttribute('stroke-width', '1.5');
  group.appendChild(badge);

  primitives.forEach((primitive) => {
    const shape = svgDocument.createElementNS('http://www.w3.org/2000/svg', primitive.type);

    Object.entries(primitive).forEach(([key, value]) => {
      if (key !== 'type') {
        shape.setAttribute(key, String(value));
      }
    });

    if (!shape.getAttribute('fill')) {
      shape.setAttribute('fill', primitive.type === 'path' || primitive.type === 'line' || primitive.type === 'polyline' ? 'none' : palette.glyph);
    }

    if (!shape.getAttribute('stroke')) {
      shape.setAttribute('stroke', palette.glyph);
    }

    if (!shape.getAttribute('stroke-width')) {
      shape.setAttribute('stroke-width', '1.4');
    }

    shape.setAttribute('stroke-linecap', 'round');
    shape.setAttribute('stroke-linejoin', 'round');
    group.appendChild(shape);
  });

  return group;
}
