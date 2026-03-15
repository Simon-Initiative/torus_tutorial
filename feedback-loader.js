/*************************************************
 * Feedback Modal Loader (Search-style)
 *************************************************/

const FEEDBACK_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyC5Oe1UgXd7gjtCexS9hYJiHh7XObWM1zcRT4FLlX8Lnoweu_LNX8bFp4dGNWzjr-Rew/exec";

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
          <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <circle cx="8"  cy="11.5" r=".5" fill="currentColor" />
          <circle cx="12" cy="11.5" r=".5" fill="currentColor" />
          <circle cx="16" cy="11.5" r=".5" fill="currentColor" />
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

    try {
      await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        mode: "no-cors", 
        body: new URLSearchParams(formData),
      });
    } catch (err) {
      console.warn("Feedback submission failed:", err);
    }

    form.innerHTML = `
      <div class="sw-results">
        <p><strong>Thank you!</strong></p>
        <p>Your feedback has been submitted.</p>
        <p>If you included your email, our team may follow up with you.</p>
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
