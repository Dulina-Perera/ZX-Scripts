#!/usr/bin/env zx

// Set verbose mode to false
$.verbose = false;

try {
    // Check if the current directory is a git repository.
    await $`git rev-parse --git-dir`;
} catch (err) {
    if (err.stderr.includes('not a git repository')) {
        // If not a git repository, display an error message in red.
        console.log(chalk.red('This is not a git repository.'));
        process.exit(1);
    }
    // If some other error occurs, re-throw the error.
    throw err;
}

// Retrieve the git log and store it in the 'log' variable.
const { stdout: log } = await $`git log --name-only`;

// Split the log into individual commits and extract relevant information.
const commits = log.split('\ncommit').map((commit) => {
    const [hash, author, date, _1, message, _2, ...files] = commit.split('\n');

    return {
        hash: hash?.trim(),
        author: author?.split(': ')[1]?.split(' <')[0]?.trim(),
        date: date?.split(':')[1]?.trim(),
        message: message?.trim(),
        files,
    };
});

// Count the occurrences of each file and display the top 10 most frequent files.
const { stdout: file_counts } = await $`echo ${commits.map((commit) => commit.files.filter(file => file !== '').join('\n')).join('\n')} | sort | uniq --count | sort --numeric-sort --reverse | head --lines 10`;

// Split the output into lines and map each line to an object with 'count' and 'file' properties.
const files = file_counts.trim().split('\n').map(line => {
    const [count, ...fileParts] = line.trim().split(' ');
    const file = fileParts.join(' ');
    return { count, file };
});

// Print a header.
console.log('Count | File');
console.log('------|-----');

// Print each file and its count in a formatted way.
files.forEach(({ count, file }) => {
    console.log(`${count.padStart(5, ' ')} | ${file}`);
});
