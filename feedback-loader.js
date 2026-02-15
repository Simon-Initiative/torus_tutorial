/*************************************************
 * Feedback Modal Loader (Search-style)
 *************************************************/

const FEEDBACK_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwH1QM0zc4DcYXcG0CJIVoien-vj8VmCi0wEUxeEdZX0EbROxx6rWvLgIi2vSHtd9TBIQ/exec";

/* Wire button safely */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".feedback-btn");
  if (!btn) return;
  btn.addEventListener("click", openFeedback);
});

/* Open feedback modal */
window.openFeedback = function () {
  const overlay = document.getElementById("feedbackOverlay");
  const modal = document.getElementById("feedbackModal");

  if (!overlay || !modal) return;

  overlay.hidden = false;
  modal.hidden = false;
  document.body.style.overflow = "hidden";

  modal.innerHTML = `
    <div class="feedback-wrapper search-wrapper" role="dialog" aria-modal="true">

      <!-- Header -->
      <div class="sw-header">
        <svg
  class="sw-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <!-- Taller speech bubble -->
  <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />

  <!-- Dots (spread out more) -->
  <circle cx="8"  cy="11.5" r="1" fill="currentColor" stroke-width="0.8" />
  <circle cx="12" cy="11.5" r="1" fill="currentColor" stroke-width="0.8"/>
  <circle cx="16" cy="11.5" r="1" fill="currentColor" stroke-width="0.8" />
</svg>


        <h2 class="sw-title">Send Feedback</h2>
        <button class="sw-close" data-feedback-close aria-label="Close feedback">
           <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3">
        <line x1="18" y1="6"  x2="6"  y2="18"></line>
        <line x1="6"  y1="6"  x2="18" y2="18"></line>
      </svg>
        </button>
      </div>

      <!-- Form -->
      <form id="feedbackForm" class="feedback-form">

        <div class="field">
          <label>What is your role? *</label>
          <select name="role" required class="sw-input">
            <option value="">Select</option>
            <option>Author</option>
            <option>Instructor</option>
            <option>Student</option>
          </select>
        </div>

        <div class="field">
          <label>Which part of the Tutorial Hub are you commenting on? *</label>
          <input name="section" required class="sw-input" />
        </div>

        <div class="field">
          <label>If you notice an issue, please explain it.</label>
          <textarea name="issue" class="sw-input"></textarea>
        </div>

        <div class="field">
          <label>Optional: Email or contact</label>
          <input name="contact" class="sw-input" />
        </div>

        <div class="sw-actions">
          <button type="submit" class="sw-btn">
            Submit Feedback
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </button>
        </div>

      </form>
    </div>
  `;

  attachFeedbackHandlers();
};

/* Submit + close logic */
function attachFeedbackHandlers() {
  const overlay = document.getElementById("feedbackOverlay");
  const modal = document.getElementById("feedbackModal");
  const form = modal.querySelector("#feedbackForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("timestamp_client", new Date().toISOString());
    formData.append(
      "timezone",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    formData.append("page", window.location.href);

    await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      body: new URLSearchParams(formData),
    });

    form.innerHTML = `
      <div class="sw-results">
        <p><strong>Thank you!</strong></p>
        <p>Your feedback has been submitted.</p>
      </div>
    `;
  });

  const close = () => {
    overlay.hidden = true;
    modal.hidden = true;
    modal.innerHTML = "";
    document.body.style.overflow = "";
  };

  overlay.addEventListener("click", close, { once: true });
  modal
    .querySelectorAll("[data-feedback-close]")
    .forEach((btn) => btn.addEventListener("click", close));
}
