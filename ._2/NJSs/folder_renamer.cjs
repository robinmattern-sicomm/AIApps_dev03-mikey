const fs = require('fs');
const path = require('path');

// Define the replacement mappings
const replacements = {
  '{Cust}': 'Robin',
  '{Proj}': 'AI-Session',
  '{cc###s}': 'rm228p',
  '{SvNNNs}': 'rm228p',
  '{stg##}': 'dev02',
  '{Stg##}': 'dev02',
  '{StgN}':  'dev02',
  '{Ownr}':  'robin',
  '{owner}': 'robin',
  '{Owner}': 'robin',
  'vYMMDD': 'v50530'
};

function renameFolder(oldPath, newName) {
  const parentDir = path.dirname(oldPath);
  const newPath = path.join(parentDir, newName);
  
  try {
    fs.renameSync(oldPath, newPath);
    console.log(`✓ Renamed: "${path.basename(oldPath)}" → "${newName}"`);
    return newPath;
  } catch (error) {
    console.error(`✗ Failed to rename "${path.basename(oldPath)}": ${error.message}`);
    return oldPath;
  }
}

function applyReplacements(folderName) {
  let newName = folderName;
  
  // Apply each replacement
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    newName = newName.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
  }
  
  return newName;
}

function renameFoldersRecursively(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    // Process folders in reverse order to handle nested structures properly
    const folders = items.filter(item => {
      const itemPath = path.join(dirPath, item);
      return fs.statSync(itemPath).isDirectory();
    }).reverse();
    
    for (const folderName of folders) {
      const currentPath = path.join(dirPath, folderName);
      const newName = applyReplacements(folderName);
      
      if (newName !== folderName) {
        const newPath = renameFolder(currentPath, newName);
        // Recursively process the renamed folder
        renameFoldersRecursively(newPath);
      } else {
        // Process subfolders even if current folder wasn't renamed
        renameFoldersRecursively(currentPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory "${dirPath}": ${error.message}`);
  }
}

// Main execution
function main() {
  const targetDirectory = process.argv[2] || '.';
  
  console.log('Folder Renaming Script');
  console.log('====================');
  console.log(`Target directory: ${path.resolve(targetDirectory)}`);
  console.log('\nReplacements:');
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    console.log(`  ${placeholder} → ${replacement}`);
  }
  console.log('\nProcessing folders...\n');
  
  if (!fs.existsSync(targetDirectory)) {
    console.error(`Error: Directory "${targetDirectory}" does not exist.`);
    process.exit(1);
  }
  
  renameFoldersRecursively(targetDirectory);
  console.log('\n✅ Folder renaming completed!');
}

// Run the script
main();