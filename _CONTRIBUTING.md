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
