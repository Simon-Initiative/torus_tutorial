const form = document.getElementById("feedbackForm");

form.addEventListener("submit", e => {
  e.preventDefault();

  fetch("https://script.google.com/macros/s/AKfycbwTdBpSEDirKJp2KDqHT56N6TNwEx9zkVvGsTRBLc1TL70lTJ_ERmjSWky3UG6gbwYQ6g/exec", {
    method: "POST",
    body: new URLSearchParams(new FormData(form)),
    mode: "no-cors"
  }).then(() => {
    alert("submitted");
    closeFeedback();
  });
});
