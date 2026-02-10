// =======================================================
// HireNest - Jobs Handling (Frontend using localStorage)
// =======================================================

document.addEventListener("DOMContentLoaded", function () {

  const postJobForm = document.getElementById("postJobForm");
  const jobContainer = document.getElementById("jobContainer");

  // ---------------------------------------
  // POST JOB PAGE LOGIC
  // ---------------------------------------
  if (postJobForm) {

    postJobForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const jobTitle = document.getElementById("jobTitle").value.trim();
      const companyName = document.getElementById("companyName").value.trim();
      const jobType = document.getElementById("jobType").value;
      const location = document.getElementById("location").value.trim();
      const description = document.getElementById("description").value.trim();

      // Basic validation
      if (
        jobTitle === "" ||
        companyName === "" ||
        jobType === "" ||
        location === "" ||
        description === ""
      ) {
        alert("Please fill all fields");
        return;
      }

      // Job object
      const job = {
        id: Date.now(), // unique id
        title: jobTitle,
        company: companyName,
        type: jobType,
        location: location,
        description: description
      };

      // Get existing jobs or create new array
      const jobs = JSON.parse(localStorage.getItem("hireNestJobs")) || [];

      // Add new job
      jobs.push(job);

      // Save back to localStorage
      localStorage.setItem("hireNestJobs", JSON.stringify(jobs));

      alert("Job posted successfully!");
      postJobForm.reset();
    });
  }

  // ---------------------------------------
  // JOB LIST PAGE LOGIC
  // ---------------------------------------
  if (jobContainer) {

    const jobs = JSON.parse(localStorage.getItem("hireNestJobs")) || [];

    // No jobs case
    if (jobs.length === 0) {
      jobContainer.innerHTML =
        "<p style='color:rgba(255,255,255,0.7);'>No jobs or internships posted yet.</p>";
      return;
    }

    // Render each job
    jobs.forEach(function (job) {

      const jobCard = document.createElement("div");
      jobCard.className = "card";

      jobCard.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Type:</strong> ${job.type}</p>
        <p style="margin-top:6px; color:rgba(255,255,255,0.75);">
          ${job.description}
        </p>
      `;

      jobContainer.appendChild(jobCard);
    });
  }

});
