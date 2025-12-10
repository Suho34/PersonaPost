# PersonaPost - AI Brand Voice Agent

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Vector_Search-green)
![AI](https://img.shields.io/badge/AI-RAG_Pipeline-orange)

> **Social media on autopilot, grounded in your real brand voice.**

PersonaPost is a full-stack SaaS application that solves the "Generic AI" problem. Instead of generating generic content, it scrapes a user's website, creates a vector knowledge base of their unique tone/style, and uses **Retrieval-Augmented Generation (RAG)** to draft highly relevant social media posts automatically every day.

---

## 🚀 Key Features

* **🕵️‍♂️ Smart Onboarding:** Automated web scraper (Cheerio) that visits a user's URL to extract brand context.
* **🧠 Long-Term Memory (RAG):** Chunks and embeds website data into **MongoDB Atlas Vector Search** using Google's `text-embedding-004` model.
* **🤖 Automated Agents:** A Vercel Cron Job runs daily, acting as an autonomous agent to generate fresh drafts for every user without manual input.
* **🎨 Sophisticated Dashboard:** A responsive, "International Modern" UI built with Tailwind CSS and Lucide React.
* **🔐 Secure Authentication:** Implemented via **BetterAuth** with Google OAuth.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 15 (App Router)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **State Management:** React Hooks + Server Actions

### Backend & Infrastructure
* **Runtime:** Node.js (Vercel Serverless Functions)
* **Database:** MongoDB Atlas (Mongoose for App Data, Native Driver for Auth)
* **Authentication:** BetterAuth
* **Scheduling:** Vercel Cron Jobs

### Artificial Intelligence
* **LLM:** Google Gemini 1.5 Flash (Low latency, high throughput)
* **Embeddings:** Google `text-embedding-004` (768 Dimensions)
* **Vector Store:** MongoDB Atlas Vector Search

---

## 🏗️ System Architecture

PersonaPost uses a RAG pipeline to ensure high-fidelity generation:

1.  **Ingestion:** User saves a URL -> Server scrapes HTML -> Cleans & Chunks text.
2.  **Embedding:** Chunks are passed to Google's Embedding API -> Returned vectors are stored in MongoDB.
3.  **Retrieval:** When generating a post, the system converts the topic into a vector -> Performs a **Cosine Similarity Search** in MongoDB to find the 5 most relevant context chunks.
4.  **Generation:** The LLM receives a prompt containing the retrieved context chunks + the user's topic to generate a final post.

---

## ⚡ Getting Started

### Prerequisites
* Node.js 18+
* MongoDB Atlas Account (Free Tier works)
* Google AI Studio API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/personapost.git](https://github.com/yourusername/personapost.git)
    cd personapost
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    # Database
    MONGODB_URI=your_mongodb_connection_string

    # AI
    GEMINI_API_KEY=your_google_gemini_key

    # Auth (BetterAuth)
    BETTER_AUTH_SECRET=your_random_secret_string
    BETTER_AUTH_URL=http://localhost:3000
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # Automation
    CRON_SECRET=your_secure_cron_secret
    ```

4.  **Database Setup (Crucial)**
    You must create a Vector Search Index in MongoDB Atlas for the `voicechunks` collection:
    ```json
    {
      "fields": [
        {
          "type": "vector",
          "path": "embedding",
          "numDimensions": 768,
          "similarity": "cosine"
        }
      ]
    }
    ```

5.  **Run the application**
    ```bash
    npm run dev
    ```

---

## 🧪 Testing the Automation

To test the daily agent locally without waiting for the schedule:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/generate-daily