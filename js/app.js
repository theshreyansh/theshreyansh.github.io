document.addEventListener('DOMContentLoaded', () => {
    // 0. Perform Silent Decryption
    tryDecryptAll();

    // 1. Initialize Persona Engine (Daily Theme Changer)
    initPersonaEngine();

    // 2. Process data for tags, dates and sorting
    processData();

    // 3. Load and Render Data from JS variables
    loadData();

    // 4. Initialize Scroll Animations (must happen after rendering)
    initScrollAnimations();
});

// -------------- PERSONA ENGINE --------------
const personas = [
    {
        title: 'Manager Data Science',
        subtitle: 'Driving business impact through strategic data science initiatives and cross-functional leadership.',
        accent1: '#007aff', // Apple Blue
        accent2: '#005bb5',
        skills: ['Team Leadership', 'Project Management', 'Data Strategy', 'Stakeholder Communication', 'Predictive Modeling']
    },
    {
        title: 'Senior Manager Data Science',
        subtitle: 'Scaling analytics operations and nurturing high-performance AI and ML talent.',
        accent1: '#5856d6', // Apple Purple
        accent2: '#413fa3',
        skills: ['AI/ML Delivery', 'Resource Planning', 'Data Governance', 'Advanced Analytics', 'Budgeting']
    },
    {
        title: 'Senior Data Scientist',
        subtitle: 'Developing robust algorithms and unlocking deep insights from complex data ecosystems.',
        accent1: '#34c759', // Apple Green
        accent2: '#248a3d',
        skills: ['Python', 'Machine Learning', 'Big Data Engineering', 'NLP', 'Data Visualization']
    },
    {
        title: 'Lead Data Scientist',
        subtitle: 'Architecting scalable ML pipelines and pioneering innovative AI solutions.',
        accent1: '#ff9500', // Apple Orange
        accent2: '#b86b00',
        skills: ['Deep Learning', 'Cloud Infrastructures', 'Architecture Design', 'Statistical Modeling', 'Spark/Hadoop']
    },
    {
        title: 'AVP Data Science',
        subtitle: 'Leading enterprise-wide data transformations and cultivating data-driven corporate cultures.',
        accent1: '#ff2d55', // Apple Pink
        accent2: '#c21e3d',
        skills: ['Executive Leadership', 'Digital Transformation', 'Enterprise AI Strategy', 'Vendor Management']
    },
    {
        title: 'Director Data Science',
        subtitle: 'Visionary leadership translating advanced data capabilities into sustainable competitive advantages.',
        accent1: '#1d1d1f', // Graphite / Black
        accent2: '#000000',
        skills: ['Corporate Strategy', 'P&L Management', 'AI Innovation', 'Global Delivery', 'Risk Analytics']
    }
];

function initPersonaEngine() {
    const todayIndex = new Date().getDay() % 6; // Values 0 to 5
    const persona = personas[todayIndex];

    // Inject Strings
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');
    
    if(titleEl) {
        titleEl.innerHTML = `Shreydhar <br><span class="text-gradient">${persona.title}</span>`;
    }
    if(subtitleEl) subtitleEl.innerText = persona.subtitle;

    // Inject Colors into CSS UI Variables
    document.documentElement.style.setProperty('--accent-primary', persona.accent1);
    document.documentElement.style.setProperty('--accent-secondary', persona.accent2);

    // Override the generic 'skillsData' in the hero with tailored Persona skills
    const container = document.getElementById('skills-container-hero');
    if (container) {
        container.innerHTML = persona.skills.map(s => `<span class="skill-pill shadow-sm">${s}</span>`).join('');
    }
}
// ---------------------------------------------

const skillDict = {
    'python': 'Python' /*...*/
};

// -------------- SILENT DECRYPTION ENGINE --------------
const SECRET_KEY = "hw2nQV69@uXb8aV@66S@4d&3*5!%MNdLPMd^fWiqJ9g#u52cgEEH2AY9%u*36zucSxt3msBSkt7Zw3oi!x7i@acJDcHNuB*zM$H*$4u7JaWi%7K4DiwD8$Yxa5DmDj6z";

function decrypt(encObj) {
    if (!encObj || !encObj.ct || !encObj.iv) return [];
    try {
        const key = CryptoJS.SHA256(SECRET_KEY);
        const iv = CryptoJS.enc.Base64.parse(encObj.iv);
        const ciphertext = CryptoJS.enc.Base64.parse(encObj.ct);
        
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );
        
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (!result) {
            console.warn("Decryption returned empty string. Key mismatch?");
            return [];
        }
        return JSON.parse(result);
    } catch (e) {
        console.error("Silent decryption failure", e);
        return [];
    }
}

function tryDecryptAll() {
    if (typeof skillsDataEnc !== 'undefined') skillsData = decrypt(skillsDataEnc);
    if (typeof positionsDataEnc !== 'undefined') positionsData = decrypt(positionsDataEnc);
    if (typeof projectsDataEnc !== 'undefined') projectsData = decrypt(projectsDataEnc);
    if (typeof certsDataEnc !== 'undefined') certsData = decrypt(certsDataEnc);
    if (typeof recsDataEnc !== 'undefined') recsData = decrypt(recsDataEnc);
    if (typeof eduDataEnc !== 'undefined') eduData = decrypt(eduDataEnc);
}

// Global data stores (populated by decryption)
let skillsData = [];
let positionsData = [];
let projectsData = [];
let certsData = [];
let recsData = [];
let eduData = [];

const defaultSkills = ['Tech Integration', 'Problem Solving', 'System Design'];

function extractSkills(text) {
    if (!text) return [];
    text = text.toLowerCase();
    
    let found = [];
    for (let key in skillDict) {
        if (text.includes(key) && !found.includes(skillDict[key])) {
            found.push(skillDict[key]);
        }
    }
    return found;
}

const parseDate = (item) => {
    if (!item) return 0;
    let d = new Date(item['Started On'] || item['Finished On']);
    return isNaN(d) ? 0 : d.getTime();
};

function processData() {
    positionsData.sort((a,b) => parseDate(b) - parseDate(a));
    projectsData.sort((a,b) => parseDate(b) - parseDate(a));
    certsData.sort((a,b) => parseDate(b) - parseDate(a));

    certsData.forEach(cert => {
        let skills = extractSkills(cert.Name);
        let fallbackIndex = 0;
        while (skills.length < 2) {
            if(!skills.includes(defaultSkills[fallbackIndex])) {
                skills.push(defaultSkills[fallbackIndex]);
            }
            fallbackIndex++;
        }
        cert.tags = skills;
    });

    projectsData.forEach(proj => {
        const fullText = (proj.Title || '') + " " + (proj.Description || '');
        proj.tags = extractSkills(fullText);
        if (proj.tags.length === 0) proj.tags = ['General'];
    });
}

function calculateKPIs() {
    document.getElementById('kpi-projects').innerText = projectsData.length || 0;
    document.getElementById('kpi-certs').innerText = certsData.length || 0;

    const kpiEdu = document.getElementById('kpi-education');
    if (kpiEdu) {
        if (typeof eduData !== 'undefined' && eduData.length > 0) {
            let degreeFull = eduData[0]['Degree Name'] || '';
            let shortDegree = degreeFull.includes('-') ? degreeFull.split('-').pop().trim() : degreeFull;
            kpiEdu.innerText = shortDegree || 'N/A';
        } else {
            kpiEdu.innerText = '--';
        }
    }

    if (positionsData && positionsData.length > 0) {
        let minDate = new Date();
        let maxDate = new Date(0); 

        positionsData.forEach(pos => {
            if(pos['Started On']) {
                let d = new Date(pos['Started On']);
                if (!isNaN(d) && d < minDate) minDate = d;
            }
            let finishD = pos['Finished On'] ? new Date(pos['Finished On']) : new Date();
            if (!isNaN(finishD) && finishD > maxDate) maxDate = finishD;
        });

        const diffTime = Math.abs(maxDate - minDate);
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        document.getElementById('kpi-experience').innerText = diffYears.toFixed(1) + " Yrs";
    }
}

function calcDurationString(start, end) {
    if (!start) return "";
    let s = new Date(start);
    let e = end ? new Date(end) : new Date();
    if (isNaN(s) || isNaN(e)) return "";
    
    let months = (e.getFullYear() - s.getFullYear()) * 12;
    months -= s.getMonth();
    months += e.getMonth();
    months = months <= 0 ? 0 : months;

    let yrs = Math.floor(months / 12);
    let remMonths = months % 12;
    
    let str = "";
    if (yrs > 0) str += `${yrs} yr${yrs > 1 ? 's' : ''} `;
    if (remMonths > 0) str += `${remMonths} mo${remMonths > 1 ? 's' : ''}`;
    
    return str.trim() || '1 mo';
}

function loadData() {
    calculateKPIs();
    // Hero skills are now injected via Persona.
    renderExperience(positionsData);
    renderProjects(projectsData);
    renderCertifications(certsData);
    renderRecommendations(typeof recsData !== 'undefined' ? recsData : []);
    renderEducation(typeof eduData !== 'undefined' ? eduData : []);
    
    setupFilters();
    renderCharts(projectsData, certsData);
    renderKeyBusinessDeliveries(projectsData);
}

// Filtering system
function getUniqueTags(dataSet) {
    let tagSet = new Set();
    dataSet.forEach(item => {
        (item.tags || []).forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
}

function setupFilters() {
    const bindFilter = (containerId, itemsClass, data) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let tags = getUniqueTags(data);
        let currentTag = 'all';
        let currentYear = 'all';

        const applyFilters = () => {
            let items = document.querySelectorAll(itemsClass);
            let filteredCerts = [];

            items.forEach(el => {
                let itemTags = el.getAttribute('data-tags') || '';
                let itemYear = el.getAttribute('data-year') || '';
                let matchTag = (currentTag === 'all' || itemTags.includes(currentTag));
                let matchYear = (currentYear === 'all' || itemYear === currentYear || (currentYear === '2020' && parseInt(itemYear) <= 2020));

                if (matchTag && matchYear) {
                    el.style.display = 'block';
                    el.style.opacity = 1;
                    if (containerId === 'cert-filters') {
                        // Find the original data object for chart re-rendering
                        const certName = el.querySelector('.card-title').innerText;
                        const original = data.find(c => c.Name === certName);
                        if(original) filteredCerts.push(original);
                    }
                } else {
                    el.style.display = 'none';
                }
            });

            // Re-render chart if this is certifications
            if (containerId === 'cert-filters') {
                const filteredProjects = projectsData.filter(p => {
                    if (currentTag === 'all') return true;
                    return (p.tags || []).includes(currentTag);
                });
                renderSkillProjectChart(filteredProjects, 'skillProjectChartMain');
            }
        };
        
        // Build Tag Buttons
        let tagHtml = `<button class="filter-btn active" data-filter="all">All</button>`;
        tags.forEach(t => {
            tagHtml += `<button class="filter-btn" data-filter="${t}">${t}</button>`;
        });
        container.innerHTML += tagHtml;
        
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTag = btn.getAttribute('data-filter');
                applyFilters();
            });
        });

        // Special handling for Year filter (only for certs)
        if (containerId === 'cert-filters') {
            const yearSelect = document.getElementById('cert-year-filter');
            if (yearSelect) {
                yearSelect.addEventListener('change', (e) => {
                    currentYear = e.target.value;
                    applyFilters();
                });
            }
        }
    };

    bindFilter('project-filters', '.project-item', projectsData);
    bindFilter('cert-filters', '.cert-item', certsData);
}

// Renders
function renderExperience(positions) {
    const container = document.getElementById('experience-container');
    if (!positions || positions.length === 0) return;
    
    const html = positions.map(pos => {
        const desc = pos.Description ? pos.Description.replace(/\n/g, '<br>') : '';
        const end = pos['Finished On'] ? pos['Finished On'] : 'Present';
        const durationStr = calcDurationString(pos['Started On'], pos['Finished On']);
        const durationBadge = durationStr ? `<span class="timeline-duration">${durationStr}</span>` : '';
        
        // Find URL
        const url = pos.Url || pos['Company Url'] || pos['Link'] || '';
        const companyLabel = url ? `<a href="${url}" target="_blank" class="text-decoration-none" style="color: var(--accent-primary);">@ ${pos['Company Name']}</a>` : `@ ${pos['Company Name']}`;

        return `
        <div class="timeline-item on-scroll">
            <div class="timeline-dot"></div>
            <div class="timeline-date">${pos['Started On']} - ${end} ${durationBadge}</div>
            <div class="timeline-content">
                <h4 class="font-outfit fw-bold">${pos.Title} <span style="font-weight: normal; color: var(--accent-primary);">${companyLabel}</span></h4>
                <h6><i class="fa-solid fa-location-dot me-1"></i> ${pos.Location || 'Remote'}</h6>
                <p class="text-secondary mb-0" style="font-size: 0.9rem; line-height: 1.5;">${desc}</p>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function parseProjectFields(description) {
    // Try to parse structured fields from description
    // Supports patterns like: "Business Problem: X | Industry: Y | Tools: A, B | ..."
    const fields = {
        'Business Problem': '',
        'Industry': '',
        'Tools': '',
        'Technology': '',
        'Data Volume': '',
        'Approach': '',
        'Business Value Delivered': '',
        'Description': description || ''
    };

    if (!description) return fields;

    // Check if the description contains structured key: value pairs separated by | or newlines
    const structuredPattern = /([A-Za-z ]+)\s*:\s*([^|:\n]+)/g;
    let match;
    let hasStructured = false;
    const tempFields = {};

    while ((match = structuredPattern.exec(description)) !== null) {
        const key = match[1].trim();
        const val = match[2].trim();
        const normalised = Object.keys(fields).find(k => k.toLowerCase() === key.toLowerCase());
        if (normalised) {
            tempFields[normalised] = val;
            hasStructured = true;
        }
    }

    if (hasStructured) {
        Object.assign(fields, tempFields);
        // If description was consumed by structured fields, clear raw description
        if (tempFields['Description']) fields['Description'] = tempFields['Description'];
    }

    return fields;
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!projects || projects.length === 0) return;

    const html = projects.map((proj, idx) => {
        const end   = proj['Finished On'] ? proj['Finished On'] : 'Present';
        const url   = proj.Url || proj['Link'] || '';
        const paneId = `proj-pane-${idx}`;

        const f = parseProjectFields(proj.Description);

        // Helper: render a detail cell
        const cell = (label, value, full) => {
            const val = value && value.trim() ? value.trim() : '—';
            const muted = val === '—' ? ' muted' : '';
            const fullClass = full ? ' proj-detail-full' : '';
            return `
            <div class="proj-detail-item${fullClass}">
                <div class="proj-detail-label">${label}</div>
                <div class="proj-detail-value${muted}">${val}</div>
            </div>`;
        };

        const tagsHtml = (proj.tags || []).slice(0, 4).map(t =>
            `<span class="badge bg-secondary" style="font-size:0.65rem;">${t}</span>`
        ).join('');
        const tagsData = (proj.tags || []).join(',');

        const industry = f['Industry'] && f['Industry'] !== '—' ? f['Industry'] : (proj.tags && proj.tags[0] ? proj.tags[0] : '');

        const urlBtn = url
            ? `<a href="${url}" class="proj-url-btn" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Project</a>`
            : '';

        return `
        <div class="project-pane project-item on-scroll" data-tags="${tagsData}" id="${paneId}">
            <div class="project-pane-header" onclick="toggleProjectPane('${paneId}')">
                <span class="project-pane-num">${String(idx + 1).padStart(2, '0')}</span>
                <span class="project-pane-title" title="${proj.Title}">${proj.Title}</span>
                ${industry ? `<span class="project-pane-industry">${industry}</span>` : ''}
                <span class="project-pane-dates"><i class="fa-regular fa-calendar me-1"></i>${proj['Started On'] || ''} – ${end}</span>
                <div class="project-pane-tags">${tagsHtml}</div>
                <i class="fa-solid fa-chevron-down project-pane-chevron"></i>
            </div>
            <div class="project-pane-body">
                <div class="proj-detail-grid">
                    ${cell('Business Problem', f['Business Problem'])}
                    ${cell('Industry', f['Industry'])}
                    ${cell('Tools', f['Tools'])}
                    ${cell('Technology', f['Technology'])}
                    ${cell('Data Volume', f['Data Volume'])}
                    ${cell('Approach', f['Approach'])}
                    ${cell('Business Value Delivered', f['Business Value Delivered'], true)}
                    ${cell('Description', f['Description'], true)}
                </div>
                ${urlBtn}
            </div>
        </div>`;
    }).join('');

    container.innerHTML = html;
}

function toggleProjectPane(paneId) {
    const pane = document.getElementById(paneId);
    if (!pane) return;
    pane.classList.toggle('open');
}


function renderRecommendations(recs) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;
    
    const visibleRecs = recs.filter(r => r.Status === 'VISIBLE');
    if (visibleRecs.length === 0) {
        document.getElementById('headingRecommendations').parentElement.style.display = 'none';
        return;
    }

    const html = visibleRecs.map(rec => {
        return `
        <div class="col on-scroll">
            <div class="card glass-card h-100 border-0 p-3" style="background-color: var(--card-bg);">
                <div class="card-body">
                    <i class="fa-solid fa-quote-left mb-3" style="color: var(--accent-primary); font-size: 1.5rem; opacity: 0.3;"></i>
                    <p class="card-text text-secondary fst-italic" style="font-size: 0.85rem; line-height: 1.5;">"${rec.Text}"</p>
                    <div class="mt-3 border-top pt-3 text-end">
                        <h6 class="mb-0 fw-bold font-outfit text-dark">${rec['First Name']} ${rec['Last Name']}</h6>
                        <small class="text-secondary" style="font-size: 0.75rem;">${rec['Job Title']} @ ${rec.Company}</small>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function renderCertifications(certs) {
    const container = document.getElementById('certifications-container');
    if (!certs || certs.length === 0) return;
    
    const html = certs.map((cert) => {
        const urlBtn = cert.Url ? `<a href="${cert.Url}" class="btn btn-sm btn-outline-primary mt-2 py-0 px-2 w-100" style="font-size: 0.75rem; border-radius: 12px; color: var(--accent-primary); border-color: var(--accent-primary);" target="_blank">Verify</a>` : '';
        const tagsHtml = (cert.tags || []).map(t => `<span class="badge bg-primary me-1 mb-1 shadow-sm" style="font-size: 0.65rem; background-color: var(--accent-primary) !important;">${t}</span>`).join('');
        const tagsData = (cert.tags || []).join(',');
        
        let year = "Unknown";
        if (cert['Started On']) {
            const ym = cert['Started On'].match(/\b(20\d{2})\b/);
            if(ym) year = ym[1];
        }

        return `
        <div class="col cert-item on-scroll" data-tags="${tagsData}" data-year="${year}">
            <div class="card glass-card cert-card h-100 p-2 text-center border-0 border-top border-3" style="border-top-color: var(--accent-primary) !important;">
                <div class="card-body p-2 d-flex flex-column align-items-center">
                    <div class="mb-2">
                        <i class="fa-solid fa-certificate fa-2x" style="color: var(--accent-primary); opacity: 0.9"></i>
                    </div>
                    <h6 class="card-title font-outfit fw-bold mb-1" style="font-size: 0.9rem; line-height: 1.2;">${cert.Name}</h6>
                    <p class="card-text text-secondary mb-2" style="font-size: 0.75rem;">${cert.Authority}</p>
                    <div class="mb-2">${tagsHtml}</div>
                    <small class="text-secondary d-block mt-auto" style="font-size: 0.7rem;">${cert['Started On'] || ''}</small>
                    ${urlBtn}
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function renderEducation(edu) {
    const section = document.getElementById('education-accordion');
    if (!edu || edu.length === 0) {
        if(section) section.style.display = 'none';
        return;
    }
    const container = document.getElementById('education-container');
    if (!container) return;

    const html = edu.map(ed => {
        const degreeText = ed['Degree Name'] || 'Education';
        const institutionText = ed['School Name'] || 'Institution';
        const year = ed['End Date'] || ed['Start Date'] || '';
        const desc = ed['Notes'] || '';
        
        const url = ed.Url || ed['School Url'] || ed['Link'] || '';
        const degreeLink = url ? `<a href="${url}" target="_blank" class="text-decoration-none" style="color: inherit;">${degreeText}</a>` : degreeText;
        const schoolLink = url ? `<a href="${url}" target="_blank" class="text-decoration-none" style="color: var(--accent-primary);">@ ${institutionText}</a>` : `@ ${institutionText}`;

        return `
        <div class="timeline-item on-scroll">
            <div class="timeline-dot"></div>
            <div class="timeline-date">${year}</div>
            <div class="timeline-content">
                <h4 class="font-outfit fw-bold">${degreeLink} <span style="font-weight: normal; color: var(--accent-primary);">${schoolLink}</span></h4>
                <p class="text-secondary mb-0" style="font-size: 0.9rem;">${desc}</p>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    if(section) section.style.display = 'block';
}

// --- 2. Skills vs Projects Count (Horizontal Bar) ---
function renderSkillProjectChart(projects, targetId) {
    const ctx = document.getElementById(targetId);
    if (!ctx) return;

    // Destroy existing chart if any
    const existingChart = Chart.getChart(targetId);
    if (existingChart) existingChart.destroy();

    const skillCounts = {};
    projects.forEach(p => {
        if(p.tags) {
            p.tags.forEach(t => {
                skillCounts[t] = (skillCounts[t] || 0) + 1;
            });
        }
    });

    const sortedSkills = Object.keys(skillCounts).sort((a,b) => skillCounts[b] - skillCounts[a]);
    const labels = sortedSkills.slice(0, 10);
    const total = projects.length || 1;
    const values = labels.map(l => +((skillCounts[l] / total) * 100).toFixed(1));

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#007aff';

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: '% of Projects',
                data: values,
                backgroundColor: primaryColor,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } }
            },
            scales: {
                x: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => v + '%' } },
                y: { grid: { display: false }, ticks: { font: { size: 10 } } }
            }
        }
    });
}

// ── Key Business Deliveries ──────────────────────────────────────
function renderKeyBusinessDeliveries(projects) {
    const container = document.getElementById('kbd-container');
    if (!container) return;

    // Collect projects that have a Business Value Delivered field
    const deliveries = [];
    projects.forEach(proj => {
        const f = parseProjectFields(proj.Description);
        const bvd = f['Business Value Delivered'] && f['Business Value Delivered'].trim() && f['Business Value Delivered'] !== '—'
            ? f['Business Value Delivered'].trim() : '';
        if (!bvd) return;

        const industry = f['Industry'] && f['Industry'] !== '—' ? f['Industry'].trim()
            : (proj.tags && proj.tags[0] ? proj.tags[0] : 'General');

        deliveries.push({
            title: proj.Title,
            industry,
            value: bvd,
            approach: f['Approach'] || '',
            tools: f['Tools'] || '',
            start: proj['Started On'] || '',
            end: proj['Finished On'] || 'Present'
        });
    });

    if (deliveries.length === 0) {
        container.innerHTML = `<p class="text-secondary text-center py-3" style="font-size:0.85rem;">
            No Business Value Delivered data found. Add structured fields to your project descriptions.</p>`;
        return;
    }

    // Group by industry
    const byIndustry = {};
    deliveries.forEach(d => {
        if (!byIndustry[d.industry]) byIndustry[d.industry] = [];
        byIndustry[d.industry].push(d);
    });

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#0066cc';
    const industryColors = ['#007aff','#34c759','#ff9500','#ff3b30','#5856d6','#5ac8fa','#ff2d55','#32ade6'];
    const industryList = Object.keys(byIndustry);

    let html = '';
    industryList.forEach((industry, iIdx) => {
        const color = industryColors[iIdx % industryColors.length];
        const items = byIndustry[industry];
        const groupId = `kbd-group-${iIdx}`;

        html += `
        <div class="mb-3">
            <div class="d-flex align-items-center gap-2 mb-2">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color}; flex-shrink:0;"></span>
                <span class="fw-bold" style="font-size:0.8rem; text-transform:uppercase; letter-spacing:.06em; color:${color};">${industry}</span>
                <span class="text-secondary" style="font-size:0.75rem;">${items.length} project${items.length > 1 ? 's' : ''}</span>
            </div>
            ${items.map((d, dIdx) => {
                const paneId = `${groupId}-${dIdx}`;
                const toolsHtml = d.tools ? `<span style="font-size:0.72rem; color:#86868b; margin-left:8px;"><i class="fa-solid fa-screwdriver-wrench me-1"></i>${d.tools}</span>` : '';
                return `
                <div class="project-pane mb-2" id="${paneId}" style="border-left: 3px solid ${color};">
                    <div class="project-pane-header" onclick="toggleProjectPane('${paneId}')">
                        <span class="project-pane-num" style="color:${color};">💡</span>
                        <span class="project-pane-title">${d.title}</span>
                        ${d.start ? `<span class="project-pane-dates"><i class="fa-regular fa-calendar me-1"></i>${d.start} – ${d.end}</span>` : ''}
                        ${toolsHtml}
                        <i class="fa-solid fa-chevron-down project-pane-chevron"></i>
                    </div>
                    <div class="project-pane-body">
                        <div class="proj-detail-grid">
                            <div class="proj-detail-item proj-detail-full" style="background:rgba(52,199,89,0.06); border-color:rgba(52,199,89,0.2);">
                                <div class="proj-detail-label" style="color:#34c759;">Business Value Delivered</div>
                                <div class="proj-detail-value">${d.value}</div>
                            </div>
                            ${d.approach ? `
                            <div class="proj-detail-item proj-detail-full">
                                <div class="proj-detail-label">Approach</div>
                                <div class="proj-detail-value">${d.approach}</div>
                            </div>` : ''}
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    });

    container.innerHTML = html;
}

function renderCharts(projects, certs) {
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    Chart.defaults.color = '#86868b';

    // --- 1. Skills vs % Projects (dashboard) ---
    renderSkillProjectChart(projects, 'skillProjectChartDashboard');

    // --- 2. Skills vs % Projects (certifications section) ---
    renderSkillProjectChart(projects, 'skillProjectChartMain');

    // --- 3. Skills vs % Certificates ---
    const mapCtx = document.getElementById('skillCertChart');
    if (mapCtx) {
        let skillCounts = {};
        const totalCerts = certs.length || 1;
        certs.forEach(c => {
            if (c.tags) {
                c.tags.forEach(t => { skillCounts[t] = (skillCounts[t] || 0) + 1; });
            }
        });
        const filteredKeys = Object.keys(skillCounts).filter(k => skillCounts[k] >= 2);
        filteredKeys.sort((a, b) => skillCounts[b] - skillCounts[a]);
        const labels = filteredKeys.slice(0, 10);
        const dataPct = labels.map(k => +((skillCounts[k] / totalCerts) * 100).toFixed(1));

        new Chart(mapCtx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: '% of Certs', data: dataPct, backgroundColor: '#34c759', borderRadius: 6 }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } }
                },
                scales: {
                    x: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => v + '%' } },
                    y: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }

    // --- 4. Industry vs % Projects ---
    const industProjCtx = document.getElementById('industryProjectChart');
    if (industProjCtx) {
        const industryCounts = {};
        const totalProj = projects.length || 1;
        projects.forEach(p => {
            const f = parseProjectFields(p.Description);
            const industry = (f['Industry'] && f['Industry'].trim() && f['Industry'] !== '—')
                ? f['Industry'].trim()
                : (p.tags && p.tags[0] ? p.tags[0] : 'Other');
            industryCounts[industry] = (industryCounts[industry] || 0) + 1;
        });
        const iLabels = Object.keys(industryCounts).sort((a,b) => industryCounts[b] - industryCounts[a]).slice(0, 8);
        const iPct = iLabels.map(k => +((industryCounts[k] / totalProj) * 100).toFixed(1));
        const iColors = ['#007aff','#34c759','#ff9500','#ff3b30','#5856d6','#5ac8fa','#ffcc00','#ff2d55'];

        new Chart(industProjCtx, {
            type: 'doughnut',
            data: {
                labels: iLabels,
                datasets: [{ data: iPct, backgroundColor: iColors, borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` } }
                }
            }
        });
    }

    // --- 5. Industry vs % Certificates ---
    const industCertCtx = document.getElementById('industryCertChart');
    if (industCertCtx) {
        const industryCertCounts = {};
        const totalCertsInd = certs.length || 1;
        certs.forEach(c => {
            const f = parseProjectFields(c.Description || '');
            const industry = (f['Industry'] && f['Industry'].trim() && f['Industry'] !== '—')
                ? f['Industry'].trim()
                : (c.tags && c.tags[0] ? c.tags[0] : 'Other');
            industryCertCounts[industry] = (industryCertCounts[industry] || 0) + 1;
        });
        const icLabels = Object.keys(industryCertCounts).sort((a,b) => industryCertCounts[b] - industryCertCounts[a]).slice(0, 8);
        const icPct = icLabels.map(k => +((industryCertCounts[k] / totalCertsInd) * 100).toFixed(1));
        const icColors = ['#34c759','#007aff','#ff9500','#5856d6','#ff3b30','#5ac8fa','#ffcc00','#ff2d55'];

        new Chart(industCertCtx, {
            type: 'doughnut',
            data: {
                labels: icLabels,
                datasets: [{ data: icPct, backgroundColor: icColors, borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` } }
                }
            }
        });
    }
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.on-scroll').forEach(el => observer.observe(el));
    
    const accordions = document.querySelectorAll('.accordion-collapse');
    accordions.forEach(acc => {
        acc.addEventListener('shown.bs.collapse', () => {
            acc.querySelectorAll('.on-scroll').forEach(el => observer.observe(el));
        });
    });
}
