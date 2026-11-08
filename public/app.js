const state = {
  project: null,
  stories: [],
  scenarios: [],
  tests: [],
  containers: [],
  security: []
};

const initDashboard = async () => {
  const response = await fetch('/api/dashboard');
  const data = await response.json();
  Object.assign(state, data);
  renderDashboard();
  renderStories();
  renderScenarios();
  renderTests();
  renderContainers();
  renderSecurity();
};

const renderDashboard = () => {
  document.getElementById('projectName').textContent = state.project.name;
  document.getElementById('projectSummary').textContent = state.project.summary;

  const totals = [
    { label: 'Stories', value: state.totals.stories },
    { label: 'Scenarios', value: state.totals.scenarios },
    { label: 'Tests', value: state.totals.tests },
    { label: 'Containers', value: state.totals.containers },
    { label: 'Security', value: state.totals.security }
  ];

  const totalsContainer = document.getElementById('totalsGrid');
  totalsContainer.innerHTML = totals
    .map((item) => `<div class="metric-card"><h3>${item.label}</h3><strong>${item.value}</strong></div>`)
    .join('');
};

const renderStories = () => {
  const list = document.getElementById('storyList');
  list.innerHTML = state.stories
    .map(
      (story) => `
        <article class="card story-card">
          <div class="story-header">
            <span class="chip priority-${story.priority.toLowerCase()}">${story.priority}</span>
            <span class="chip status-${story.status.toLowerCase().replace(/\s+/g, '-')}">${story.status}</span>
          </div>
          <h4>${story.id} · ${story.title}</h4>
          <p>${story.description}</p>
        </article>
      `
    )
    .join('');
};

const renderScenarios = () => {
  const list = document.getElementById('scenarioList');
  list.innerHTML = state.scenarios
    .map(
      (scenario) => `
        <article class="card scenario-card">
          <h4>${scenario.title}</h4>
          <p><strong>Given:</strong> ${scenario.given}</p>
          <p><strong>When:</strong> ${scenario.when}</p>
          <p><strong>Then:</strong> ${scenario.then}</p>
        </article>
      `
    )
    .join('');
};

const renderTests = () => {
  const list = document.getElementById('testList');
  list.innerHTML = state.tests
    .map(
      (test) => `
        <article class="card test-card">
          <div class="inline-row">
            <strong>${test.name}</strong>
            <span class="chip status-${test.status.toLowerCase()}">${test.status}</span>
          </div>
          <small>${test.owner}</small>
        </article>
      `
    )
    .join('');
};

const renderContainers = () => {
  const list = document.getElementById('containerList');
  list.innerHTML = state.containers
    .map(
      (container) => `
        <article class="card container-card">
          <div class="inline-row">
            <strong>${container.name}</strong>
            <span class="chip status-${container.status.toLowerCase()}">${container.status}</span>
          </div>
          <small>${container.image}</small>
          <small>Ports: ${container.ports}</small>
          <button data-service="${container.name}" class="tiny-btn" data-action="start">Start</button>
          <button data-service="${container.name}" class="tiny-btn" data-action="stop">Stop</button>
          <button data-service="${container.name}" class="tiny-btn" data-action="restart">Restart</button>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const service = event.target.dataset.service;
      const action = event.target.dataset.action;

      await fetch(`/api/docker/${service}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      initDashboard();
    });
  });
};

const renderSecurity = () => {
  const list = document.getElementById('securityList');
  list.innerHTML = state.security
    .map(
      (item) => `
        <article class="card security-card">
          <div class="inline-row">
            <strong>${item.target}</strong>
            <span class="chip severity-${item.severity.toLowerCase()}">${item.severity}</span>
          </div>
          <p>${item.finding}</p>
          <small>${item.status}</small>
        </article>
      `
    )
    .join('');
};

document.getElementById('storyForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: formData.get('title'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      description: formData.get('description')
    })
  });

  event.target.reset();
  initDashboard();
});

document.getElementById('scenarioForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  await fetch('/api/scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: formData.get('title'),
      storyId: formData.get('storyId'),
      given: formData.get('given'),
      when: formData.get('when'),
      then: formData.get('then')
    })
  });

  event.target.reset();
  initDashboard();
});

document.getElementById('testForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  await fetch('/api/tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.get('name'),
      status: formData.get('status'),
      owner: formData.get('owner'),
      storyId: formData.get('storyId')
    })
  });

  event.target.reset();
  initDashboard();
});

document.getElementById('securityForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  await fetch('/api/security', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: formData.get('target'),
      severity: formData.get('severity'),
      status: formData.get('status'),
      finding: formData.get('finding')
    })
  });

  event.target.reset();
  initDashboard();
});

initDashboard();
