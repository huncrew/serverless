/* From monorepo root
npx tsx tools/create-project.ts \
  --template sst-cognito \
  --name client-project \
  --env production
What the Script Does:

Copies templates/sst-cognito → clients/client-project

Replaces all template-name references with client-project

Installs dependencies

Initializes Amplify environment

Commits to new Git branch
*/