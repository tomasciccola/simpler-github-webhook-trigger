# simpler github workflow webhook trigger
This proxy allows triggering a github workflow from enviroments where one can set up a webhook but without the ability to set a request body (f.e. a notion button), since github expects as a minimum a body of `{event_type: job_name}`.

Its made as a fly.io service so to deploy it one can just clone the repo and run
```bash
flyctl deploy --app <your app name>
```

Additionally there's a dockefile

it expects the following secrets to be set on the environment
```bash
EVENT_TYPE=job_name # that you want to trigger
GITHUB_TOKEN="token(simple)" # with at least repo:read permission
REPO="user/repo" # where the workflow lives
SECRET="secret" # extra measure to disallow random requests
```

Notion sends a bunch of extra data on the body of the request (for, example if its a button database all the properties are sended). This can be leveraged in the future for more sophisticated uses.
Additionally, the job is fixed but it can be passed as a parameter in the future (f.e. to trigger different jobs).
