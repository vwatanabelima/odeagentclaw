const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * AutoResearch Iteration Helper
 * 
 * Usage: node iteration_helper.js --cmd "npm run test" --metric "accuracy" --direction "maximize"
 */

function parseArgs() {
    const args = {};
    for (let i = 2; i < process.argv.length; i += 2) {
        const key = process.argv[i].replace('--', '');
        const val = process.argv[i + 1];
        args[key] = val;
    }
    return args;
}

function runVerification(cmd, metricKey) {
    try {
        const output = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
        
        // Try to parse the output as JSON
        let metricValue = null;
        try {
            const data = JSON.parse(output);
            metricValue = data[metricKey] || null;
        } catch (e) {
            // Not JSON, try regex search for "metricKey: [value]" or "metricKey = [value]"
            const regex = new RegExp(`${metricKey}[:=]\\s*([0-9.]+)`, 'i');
            const match = output.match(regex);
            if (match) {
                metricValue = parseFloat(match[1]);
            } else {
                // Try finding any number in the output if it's the only thing there
                const lastLine = output.trim().split('\n').pop();
                metricValue = parseFloat(lastLine);
            }
        }

        if (isNaN(metricValue) || metricValue === null) {
            return { success: false, error: `Could not extract metric "${metricKey}" from output.`, output };
        }

        return { success: true, metricValue, output };
    } catch (e) {
        return { success: false, error: e.message, stderr: e.stderr?.toString() };
    }
}

const args = parseArgs();
const { cmd, metric, direction = 'minimize' } = args;

if (!cmd || !metric) {
    console.log(JSON.stringify({ 
        success: false, 
        error: "Missing required arguments: --cmd and --metric" 
    }));
    process.exit(1);
}

const result = runVerification(cmd, metric);
console.log(JSON.stringify(result, null, 2));
