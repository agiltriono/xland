document.addEventListener("DOMContentLoaded",function() {
  var invite_url = "https://discord.com/api/oauth2/authorize?client_id=889476454004457503&permissions=8&scope=bot%20applications.commands";
  var support_url = "/"
  var path = window.location.pathname;
  if (document.querySelectorAll(".invite") != null || document.querySelectorAll(".support") != null) {
    document.querySelectorAll(".invite").forEach( el => {
      el.addEventListener("click", e => {
        window.location.href = invite_url
      })
    })
    document.querySelectorAll(".support").forEach( el => {
      el.addEventListener("click", e => {
        window.location.href = support_url
      })
    })
  }
  if (path === "/") {
    document.getElementById("home").remove()
  } else {
    document.getElementById("command").remove()
  }
})