const jobContainer = document.getElementById("jobContainer");
const searchInput = document.getElementById("searchJob");
const locationFilter = document.getElementById("filterLocation");
const typeFilter = document.getElementById("filterType");
const noJobsMessage = document.getElementById("noJobsMessage");

let jobs = [];

async function loadJobs() {

    const response = await fetch("http://127.0.0.1:8000/api/jobs/");
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
            <p>${job.job_type}</p>
            <p style="color:#9ca3af">${job.description || ""}</p>

            <button class="apply-btn" style="margin-top:10px;">
                Apply
            </button>
        `;

        const applyButton = jobCard.querySelector(".apply-btn");

        applyButton.addEventListener("click", async function () {

            const name = prompt("Enter your name:");
            const email = prompt("Enter your email:");

            if (!name || !email) {
                alert("Name and email are required.");
                return;
            }

            try {

                const response = await fetch("http://127.0.0.1:8000/api/apply/", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        job_id: job.id,
                        name: name,
                        email: email
                    })

                });

                const result = await response.json();

                alert("Application submitted successfully!");

            } catch (error) {

                console.error("Error applying:", error);
                alert("Something went wrong.");

            }

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
            typeValue === "" || job.job_type === typeValue;

        return matchTitle && matchLocation && matchType;
    });

    displayJobs(filteredJobs);
}

searchInput.addEventListener("input", filterJobs);
locationFilter.addEventListener("change", filterJobs);
typeFilter.addEventListener("change", filterJobs);

loadJobs();