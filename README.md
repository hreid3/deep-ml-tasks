# Deep ML Tasks

Part of the AI.biz Machine Learning Infrastructure

A powerful Next.js microservice powering AI's machine learning capabilities. This service provides enterprise-grade ML capabilities through RESTful APIs, enabling seamless integration of AI features into your applications.

## 🚀 Features

- 🧠 NLP Tasks
  - Text Embeddings Generation - Transform text into high-dimensional vectors
  - Text Classification
  - Summarization
  - Named Entity Recognition (Coming Soon)

## 📚 API Documentation

Interactive API documentation is available at `/api-doc` when running the application. Built with OpenAPI/Swagger, it provides:
- 🔍 Interactive API testing console
- 📋 Request/response schemas
- 💡 Example payloads
- 🔒 Authentication details

## 🛠️ Development

### Prerequisites
- Node.js >= 18
- npm >= 9

### Setup
1. Clone the repository:
```bash
git clone https://github.com/ai-biz/deep-ml-tasks.git
cd deep-ml-tasks
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with required environment variables:
```env
HUGGING_FACE_TOKEN=your_token_here
```

4. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000/api-doc` to explore the API documentation.

## 🤝 Contributing

This repository is part of AI.biz's AI product suite. For contribution guidelines, please contact the AI.biz development team.

## 📝 License
