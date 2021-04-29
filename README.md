# GitHub Actions with Typescript

Currently, GitHub Actions do not support actions within actions. This means for Typescript projects where you need to compile your code into NodeJs and then run it can be done in workflows (i.e. a series of actions), but not in a single shareable action.

The implications of this means if you wish to share a GitHub action, the compiled code for the action must be merged into a single file and checked into GitHub or you have to use Docker.

## Approach 1: ncc compile to single file

[`ncc`](https://github.com/vercel/ncc) is a CLI tool used to compile your NodeJs files, including all of its dependencies, into a single file.

**1. Add `ncc` to your build step**

  Install the `ncc` package to your repository with the following command:

  ```bash
  npm i @vercel/ncc --save-dev
  ```

  Add the followinng to your compile step (this assumes your main Tyepscript file is `main.ts`).

  ```bash
  ncc build src/main.ts --minify
  ```

  The above command will add the compiled file to `dist/index.js`. This file will need to be committed to your main branch.

**2. Add an action.yml file**

 Add a file to your root directory called `action.yml`. Within the file, you will define your GitHub action. Under the `runs` field, you will stipulate that the action uses node and point to the compiled file generated in the previous step.

 ```yml
 # action.yml
 name: 'Insert name'
 description: 'Insert a nice friendly description'
 inputs:
   # Add any necessary inputs for your action.
    # Example: GitHub Token
    gh_token:
      description: 'GitHub Token'
      required: true
 runs:
   using: 'node12'
   main: 'dist/index.js'
 ```

**3. Release your action**

  At this point, your action is ready to be shared! To share your action, you need to [create a new release for your repository](https://docs.github.com/en/github/administering-a-repository/managing-releases-in-a-repository).

### Upsides

- This approach is simple. It's another npm module you need to install, and does not require knowledge in other technology.

### Downsides

- You have to check in your compiled code into GitHub
- Everytime you make a change to your repository, you need to remember to update the dist file
  - This can be mitigated by setting up a GitHub Action on push. An example of how this can be done can be found [here](https://ankri.de/github-action-workflow/)
- If you have a complicated GitHub action that requires multiple dependencies, your singular compiled file will get HUGE.

## Approach 2: Docker

General instructions on how to setup a GitHub action with Docker can be found [here](https://docs.github.com/en/actions/creating-actions/creating-a-docker-container-action).

For a Typescript project, we need to do the following to setup your GitHub action using Docker:

**1. Add a Dockerfile**

  Add the following contents to your Dockerfile. This will set the builder to node (you are welcome to use any version you would like) and copy all of the files in your directory to the `/` directory in the Docker volume. Afterwards, it will run a file called `entrypoint.sh` which we will add in the next step.
  
  ```dockerfile
    FROM node:14-alpine

    COPY . /

    RUN chmod +x /entrypoint.sh

    ENTRYPOINT [ "/entrypoint.sh" ]
  ```

  Note: If you already have a Dockerfile, be aware that using `WORKDIR` will no longer work. Reference [GitHub's docs on using `WORKDIR`](https://docs.github.com/en/actions/creating-actions/dockerfile-support-for-github-actions#workdir).

**2. Add a entrypoint.sh file**

  Add a file called `entrypoint.sh` with the below contents. This is the file that the Dockerfile in the previous step references.

  ```bash
  #!/bin/sh -l
  cd /
  npm ci --only=production
  npm run build
  npm start
  ```

  The above file is very barebones. If you have any special build steps required for your code to run, you will want to add them to this file before running your code with `npm start`.

**3. Add an action.yml file**

  Add a file to your root directory called `action.yml`. Within the file, you will define your GitHub action. Under the `runs` field, you will stipulate that the action uses docker and point to the Dockerfile added in step 1.

  ```yml
  # action.yml
  name: 'Insert name'
  description: 'Insert a nice friendly description'
  inputs:
    # Add any necessary inputs for your action.
    # Example: GitHub Token
    gh_token:
      description: 'GitHub Token'
      required: true
  runs:
    using: 'docker'
    image: 'Dockerfile'
  ```

**4. Release your action**

  At this point, your action is ready to be shared! To share your action, you need to [create a new release for your repository](https://docs.github.com/en/github/administering-a-repository/managing-releases-in-a-repository).

### Upsides

- You don't have to commit your node_modules or compiled code into GitHub
- You can do just about anything using Docker. If you have a complicated build or running process, Docker ensures you have a standardized environment for you to run your processes in (this is literally what Docker is meant for)

### Downsides

- You need to know a little bit of Docker

## Automating releases

An important note to make is that whennever you make a code chagne to your action and wish to share this channge out to anyone who is consuming your action, you will need to create a release for the change.

GitHub has provided an example of how you can automate your release process with GitHub Actions.

[https://github.com/actions/create-release](https://github.com/actions/create-release)

Though the above repository is marked as unmaintainned, it provides a good foundation for how you can setup your own release with GitHub Actions. Other examples of GitHub Actions that automate releases have been shared as well and can be found linked in the above repository.

## Summary

GitHub is aware of the need to use actions within actions and is striving to deliver this feature. You can track GitHub's progress in the following issue:

[https://github.com/actions/runner/issues/646](https://github.com/actions/runner/issues/646)

I recommend also reading through the following issue that originally brought up this feature request here:

[https://github.com/actions/runner/issues/438](https://github.com/actions/runner/issues/438)
