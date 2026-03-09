# ── Courses (mock content — intentionally hardcoded) ─────────────────────────
COURSES = [
    {
        "id": "ifb220",
        "title": "IFB220: Data Technologies",
        "subtitle": "Semester 1, 2026",
        "instructor": "Dr. Sam Willis",
        "colorFrom": "#2563EB",
        "colorTo": "#4F46E5",
    },
    {
        "id": "iab230",
        "title": "IAB230: Enterprise Architecture",
        "subtitle": "Semester 1, 2026",
        "instructor": "Prof. Linda Ho",
        "colorFrom": "#0891B2",
        "colorTo": "#0369A1",
    },
    {
        "id": "capstone",
        "title": "Research: XAI & MIMIC-III",
        "subtitle": "Project Unit",
        "instructor": "Dr. Sam Willis",
        "colorFrom": "#059669",
        "colorTo": "#0D9488",
    },
]

# ── Modules (mock content — intentionally hardcoded) ─────────────────────────
MODULES: dict = {
    "ifb220": [
        {
            "id": "module-1",
            "title": "Module 1: Introduction to Explainable AI (XAI)",
            "week": "Week 1",
            "items": [
                {"label": "Lecture Slides", "type": "PDF", "badge": "PDF", "is_assignment": False},
                {"label": "Reading: EBMs and Clinical Data", "type": "Link", "badge": "Reading", "is_assignment": False},
            ],
        },
        {
            "id": "module-2",
            "title": "Module 2: MIMIC-III Dataset & Preprocessing",
            "week": "Week 2",
            "items": [
                {"label": "Jupyter Notebook Setup", "type": "Code", "badge": "Notebook", "is_assignment": False},
                {
                    "label": "Assignment 1: ICU Readmission Prediction Model",
                    "type": "Assignment",
                    "badge": "Assignment",
                    "is_assignment": True,
                },
            ],
        },
        {
            "id": "module-3",
            "title": "Module 3: Model Interpretability Techniques",
            "week": "Week 3",
            "items": [
                {"label": "SHAP Values Deep Dive", "type": "PDF", "badge": "PDF", "is_assignment": False},
                {"label": "EBM vs SHAP Comparison", "type": "Link", "badge": "Reading", "is_assignment": False},
                {"label": "Lab 1: SQL Fundamentals", "type": "Assignment", "badge": "Assignment", "is_assignment": True},
            ],
        },
        {
            "id": "module-4",
            "title": "Module 4: Clinical NLP & LLMs",
            "week": "Week 4",
            "items": [
                {"label": "Clinical NLP Overview", "type": "PDF", "badge": "PDF", "is_assignment": False},
                {"label": "LLM Literature Review", "type": "Assignment", "badge": "Assignment", "is_assignment": True},
            ],
        },
    ],
    "iab230": [
        {
            "id": "module-1",
            "title": "Module 1: Enterprise Architecture Fundamentals",
            "week": "Week 1",
            "items": [
                {"label": "Lecture Slides", "type": "PDF", "badge": "PDF", "is_assignment": False},
                {"label": "TOGAF Overview", "type": "Link", "badge": "Reading", "is_assignment": False},
            ],
        },
        {
            "id": "module-2",
            "title": "Module 2: Architecture Frameworks",
            "week": "Week 2",
            "items": [
                {"label": "Framework Comparison", "type": "PDF", "badge": "PDF", "is_assignment": False},
                {"label": "Assignment 1: Architecture Assessment", "type": "Assignment", "badge": "Assignment", "is_assignment": True},
            ],
        },
    ],
    "capstone": [
        {
            "id": "module-1",
            "title": "Module 1: DTA Prototype Kickoff",
            "week": "Week 1",
            "items": [
                {"label": "Project Brief", "type": "PDF", "badge": "PDF", "is_assignment": False},
                {"label": "Milestone 1: Frontend Setup", "type": "Assignment", "badge": "Assignment", "is_assignment": True},
            ],
        },
        {
            "id": "module-2",
            "title": "Module 2: K-GRS Algorithm",
            "week": "Week 2",
            "items": [
                {"label": "K-GRS Paper", "type": "Link", "badge": "Reading", "is_assignment": False},
                {"label": "K-GRS Algorithm Draft", "type": "Assignment", "badge": "Assignment", "is_assignment": True},
            ],
        },
    ],
}
