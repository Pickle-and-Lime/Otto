# Git Workflow #
  # Only Major Feature branches on the project repo #
  # Sub-features should be branched on your personal fork #

  > Fork the Master
  > git clone //your fork's url
  > git remote add upstream https://github.com/Pickle-and-Lime/Rosie.git
  > git checkout feat/FEATURE_TITLE
    >or if the feature doesn't exist yet: git checkout -b feat/FEATURE_TITLE
# When preparing a pull Request #
  > git pull --rebase upstream feat/FEATURE_TITLE
  > git pull --rebase upstream dev
  > git push origin feat/FEATURE_TITLE
  > Pull request to feature branch on github.com