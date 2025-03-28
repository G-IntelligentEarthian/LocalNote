/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import ghpages from 'gh-pages';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom deployment script for GitHub Pages
async function deploy() {
  try {
    // Build the app
    console.log('Building the app...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create a temp directory for deployment
    const tempDir = path.join(process.cwd(), 'tmp_deploy');
    console.log(`Preparing deployment in ${tempDir}...`);
    
    // Clean up temp directory
    await fs.emptyDir(tempDir);
    
    // Copy build files
    console.log('Copying build files...');
    await fs.copy('dist', tempDir, { overwrite: true });
    
    // Add .nojekyll file
    await fs.writeFile(path.join(tempDir, '.nojekyll'), '');
    
    // Deploy directly using gh-pages npm package
    console.log('Deploying to GitHub Pages...');
    
    // Use the ghpages module directly
    await new Promise((resolve, reject) => {
      ghpages.publish(tempDir, {
        dotfiles: true,
        message: 'Deploy to GitHub Pages [ci skip]',
        history: false,  // Overwrite history completely
        branch: 'gh-pages'
      }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    
    console.log('✅ Deployment complete!');
    console.log('Visit: https://g-intelligentearthian.github.io/LocalNote_Browser/');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    console.error(error.toString());
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

// Run the deployment
deploy(); 