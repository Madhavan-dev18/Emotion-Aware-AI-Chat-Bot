# MoodLens 🧠💬

MoodLens is an emotion-aware AI chat assistant that fuses Natural Language Processing (NLP) with real-time facial telemetry to give Large Language Models genuine emotional context about the user.

By combining text sentiment analysis with a client-side Webcam Neural Net (SSD MobileNet V1), MoodLens understands not just *what* you are saying, but *how* you are feeling while you type it.

## 🏗 Architecture
* **Frontend:** React 19, Vite, TailwindCSS, `face-api.js` (Webcam Telemetry).
* **Backend:** Flask, SQLAlchemy, JWT (HTTPOnly Cookies + CSRF), Flask-Limiter.
* **AI Engine:** Groq API (LLaMA 3), NLTK/Transformers fallback, Safety Crisis Interceptor.

---

## 🚀 Critical Setup: Facial Recognition Models
Because neural network weights are too large for standard Git repositories, **you must download the model files manually** before the frontend visual scanner will work.

1. Download the following shards from the official `@vladmandic/face-api` [model repository](https://github.com/vladmandic/face-api/tree/master/model):
   * `ssd_mobilenetv1_model-weights_manifest.json`
   * `ssd_mobilenetv1_model-shard1` & `shard2`
   * `face_expression_model-weights_manifest.json`
   * `face_expression_model-shard1`
2. Place all downloaded files inside the `frontend/public/models/` directory.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
FLASK_ENV=development         # Use 'production' on live server to enable Secure Cookies
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///moodlens.db
GROQ_API_KEY=gsk_your_groq_key
JWT_SECRET_KEY=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:5173  # Production: [https://your-vercel-app.vercel.app](https://your-vercel-app.vercel.app)
USE_ML_MODELS=false           # Set to true only if running locally with heavy PyTorch