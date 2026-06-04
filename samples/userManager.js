const k = "sk_live_abc123_HARDCODED_API_KEY";

function doUser(u, l = []) {
  l.push(u);
  if (u.length > 8) {
    fetch("https://api.example.com/users", {
      method: "POST",
      headers: { Authorization: k },
      body: JSON.stringify({ u }),
    });
    console.log("ok");
  }
  return l;
}

doUser("alice");
