const jobContainer = document.getElementById("jobContainer");
const searchInput = document.getElementById("searchJob");
const locationFilter = document.getElementById("filterLocation");
const typeFilter = document.getElementById("filterType");
const noJobsMessage = document.getElementById("noJobsMessage");

let jobs = [];

async function loadJobs() {

    const response = await fetch("../data/jobs.json");
    jobs = await response.json();

    displayJobs(jobs);
}

function displayJobs(jobList) {

    jobContainer.innerHTML = "";

    if (jobList.length === 0) {
        noJobsMessage.style.display = "block";
        return;
    }

    noJobsMessage.style.display = "none";

    jobList.forEach(job => {

        const jobCard = document.createElement("div");
        jobCard.classList.add("job-card");

        jobCard.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>${job.company}</strong> • ${job.location}</p>
            <p>${job.type}</p>
            <p style="color:#9ca3af">${job.skills || job.description || ""}</p>

            <button class="apply-btn" style="margin-top:10px;">
                Apply
            </button>
        `;

        const applyButton = jobCard.querySelector(".apply-btn");

        applyButton.addEventListener("click", function () {

            let applications =
                JSON.parse(localStorage.getItem("applications")) || [];

            applications.push(job);

            localStorage.setItem(
                "applications",
                JSON.stringify(applications)
            );

            alert("Application submitted successfully!");
        });

        jobContainer.appendChild(jobCard);
    });
}

function filterJobs() {

    const searchValue = searchInput.value.toLowerCase();
    const locationValue = locationFilter.value;
    const typeValue = typeFilter.value;

    const filteredJobs = jobs.filter(job => {

        const matchTitle =
            job.title.toLowerCase().includes(searchValue);

        const matchLocation =
            locationValue === "" || job.location === locationValue;

        const matchType =
            typeValue === "" || job.type === typeValue;

        return matchTitle && matchLocation && matchType;
    });

    displayJobs(filteredJobs);
}

searchInput.addEventListener("input", filterJobs);
locationFilter.addEventListener("change", filterJobs);
typeFilter.addEventListener("change", filterJobs);

loadJobs();