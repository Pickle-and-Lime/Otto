Git Workflow
============
  - Only Major Feature branches on the project repo
  - Sub-features should be branched on your personal fork

Getting Started
---------------
  1. Fork the Master
  2. `git clone https://github.com/YOUR_USERNAME/Rosie.git`
  3. `git remote add upstream https://github.com/Pickle-and-Lime/Rosie.git`
  4. `git checkout feat/FEATURE_TITLE`
    - or if the feature doesn't exist yet and for subfeatures: `git checkout -b feat/FEATURE_TITLE`
    
When preparing a pull Request
-----------------------------
  1. `git pull --rebase upstream feat/FEATURE_TITLE`
  2. `git pull --rebase upstream dev`
  3. `git push origin feat/FEATURE_TITLE`
  4. Pull request to feature branch on github.com

To contribute to the GitHub Pages documentation
----------------------------------------------------
1. After writing your documentation, rebase any recent changes from the main project repo: `git pull --rebase upstream dev`
2. Run `yuidoc .` from the root directory
2. Follow the first two steps ("Make a Fresh Clone", "Create a gh-pages branch") [here](https://help.github.com/articles/creating-project-pages-manually/) to create an orphan branch for your forked repo. Be sure to create your new clone in a separate directory from the main repo. Your file structure should now look something like:
```
.
+--Rosie
|   +--out
|   |   
|   +--api.js
|   +--assets
|   +--classes
|   +--data.json
|   +--elements
|   +--files
|   +--modules
|   +--index.html
|   |
|   +--package.json
|   +--server
|   +--client
|   +-- ....
+--rosie-docs
```
Here, the main repo is in `Rosie`, while the directory for the gh-pages branch is in `rosie-docs`.
2. Track the upstream gh-pages: `git remote add upstream https://github.com/Pickle-and-Lime/Rosie.git`.
3. Rebase the current documentation: `git pull --rebase upstream gh-pages`
4. Delete everything from the gh-pages directory: `git rm -rf .` 
3. Copy the files generated in the `out` directory of the main project into the gh-pages branch you created. Using the above file structure, this could be accomplished by running `cp -a out/ ../rosie-docs` from the root of the `Rosie` project.
5. `cd` back into the gh-pages directory. Commit, and push the copied documentation files. 
- `cd ../rosie-docs`.
- `git add .`
- `git commit -m "Add documentation"`
- `git push origin gh-pages`
5. Pull request to the gh-pages branch on github.com