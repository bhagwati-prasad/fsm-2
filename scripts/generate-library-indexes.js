const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');

const targets = [
  {
    definitionsDir: path.join(workspaceRoot, 'src/core/component-library/definitions'),
    aggregateName: 'defaultComponentDefinitions'
  },
  {
    definitionsDir: path.join(workspaceRoot, 'src/core/composite-library/definitions'),
    aggregateName: 'defaultCompositeDefinitions'
  }
];

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function getDefinitionFiles(definitionsDir) {
  return fs
    .readdirSync(definitionsDir)
    .filter((name) => name.endsWith('.js') && name !== 'index.js')
    .sort((a, b) => a.localeCompare(b));
}

function getExportName(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const exportMatch = fileContent.match(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=/);
  if (!exportMatch) {
    throw new Error(`No exported const definition found in ${toPosixPath(filePath)}`);
  }

  return exportMatch[1];
}

function generateIndexFile(definitionsDir, aggregateName) {
  const definitionFiles = getDefinitionFiles(definitionsDir);

  const definitions = definitionFiles.map((fileName) => {
    const absolutePath = path.join(definitionsDir, fileName);
    const exportName = getExportName(absolutePath);
    const importPath = `./${fileName.replace(/\.js$/, '')}`;
    return { exportName, importPath };
  });

  const importLines = definitions.map(
    ({ exportName, importPath }) => `import { ${exportName} } from '${importPath}';`
  );

  const aggregateLines = [
    `export const ${aggregateName} = [`,
    ...definitions.map(({ exportName }) => `  ${exportName},`),
    '];'
  ];

  const indexContent = `${importLines.join('\n')}\n\n${aggregateLines.join('\n')}\n`;
  const indexPath = path.join(definitionsDir, 'index.js');
  fs.writeFileSync(indexPath, indexContent, 'utf8');

  return {
    indexPath,
    count: definitions.length
  };
}

function main() {
  const results = targets.map(({ definitionsDir, aggregateName }) =>
    generateIndexFile(definitionsDir, aggregateName)
  );

  results.forEach(({ indexPath, count }) => {
    console.log(`Updated ${toPosixPath(indexPath)} with ${count} definitions`);
  });
}

main();
