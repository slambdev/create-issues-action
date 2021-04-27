const Octokit = require("@octokit/rest");
const core = require('@actions/core');
const github = require('@actions/github');

const labels = [
    { name: "Low risk", color: "3CD616" },
    { name: "Medium risk", color: "FFCE33" },
    { name: "High risk", color: "FF3C33" },
    { name: "Draft", color: "B316D6" }
];

(async() => {
    const ibmGitHubToken = core.getInput('gh_ibm_token');
    const zenHubToken = core.getInput('zenhub_ibm_apikey');
    const newCoGitHubToken = core.getInput('gh_token'); // GITHUB_TOKEN
    const context = github.context;

    const newCoOctokit = github.getOctokit(newCoGitHubToken);

    core.info("Successfully initialized NewCo GH Client");

    await Promise.all(labels.map(async (label) => {
        try {
            await newCoOctokit.issues.createLabel({
                // owner: context.repo.owner,
                // repo: context.repo.repo,
                ...context.repo,
                name: label.name,
                color: label.color,
            });
            core.info("Successfully created label", label);
            core.info("------------------------------------");
        } catch (error) {
            core.warn("Failed to create label with error", {
                error,
                label: label.name,
                color: label.color,
            });
            core.info("------------------------------------");
        }
    }));

    core.info('Finished creating labels!');
    process.exit(0);
})().catch(core.error);
