Install VS code(https://code.visualstudio.com/download)if not installed alraedy 
Optional:Install playwright from extension icon on the left hand side 
Clone the folder using url:https://github.com/Parnshresth/Open-EMR.git
To execute test use code :npx playwright test
Write code using bash npm install
npx playwright test
Under that create "Tests" folder (openEMR.spec.js)
[Playwright Docs](https://playwright.dev)
https://github.com/Parnshresth/Open-EMR.git

├── .github/workflows/playwright.yml   # (https://github.com/Parnshresth/Open-EMR.git)
├── playwright.config.js               # (playwright.config.js)
├── package.json                       # (package.json)
├── package-lock.json                  # (package-lock.json)
├── tests/                             # Test files
│   ├── openEMR.spec.js                # (tests/openEMR.spec.js)
│   ├── example.spec.js                # (tests/example.spec.js)
├── tests-examples/                    # (tests-examples)
│   └── demo-todo-app.spec.js          # (tests-examples/demo-todo-app.spec.js)
