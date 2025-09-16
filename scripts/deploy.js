#!/usr/bin/env node

/**
 * Deployment script for Client Sphere CRM
 * This script helps prepare the application for deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    console.error(error.message);
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} exists`, 'green');
    return true;
  } else {
    log(`❌ ${description} missing`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Client Sphere CRM Deployment Preparation', 'cyan');
  log('===========================================', 'cyan');

  // Pre-deployment checks
  log('\n📋 Pre-deployment Checks', 'magenta');
  let allChecksPass = true;

  // Check for required files
  const requiredFiles = [
    { path: '.env.example', desc: 'Environment example file' },
    { path: 'package.json', desc: 'Package.json' },
    { path: 'next.config.mjs', desc: 'Next.js config' },
    { path: 'prisma/schema.prisma', desc: 'Prisma schema' },
    { path: '.eslintrc.json', desc: 'ESLint configuration' },
  ];

  requiredFiles.forEach(file => {
    if (!checkFile(file.path, file.desc)) {
      allChecksPass = false;
    }
  });

  // Check if .env exists
  if (!checkFile('.env', 'Environment file (.env)')) {
    log('⚠️  Create .env file from .env.example before deploying', 'yellow');
  }

  if (!allChecksPass) {
    log('\n❌ Some required files are missing. Please fix these issues before deploying.', 'red');
    process.exit(1);
  }

  // Install dependencies
  if (!runCommand('npm ci', 'Installing dependencies')) {
    process.exit(1);
  }

  // Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    process.exit(1);
  }

  // Run linting
  log('\n🔍 Running code quality checks', 'magenta');
  runCommand('npm run lint', 'Linting code');

  // Build the application
  if (!runCommand('npm run build', 'Building application for production')) {
    log('\n❌ Build failed. Please fix the build errors before deploying.', 'red');
    process.exit(1);
  }

  // Test the build
  log('\n🧪 Testing production build', 'magenta');
  log('You can test the production build locally by running:', 'yellow');
  log('npm run start', 'cyan');

  log('\n✅ Deployment preparation completed successfully!', 'green');
  log('\n📚 Next steps:', 'magenta');
  log('1. Choose your deployment platform (Vercel, Netlify, etc.)', 'yellow');
  log('2. Set up environment variables on your platform', 'yellow');
  log('3. Connect your repository and deploy', 'yellow');
  log('4. Set up your production database', 'yellow');
  log('\nSee DEPLOYMENT.md for detailed instructions.', 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, checkFile, log };