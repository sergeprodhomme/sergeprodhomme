const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'store.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
  const initialData = {
    project: {
      name: 'CraftOps',
      summary: 'Design user stories, validate behavior, run tests, manage Docker environments, and track security checks.'
    },
    stories: [
      {
        id: 'ST-101',
        title: 'Project onboarding flow',
        status: 'In progress',
        priority: 'High',
        description: 'Create a guided onboarding flow so teams can define a project, stories, and acceptance criteria instantly.'
      },
      {
        id: 'ST-102',
        title: 'BDD scenario editor',
        status: 'Planned',
        priority: 'High',
        description: 'Allow teams to document feature scenarios as Given / When / Then statements.'
      },
      {
        id: 'ST-103',
        title: 'Container monitoring panel',
        status: 'Ready',
        priority: 'Medium',
        description: 'Expose Docker containers and environment health information to developers and operators.'
      }
    ],
    scenarios: [
      {
        id: 'SC-201',
        storyId: 'ST-101',
        title: 'User signs in and starts a new project',
        given: 'The team is logged in and has access to the dashboard',
        when: 'They create a new project and add a user story',
        then: 'The systems stores the project and displays it in the dashboard.'
      },
      {
        id: 'SC-202',
        storyId: 'ST-102',
        title: 'BDD scenario is reviewed',
        given: 'A story is created',
        when: 'A stakeholder adds behavioral acceptance criteria',
        then: 'The scenario appears in the validation board for review.'
      }
    ],
    tests: [
      {
        id: 'TC-301',
        storyId: 'ST-101',
        name: 'Project creation validation',
        status: 'Passed',
        owner: 'QA'
      },
      {
        id: 'TC-302',
        storyId: 'ST-102',
        name: 'BDD step parser',
        status: 'In progress',
        owner: 'DevOps'
      }
    ],
    containers: [
      { name: 'api', status: 'Running', image: 'node:20', ports: '3000:3000' },
      { name: 'db', status: 'Healthy', image: 'postgres:16', ports: '5432:5432' },
      { name: 'scanner', status: 'Stopped', image: 'trivy:latest', ports: '8080:8080' }
    ],
    security: [
      {
        id: 'SEC-401',
        target: 'api',
        status: 'Open',
        severity: 'High',
        finding: 'Authentication middleware not yet enforcing strict token validation.'
      },
      {
        id: 'SEC-402',
        target: 'db',
        status: 'Closed',
        severity: 'Medium',
        finding: 'Secret rotation policy documented and scheduled.'
      }
    ]
  };

  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
}

function readStore() {
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeStore(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/dashboard', (req, res) => {
  const data = readStore();
  const totals = {
    stories: data.stories.length,
    scenarios: data.scenarios.length,
    tests: data.tests.length,
    security: data.security.length,
    containers: data.containers.length
  };

  res.json({ project: data.project, totals, stories: data.stories, scenarios: data.scenarios, tests: data.tests, containers: data.containers, security: data.security });
});

app.get('/api/stories', (req, res) => {
  res.json(readStore().stories);
});

app.post('/api/stories', (req, res) => {
  const store = readStore();
  const body = req.body;
  const story = {
    id: body.id || `ST-${Date.now()}`,
    title: body.title || 'Untitled story',
    status: body.status || 'Planned',
    priority: body.priority || 'Medium',
    description: body.description || ''
  };
  store.stories.unshift(story);
  writeStore(store);
  res.status(201).json(story);
});

app.put('/api/stories/:id', (req, res) => {
  const store = readStore();
  const story = store.stories.find((item) => item.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  Object.assign(story, req.body);
  writeStore(store);
  res.json(story);
});

app.post('/api/scenarios', (req, res) => {
  const store = readStore();
  const scenario = {
    id: req.body.id || `SC-${Date.now()}`,
    storyId: req.body.storyId || 'ST-101',
    title: req.body.title || 'New scenario',
    given: req.body.given || '',
    when: req.body.when || '',
    then: req.body.then || ''
  };

  store.scenarios.push(scenario);
  writeStore(store);
  res.status(201).json(scenario);
});

app.post('/api/tests', (req, res) => {
  const store = readStore();
  const test = {
    id: req.body.id || `TC-${Date.now()}`,
    storyId: req.body.storyId || 'ST-101',
    name: req.body.name || 'New test',
    status: req.body.status || 'Planned',
    owner: req.body.owner || 'Team'
  };

  store.tests.push(test);
  writeStore(store);
  res.status(201).json(test);
});

app.post('/api/security', (req, res) => {
  const store = readStore();
  const finding = {
    id: req.body.id || `SEC-${Date.now()}`,
    target: req.body.target || 'service',
    status: req.body.status || 'Open',
    severity: req.body.severity || 'Medium',
    finding: req.body.finding || 'New security finding'
  };

  store.security.push(finding);
  writeStore(store);
  res.status(201).json(finding);
});

app.post('/api/docker/:service/action', (req, res) => {
  const store = readStore();
  const { action } = req.body;
  const container = store.containers.find((item) => item.name === req.params.service);

  if (!container) {
    return res.status(404).json({ error: 'Container not found' });
  }

  if (action === 'start') {
    container.status = 'Running';
  }

  if (action === 'stop') {
    container.status = 'Stopped';
  }

  if (action === 'restart') {
    container.status = 'Restarting';
  }

  writeStore(store);
  res.json(container);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CraftOps app listening on http://localhost:${PORT}`);
});
