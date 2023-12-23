const fs = require('fs');
const path = require('path');

const testResultsPath = path.join(__dirname, 'testResults.json');

fs.readFile(testResultsPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading test results:', err);
        process.exit(1);
    }

    const results = JSON.parse(data);

    if (results.numFailedTests === 0) {
        console.log('All tests passed.');
        process.exit(0); // Success
    } else {
        console.error(`There are test failures. Failed tests count: ${results.numFailedTests}`);
        process.exit(1); // Failure
    }
});
