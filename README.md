# Letters from Your Future Self

A quiet, meditative web app. You write about what's weighing on you, and your future self — ten years from now — writes back.

---

## Running locally

1. Clone this repo and enter the folder
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_key_here
   DEBUG=true
   ```
4. Run:
   ```
   python app.py
   ```
5. Open `http://localhost:5000`

---

## Deploying to Railway

1. Push to GitHub
2. Create a new project on [railway.app](https://railway.app) and connect your repo
3. Add an environment variable: `ANTHROPIC_API_KEY` = your key
4. Railway will detect the `Procfile` and deploy automatically

---

## File structure

```
letters-future-self/
├── app.py              # Flask backend + Claude API call
├── requirements.txt
├── Procfile            # For Railway deployment
├── .env.example
└── static/
    ├── index.html      # All three screens (write, loading, letter)
    └── script.js       # Screen transitions, API call, animations
```
