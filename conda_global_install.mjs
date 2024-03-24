#!/usr/bin/env zx

// Set verbose mode to false.
$.verbose = false;

let packages;
if (process.argv.length > 3) {
    packages = [...process.argv.slice(3)];
}

try {
    const { stdout: output } = await $`conda env list | awk 'NR > 2 {print $1}'`;
    const envs = output.trim().split('\n');

    for (const env of envs) {
        for (const pkg of packages) {
            await $`conda run --name ${env} pip install ${pkg}`;
            console.log(chalk.green(`Package ${pkg} installed successfully on ${env} environment.`));
        }
    }
} catch (err) {
    console.log(chalk.red(`An error occurred while installing the packages. \n${err.stderr}`));
}
