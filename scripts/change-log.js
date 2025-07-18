const parser = require('conventional-commits-parser').sync;
const { writeFileSync, existsSync, readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

const REPO_URL = 'https://github.com/catalystbyzoho/zcatalyst-sdk-js';

const parseOptions = {
  noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
  headerPattern: /^([\w\s]+)(?:\(([\w\$\.\*/-]*)\))?(!)?: (.*)$/,
  headerCorrespondence: ['type', 'scope', 'breaking', 'subject'],
};

function normalizeCommitMessage(msg) {
  // breaking(scope): ... → BREAKING CHANGE(scope): ...
  msg = msg.replace(/^breaking(\([^)]+\))?:/i, 'BREAKING CHANGE$1:');
  // feat(scope)!: ... → BREAKING CHANGE(scope): ...
  msg = msg.replace(/^feat(\([^)]+\))?!:/i, 'BREAKING CHANGE$1:');
  // fix(scope)!: ... → BREAKING CHANGE(scope): ...
  msg = msg.replace(/^fix(\([^)]+\))?!:/i, 'BREAKING CHANGE$1:');
  // BREAKING CHANGE(scope): ... (already correct)
  return msg;
}

function getCommitObjectsSinceTag() {
  const separator = '===END===';
  let log;
  try {
    const latestTag = execSync("git describe --tags --abbrev=0", { encoding: "utf8" }).trim();
    log = execSync(`git log ${latestTag}..HEAD --pretty=format:%B${separator}`, { encoding: "utf8" });
  } catch (err) {
    log = execSync(`git log --pretty=format:%B${separator}`, { encoding: "utf8" });
  }
  return log.split(separator).map(chunk => {
    const lines = chunk.trim().split('\n');
    return { hash: lines[0].split(/\(#(\d+)\)/)[1], message: lines.join('\n').trim() };
  }).filter(c => c.hash && c.message);
}

function groupCommitsByType(parsedCommits) {
  const groups = {};
  for (const commit of parsedCommits) {
    // Treat any commit with breaking: true or type BREAKING CHANGE as breaking
    const isBreaking =
      commit.breaking === true ||
      commit.type === 'BREAKING CHANGE' ||
      (commit.notes && commit.notes.some(n => n.title.toLowerCase() === 'breaking change'));
    let type = commit.type;
    if (isBreaking) type = 'breaking';
    if (['feat', 'chore'].includes(type)) type = 'feat';
    if (!['feat', 'fix', 'docs', 'test', 'refactor', 'breaking'].includes(type)) type = 'others';
    if (!groups[type]) groups[type] = [];
    groups[type].push(commit);
  }
  return groups;
}
function formatCommit(commit) {
  const summary = commit.subject;
  const prLink = `(${REPO_URL}/pull/${commit.hash})`;
  return `- ${summary}[\`#${commit.hash}\`]${prLink}`;
}

function generateChangelog(version, tagVersion, commitObjects, linkVersion = true) {
  const parsed = commitObjects.map(({ message, hash }) => {
    const parsedCommit = parser(normalizeCommitMessage(message), parseOptions);
    parsedCommit.hash = hash;
    return parsedCommit;
  });
  const grouped = groupCommitsByType(parsed);
  const date = new Date().toISOString().split('T')[0];

  if (parsed.length === 0) return `## ${linkVersion ? `[${version}](${REPO_URL}/releases/tag/${tagVersion})` : date} - ${date}\n\n_No significant changes_\n\n`;

  let output = linkVersion ? `## [${version}](${REPO_URL}/releases/tag/${tagVersion}) - ${date}\n\n` : `## ${date}\n\n`;

  const order = ['feat', 'fix', 'docs', 'test', 'refactor', 'breaking'];
  const titles = {
    feat: '### Features',
    fix: '### Bug Fixes',
    docs: '### Documentation',
    test: '### Tests',
    refactor: '### Refactors',
    breaking: '### Breaking Changes'
  };

  for (const type of order) {
    const commits = grouped[type];
    if (!commits) continue;
    output += `${titles[type]}\n`;
    for (const commit of commits.reverse()) {
      output += `${formatCommit(commit)}\n`;
      if (type === 'breaking') {
        for (const note of commit.notes || []) {
          if (note.title.toLowerCase() === 'breaking change') {
            output += `  - ${note.text.trim()}\n`;
          }
        }
      }
    }
    output += `\n`;
  }
  return output;
}

function writeChangelog(filePath, entry) {
  if (existsSync(filePath)) {
    const lines = readFileSync(filePath, 'utf-8').split('\n');
    const preserved = lines.slice(0, 1).join('\n');
    const rest = lines.slice(1).join('\n');
    const finalContent = `${preserved}\n\n${entry.trim()}\n\n${rest.trim()}\n`;
    writeFileSync(filePath, finalContent.trim() + '\n', 'utf-8');
  }
}

function getAllPackagesFromFs() {
  const packagesDir = join(process.cwd(), 'packages');
  return readdirSync(packagesDir).map(dir => {
    const pkgPath = join(packagesDir, dir, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      return { dir, name: pkg.name, version: pkg.version };
    }
    return null;
  }).filter(Boolean);
}

function updatePackageChangelogs(commitObjects) {
  const allPkgs = getAllPackagesFromFs();
  const rootPkg = require(join(process.cwd(), 'package.json'));
  const tagVersion = `v${rootPkg.version}`;

  for (const { dir, name, version } of allPkgs) {
    const changelogPath = join(process.cwd(), 'packages', dir, 'CHANGELOG.md');
    const date = new Date().toISOString().split('T')[0];
    const scopedCommits = [];

    for (const { message, hash } of commitObjects) {
      const lines = message.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = parser(normalizeCommitMessage(line), parseOptions);
          if (parsed.scope === dir || line.includes(name)) {
            parsed.hash = hash;
            parsed.message = line;
            parsed.subject = parsed.subject || `_Only version bump detected._`;
            scopedCommits.push(parsed);
          }
        } catch {}
      }
    }
    if (scopedCommits.length === 0) continue;
    const entry = generateChangelog(version, tagVersion, scopedCommits, true);
    writeChangelog(changelogPath, entry);
    console.log(`Updated packages/${dir}/CHANGELOG.md`);
  }
}

function updateGlobalChangelog(commitObjects) {
  const allPkgs = getAllPackagesFromFs();
  const rootPkg = require(join(process.cwd(), 'package.json'));
  const tagVersion = `v${rootPkg.version}`;
  const date = new Date().toISOString().split('T')[0];
  let output = `## [${tagVersion}](${REPO_URL}/releases/tag/${tagVersion}) - ${date}\n\n`;

  for (const { dir, name } of allPkgs) {
    const scopedCommits = [];
    for (const { message, hash } of commitObjects) {
      const lines = message.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = parser(normalizeCommitMessage(line), parseOptions);
          if (parsed.scope === dir || line.includes(name)) {
            parsed.hash = hash;
            parsed.message = line;
            parsed.subject = parsed.subject || `_Only version bump detected._`;
            scopedCommits.push(parsed);
          }
        } catch {}
      }
    }
    if (scopedCommits.length === 0) continue;
    output += `#### \`${name}@${tagVersion}\`\n`;
    const grouped = groupCommitsByType(scopedCommits);
    const order = ['feat', 'fix', 'docs', 'test', 'refactor', 'breaking'];
    const titles = {
      feat: 'Features',
      fix: 'Bug Fixes',
      docs: 'Documentation',
      test: 'Tests',
      refactor: 'Refactors',
      breaking: 'Breaking Changes'
    };
    for (const type of order) {
      const commitsOfType = grouped[type];
      if (!commitsOfType) continue;
      output += `- **${titles[type]}**\n`;
      for (const commit of commitsOfType.reverse()) {
        output += `  ${formatCommit(commit)}\n`;
        if (type === 'breaking') {
          for (const note of commit.notes || []) {
            if (note.title.toLowerCase() === 'breaking change') {
              output += `    - ${note.text.trim()}\n`;
            }
          }
        }
      }
    }
    output += `\n`;
  }
  const changelogPath = join(process.cwd(), 'CHANGELOG.md');
  writeChangelog(changelogPath, output);
  console.log(`Updated global CHANGELOG.md`);
}

function updateAll(commitObjects) {
  const parsedCommits = commitObjects.map(commit => {
    commit.message = normalizeCommitMessage(commit.message);
    return commit;
  }).filter(commit => (/(\(#\d+\))/).test(commit.message));

  updateGlobalChangelog(parsedCommits);
  updatePackageChangelogs(parsedCommits);
}

updateAll(getCommitObjectsSinceTag());
