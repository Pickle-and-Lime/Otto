Getting Started
===============
Run these commands within the project root directory
----------------------------------------------------
   1. `npm install`
   2. `gulp` -this will install remaining dependencies and generate documentation
   3. `gulp development` - Runs the development environment and opens the browser; if the page does not load correctly, try refreshing 
   4. `gulp pre-prod` - Runs the production environment and opens the browser; if the page does not load correctly, try refreshing

To view the documentation
----------------------------------------------------
   1. Open `out/index.html` in the browser 

To edit the documentation in real time
----------------------------------------------------
   1. Run `yuidoc . --server` from the root directory
   2. Navigate to `http://127.0.0.1:3000/`
   3. Refer to the [YUIDoc Syntax Reference](http://yui.github.io/yuidoc/syntax/index.html) to add to the documentation
   4. Refresh the browser to view changes
