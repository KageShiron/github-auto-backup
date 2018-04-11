
const fetch = require('node-fetch');
const sleep = require('sleep');
const execSync = require('child_process').execSync;
const fs = require('fs');

fs.mkdirSync("repos");
fs.mkdirSync("tar");
process.chdir("repos");

const username = process.env.USERNAME;
const token = process.env.TOKEN;
const uploadUrl = process.env.UPLOAD_URL;
const mode = process.env.BACKUP_MODE
const now = new Date();
const tarFilePath = "../tar";

let log = `# Log ${now.toISOString()}
${uploadUrl}

`;

(async function () {
    try {
        const res = await fetch("https://api.github.com/user/repos", {
            headers: {
                "content-type": "application/json",
                "Accept": "application/vnd.github.v3+json",
                "Authorization": `Bearer ${token}`
            }
        });
        const json = await res.json();

        for (let x of json) {
            if (mode === "all" || now.getDate() <= 7 || (now.getTime() - Date.parse(x.pushed_at)) / (1000 * 60 * 60 * 24) <= 8) {
                const url = x.clone_url.replace("https://github.com/", `https://${username}:${token}@github.com/`);
                execSync(`git clone --mirror ${url} > /dev/null 2>&1`);
                log += `Clone ${x.clone_url}\n  `
                console.log(`Clone ${x.name[0]}...`);
                sleep.sleep(5);
            }
        }

        console.log("Start tar");
        log += "\n\n##Tar and post"

        const repos = fs.readdirSync(".");
        for (const r of repos) {
            const tarFile = `${tarFilePath}/${r}`;
            execSync(`tar cvjf "${tarFile}" "${r}" > /dev/null 2>&1`);
            const stats = fs.statSync(tarFile);
            const uploadRepoUrl = uploadUrl.replace("{FileName}", r + ".tar.bz2");
            const fileSizeInBytes = stats.size;
            log += `${r} (${(fileSizeInBytes / 1000).toFixed(0)}KB)`;
            const res = await fetch(uploadRepoUrl, {
                method: 'POST',
                headers: {
                    "Content-length": fileSizeInBytes
                },
                body: fs.createReadStream(tarFile)
            });
            log += " ... " + res.status + "  \n";
        }
    } finally {
        const uploadRepoUrl = uploadUrl.replace("{FileName}", "log.md");
        const res = fetch(uploadRepoUrl, {
            method: 'POST',
            body: log
        });
    }
})();