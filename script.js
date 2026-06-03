const client = supabase.createClient(
  "https://xcajzwqytzhcdedfdkbw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYWp6d3F5dHpoY2RlZGZka2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzcxODUsImV4cCI6MjA5NjA1MzE4NX0.L2m4IeRiAKBGcUPPSTOUkeSzvlSyk_0b59SxkrK-lsk"
)
function showPage(pageId) {

  // hide all pages
  const pages = document.querySelectorAll(".page")

  pages.forEach(page => {
    page.style.display = "none"
  })

  // show selected page
  document.getElementById(pageId).style.display = "block"
}
async function testSignup() {
  const { data, error } = await client.auth.signUp({
    email: "test@gmail.com",
    password: "123456"
  })

  console.log(data, error)
}