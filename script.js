const apiKey = "cde2edfd98ec4687a6a1f75008d0d86b"; // NewsAPI
const newsContainer = document.getElementById("news-container");

// Fetch news by category
function fetchCategory(category) {
  const url = `https://newsapi.org/v2/everything?q=${category}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
  fetchNews(url);
}

// Search news
function searchNews() {
  const query = document.getElementById("search").value;
  if (!query) return;
  const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
  fetchNews(url);
}

// Fetch and display articles
function fetchNews(url) {
  newsContainer.innerHTML = "<h2>Loading news...</h2>";

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.articles || data.articles.length === 0) {
        newsContainer.innerHTML = "<h3>No articles found</h3>";
        return;
      }

      newsContainer.innerHTML = "";
      data.articles.forEach((article) => {
        const articleCard = document.createElement("div");
        articleCard.className = "article";

        articleCard.innerHTML = `
          <img src="${article.urlToImage || 'https://via.placeholder.com/300'}" alt="News Image">
          <h3>${article.title}</h3>
          <p><strong>Source:</strong> ${article.source.name}</p>
          <button class="toggle-btn">Show More</button>
          <div class="extra-content" style="display: none;">
            <p><strong>Author:</strong> ${article.author || "N/A"}</p>
            <p>${article.description || "No description available."}</p>
            <a href="${article.url}" target="_blank">Read Full Article</a>
            <br/><br/>
            <button class="summarize-btn">🧠 Summarize</button>
          </div>
        `;

        const toggleBtn = articleCard.querySelector(".toggle-btn");
        const extraContent = articleCard.querySelector(".extra-content");
        const summarizeBtn = articleCard.querySelector(".summarize-btn");

        toggleBtn.addEventListener("click", () => {
          extraContent.style.display = extraContent.style.display === "none" ? "block" : "none";
          toggleBtn.textContent = extraContent.style.display === "none" ? "Show More" : "Show Less";
        });

        summarizeBtn.addEventListener("click", () => {
          const textToSummarize = article.title + "\n\n" + article.description;
          summarizeArticle(textToSummarize);
        });

        newsContainer.appendChild(articleCard);
      });
    })
    .catch((err) => {
      console.error("Error fetching news:", err);
      newsContainer.innerHTML = "<h3>Something went wrong. Please try again later.</h3>";
    });
}

// ✅ Updated: Call Gemini via LOCAL backend
function summarizeArticle(content) {
  fetch("http://localhost:5000/api/summarize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.summary) {
        const summarySection = document.getElementById("summary-list");

        summarySection.innerHTML += `
          <div class="summary-item">
            <h4>🧠 Summary</h4>
            <p>${data.summary.replace(/\n/g, "<br>")}</p>
            <hr/>
          </div>
        `;
        alert("✅ Summary added to My Summaries");
      } else {
        alert("❌ Backend didn’t return a valid summary. Check console.");
        console.log(data);
      }
    })
    .catch((err) => {
      console.error("❌ Error from backend:", err);
      alert("Error talking to the backend");
    });
}

// Show My Summaries section
function showSummaries() {
  document.getElementById("news-container").style.display = "none";
  document.querySelector(".categories").style.display = "none";
  document.getElementById("summaries-section").style.display = "block";
}

// Optional: Back to news from summaries
function goBackToNews() {
  document.getElementById("summaries-section").style.display = "none";
  document.querySelector(".categories").style.display = "flex";
  document.getElementById("news-container").style.display = "grid";
}

// Load default news
window.onload = () => fetchCategory("technology");
