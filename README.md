# MedExtract AI 🩺🤖

**MedExtract AI** is a full-stack, AI-powered medical report analysis application designed to ingest, process, and extract structured clinical insights from raw medical notes and laboratory reports using Django, Celery, React (Vite), PostgreSQL, and Google GenAI APIs.

---

## 🚀 Features & Architecture

* **Automated Data Ingestion:** Securely ingests clinical notes, medical lab summaries, and diagnostic case files into a normalized relational database.
* **Asynchronous Background Processing:** Utilizes **Celery** with message brokers to handle heavy AI extraction workflows asynchronously without blocking user requests.
* **AI-Powered Extraction:** Leverages **Google GenAI** models to parse unstructured medical text into structured parameters, symptoms, and diagnoses.
* **Modern Full-Stack Dashboard:** Built with a high-performance **React + Vite** frontend and a robust **Django REST API** backend.
* **Robust Pipeline Testing:** Integrated with public medical test datasets (such as `BI55/MedText`) to validate end-to-end ingestion and extraction workflows.

---

## 🛠️ Tech Stack

### **Backend:**
* **Framework:** Python, Django, Django REST Framework (DRF)
* **Task Queue / Background Workers:** Celery
* **Database:** PostgreSQL
* **AI Integration:** Google GenAI APIs
* **Data Pipelines:** Hugging Face Datasets (`datasets` library for streaming clinical evaluation data)

### **Frontend:**
* **Framework:** React (Vite)
* **Styling & UI:** Modern CSS / Responsive Components
* **API Client:** Axios / Fetch API

---

## 📁 Project Structure

```text
medextract-ai/
├── backend/
│   ├── api/                 # Main Django application (Models, Views, Serializers)
│   │   ├── migrations/      # Database migrations
│   │   ├── testdataset/     # Dataset streaming and backend integration tests
│   │   ├── models.py        # Relational models (MedicalReport, CustomUser, etc.)
│   │   └── views.py         # API endpoints
│   ├── medextract/          # Django project settings & configuration (WSGI/ASGI)
│   ├── manage.py            # Django management script
│   └── requirements.txt     # Python package dependencies
├── frontend/                # React + Vite frontend application
│   ├── src/                 # Components, pages, and API integration hooks
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite bundler configuration
└── README.md                # Project documentation