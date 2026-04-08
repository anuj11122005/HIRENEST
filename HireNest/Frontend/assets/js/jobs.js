const jobContainer = document.getElementById("jobContainer");
const searchInput = document.getElementById("searchJob");
const locationFilter = document.getElementById("filterLocation");
const typeFilter = document.getElementById("filterType");
const experienceFilter = document.getElementById("experienceFilter");
const sortFilter = document.getElementById("sortFilter");
const noJobsMessage = document.getElementById("noJobsMessage");
const jobsCount = document.getElementById("jobsCount");
const paginationContainer = document.getElementById("paginationContainer");

let jobs = [];
let filteredJobs = [];
const ITEMS_PER_PAGE = 6;
let currentPage = 1;

async function loadJobs() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/jobs/", {
            credentials: "include"
        });
        jobs = await response.json();
        filteredJobs = [...jobs];
        updateJobsCount();
        displayJobs();
        setupPagination();
    } catch (error) {
        console.error("Error loading jobs:", error);
        jobContainer.innerHTML = "<p style='color:#ef4444;'>Unable to load jobs. Please ensure the backend server is running.</p>";
    }
}

function updateJobsCount() {
    if (jobsCount) {
        jobsCount.textContent = `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`;
    }
}

function displayJobs() {
    jobContainer.innerHTML = "";

    if (filteredJobs.length === 0) {
        noJobsMessage.style.display = "block";
        if (paginationContainer) paginationContainer.style.display = "none";
        return;
    }

    noJobsMessage.style.display = "none";

    // Calculate pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const jobsToDisplay = filteredJobs.slice(startIndex, endIndex);

    jobsToDisplay.forEach(job => {
        const jobCard = document.createElement("div");
        jobCard.classList.add("job-card");

        const postedDate = job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recent';

        jobCard.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
                <h3 style="color:#7C5CFF;">${job.title}</h3>
                <span style="font-size:12px;padding:4px 8px;background:rgba(124,92,255,0.2);border-radius:4px;color:#7C5CFF;">${job.job_type}</span>
            </div>
            <p style="font-size:16px;margin-bottom:8px;"><strong>${job.company}</strong></p>
            <div style="display:flex;gap:12px;margin-bottom:12px;font-size:13px;color:rgba(255,255,255,0.7);">
                <span>📍 ${job.location}</span>
                <span>📅 ${postedDate}</span>
            </div>
            <p style="color:#9ca3af;font-size:14px;line-height:1.5;margin-bottom:16px;">
                ${job.description ? (job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description) : 'No description available'}
            </p>
            <button class="apply-btn" style="width:100%;padding:12px;background:linear-gradient(135deg,#7C5CFF,#4CAF50);border:none;border-radius:8px;color:white;font-weight:600;cursor:pointer;transition:transform 0.2s;">
                Apply Now
            </button>
        `;

        const applyButton = jobCard.querySelector(".apply-btn");
        applyButton.addEventListener("click", () => applyForJob(job));
        jobContainer.appendChild(jobCard);
    });

    if (paginationContainer) {
        paginationContainer.style.display = "block";
        updatePagination();
    }
}

function applyForJob(job) {
    (async () => {
        try {
            const authResponse = await fetch("http://127.0.0.1:8000/api/auth/me/", {
                credentials: "include"
            });

            if (!authResponse.ok) {
                alert("Please login to apply for jobs. You will be redirected to the login page.");
                window.location.href = "login.html";
                return;
            }

            const authData = await authResponse.json();

            if (!confirm(`Apply for ${job.title} at ${job.company}?`)) {
                return;
            }

            const response = await fetch("http://127.0.0.1:8000/api/apply/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    job_id: job.id
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Application submitted successfully!");
            } else {
                alert(result.error || "Failed to apply");
            }

        } catch (error) {
            console.error("Error applying:", error);
            alert("Something went wrong. Please try again.");
        }
    })();
}

function filterJobs() {
    const searchValue = searchInput?.value.toLowerCase() || "";
    const locationValue = locationFilter?.value || "";
    const typeValue = typeFilter?.value || "";
    const experienceValue = experienceFilter?.value || "";
    const sortValue = sortFilter?.value || "newest";

    filteredJobs = jobs.filter(job => {
        const matchTitle = job.title.toLowerCase().includes(searchValue) ||
                          job.company.toLowerCase().includes(searchValue) ||
                          (job.description && job.description.toLowerCase().includes(searchValue));

        const matchLocation = locationValue === "" || job.location.toLowerCase().includes(locationValue.toLowerCase());
        const matchType = typeValue === "" || job.job_type.toLowerCase().includes(typeValue.toLowerCase());

        return matchTitle && matchLocation && matchType;
    });

    // Sort jobs
    if (sortValue === "newest") {
        filteredJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortValue === "oldest") {
        filteredJobs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    currentPage = 1; // Reset to first page on filter
    updateJobsCount();
    displayJobs();
    setupPagination();
}

function setupPagination() {
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    let paginationHTML = "";

    // Previous button
    paginationHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="page-btn">Previous</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button onclick="changePage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span style="color:rgba(255,255,255,0.5);padding:8px;">...</span>`;
        }
    }

    // Next button
    paginationHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="page-btn">Next</button>`;

    paginationContainer.innerHTML = paginationHTML;
}

function updatePagination() {
    const buttons = paginationContainer?.querySelectorAll(".page-btn");
    if (buttons) {
        buttons.forEach((btn, index) => {
            const pageNum = parseInt(btn.textContent);
            if (!isNaN(pageNum)) {
                btn.classList.toggle("active", pageNum === currentPage);
                btn.disabled = false;
            }
        });
    }
}

function changePage(pageNum) {
    const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
    if (pageNum >= 1 && pageNum <= totalPages) {
        currentPage = pageNum;
        displayJobs();
    }
}

// Event listeners
if (searchInput) searchInput.addEventListener("input", filterJobs);
if (locationFilter) locationFilter.addEventListener("change", filterJobs);
if (typeFilter) typeFilter.addEventListener("change", filterJobs);
if (experienceFilter) experienceFilter.addEventListener("change", filterJobs);
if (sortFilter) sortFilter.addEventListener("change", filterJobs);

// Load jobs on page load
loadJobs();
