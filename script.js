const resumeText = document.querySelector("#resumeText");
const analyzeBtn = document.querySelector("#analyzeBtn");
const sampleBtn = document.querySelector("#sampleBtn");
const clearBtn = document.querySelector("#clearBtn");
const resumeFile = document.querySelector("#resumeFile");
const scoreRing = document.querySelector(".score-ring");
const scoreValue = document.querySelector("#scoreValue");
const scoreTitle = document.querySelector("#scoreTitle");
const scoreSummary = document.querySelector("#scoreSummary");
const keywordScore = document.querySelector("#keywordScore");
const verbScore = document.querySelector("#verbScore");
const metricScore = document.querySelector("#metricScore");
const insights = document.querySelector("#insights");

let scoreTimer;

const keywords = [
  "javascript",
  "typescript",
  "react",
  "node",
  "api",
  "cloud",
  "aws",
  "python",
  "sql",
  "analytics",
  "testing",
  "agile",
  "leadership",
  "design",
  "accessibility",
  "performance",
  "security",
  "data",
  "automation",
  "collaboration",
];

const actionVerbs = [
  "built",
  "led",
  "launched",
  "improved",
  "reduced",
  "increased",
  "designed",
  "delivered",
  "optimized",
  "automated",
  "managed",
  "created",
  "owned",
  "scaled",
  "implemented",
];

const sampleResume = `Frontend Developer

Built React and TypeScript dashboards for a SaaS analytics platform used by 42,000 monthly users.
Improved page load performance by 38% by optimizing bundle size, lazy loading routes, and removing unused dependencies.
Designed accessible UI components with WCAG-minded color contrast, keyboard navigation, and responsive states.
Collaborated with product, design, and backend teams to launch 9 customer-facing features across agile sprints.
Implemented API integrations, testing coverage, and automated quality checks for production releases.

Skills: React, TypeScript, JavaScript, Node, REST API, SQL, accessibility, performance, testing, design systems, analytics, collaboration.`;

function countMatches(text, words) {
  return words.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(text)).length;
}

function analyzeResume() {
  const text = resumeText.value.trim();
  if (!text) {
    renderEmpty();
    return;
  }

  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const keywordMatches = countMatches(lower, keywords);
  const verbMatches = countMatches(lower, actionVerbs);
  const metricMatches = (text.match(/\b\d+[%+]?\b|\$\d+|\b\d+x\b/gi) || []).length;
  const hasSections = ["experience", "skills", "education", "projects"].filter((section) =>
    lower.includes(section)
  ).length;

  const keywordPct = Math.round((keywordMatches / keywords.length) * 100);
  const lengthScore = Math.min(20, Math.round((wordCount / 420) * 20));
  const score = Math.min(
    100,
    Math.round(
      keywordPct * 0.34 +
        Math.min(verbMatches, 12) * 3 +
        Math.min(metricMatches, 8) * 4 +
        hasSections * 5 +
        lengthScore
    )
  );

  updateScore(score);
  scoreTitle.textContent =
    score >= 82 ? "Excellent recruiter signal" : score >= 65 ? "Solid resume foundation" : "Needs sharper positioning";
  scoreSummary.textContent =
    score >= 82
      ? "This resume has strong keyword coverage, measurable achievements, and clear impact language."
      : score >= 65
        ? "This resume is workable, with a few targeted edits needed to improve ATS and recruiter readability."
        : "Add stronger achievements, role keywords, and clearer sections to make the resume easier to rank and scan.";
  keywordScore.textContent = `${keywordPct}%`;
  verbScore.textContent = String(verbMatches);
  metricScore.textContent = String(metricMatches);
  insights.innerHTML = buildInsights({
    keywordPct,
    keywordMatches,
    verbMatches,
    metricMatches,
    hasSections,
    wordCount,
  })
    .map(
      (note) => `
        <article class="insight ${note.type}">
          <h4>${note.title}</h4>
          <p>${note.body}</p>
        </article>
      `
    )
    .join("");
}

function buildInsights(data) {
  const notes = [];

  notes.push({
    type: data.keywordPct >= 45 ? "strong" : "warning",
    title: data.keywordPct >= 45 ? "Keyword coverage is healthy" : "Add more role keywords",
    body:
      data.keywordPct >= 45
        ? `Found ${data.keywordMatches} relevant skill and role terms. Keep the most important ones close to recent experience bullets.`
        : "Mirror the target job description with specific tools, frameworks, domains, and responsibilities you can honestly claim.",
  });

  notes.push({
    type: data.metricMatches >= 4 ? "strong" : "warning",
    title: data.metricMatches >= 4 ? "Impact is measurable" : "Quantify your wins",
    body:
      data.metricMatches >= 4
        ? "The resume includes concrete numbers, which helps recruiters understand scope and outcomes quickly."
        : "Add numbers for scale, speed, revenue, users, cost savings, quality, or time saved wherever possible.",
  });

  notes.push({
    type: data.verbMatches >= 6 ? "strong" : "",
    title: "Action language",
    body:
      data.verbMatches >= 6
        ? "Strong action verbs make your responsibilities feel owned and outcome-oriented."
        : "Start more bullets with verbs like built, led, optimized, launched, automated, or improved.",
  });

  if (data.hasSections < 3) {
    notes.push({
      type: "warning",
      title: "Section structure",
      body: "Include clear headings for experience, skills, education, and projects so both ATS systems and humans can scan faster.",
    });
  }

  if (data.wordCount < 170) {
    notes.push({
      type: "warning",
      title: "Resume depth",
      body: "The content looks brief. Add enough recent accomplishments to show scope, complexity, and progression.",
    });
  }

  return notes;
}

function updateScore(score) {
  clearInterval(scoreTimer);
  scoreRing.style.setProperty("--score", score);

  let current = Number(scoreValue.textContent) || 0;
  if (current === score) {
    scoreValue.textContent = String(score);
    return;
  }

  const step = current < score ? 1 : -1;
  scoreTimer = setInterval(() => {
    current += step;
    scoreValue.textContent = String(current);
    if (current === score) {
      clearInterval(scoreTimer);
    }
  }, 10);
}

function renderEmpty() {
  updateScore(0);
  scoreTitle.textContent = "Ready when you are";
  scoreSummary.textContent =
    "Paste a resume to generate a targeted analysis of structure, measurable impact, keyword density, and recruiter readability.";
  keywordScore.textContent = "0%";
  verbScore.textContent = "0";
  metricScore.textContent = "0";
  insights.innerHTML = "";
}

resumeFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  if (file.type.startsWith("text") || /\.(txt|md)$/i.test(file.name)) {
    resumeText.value = await file.text();
    analyzeResume();
  } else {
    resumeText.placeholder = `File selected: ${file.name}. Browser-only demo cannot extract this format yet, so paste the resume text here.`;
  }
});

analyzeBtn.addEventListener("click", analyzeResume);
sampleBtn.addEventListener("click", () => {
  resumeText.value = sampleResume;
  analyzeResume();
});
clearBtn.addEventListener("click", () => {
  resumeText.value = "";
  renderEmpty();
});
