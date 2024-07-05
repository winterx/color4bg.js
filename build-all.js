// const { execSync } = require('child_process');
import { execSync } from 'child_process';


const components = [
  'aesthetic-fluid-bg',
  'abstract-shape-bg',
  'blur-dot-bg',
  'blur-gradient-bg',
  'triangles-mosaic-bg',
  'wavy-waves-bg',
  'random-cubes-bg',
  'big-blob-bg'
];

components.forEach(component => {
  console.log(`Building ${component}...`);
  execSync(`COMPONENT=${component} rollup -c`, { stdio: 'inherit' });
  console.log(`${component} built successfully.`);
});