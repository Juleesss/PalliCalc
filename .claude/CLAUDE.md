This project is a web application that helps palliative care professionals calculate opioid rotations.

The application is a single-page application (SPA) that is built with React.

The ground truth requirements are in the user_requirements.md file.

explore the mentioned sources in the requirements file for more information.

read PRD.md, prd_changes.md for more information about the project.
read Opioid Usage Analysis_ Semmelweis University.md for the background and context of the project.

This project is a **client-side-only opioid rotation calculator** for palliative care teams. It takes one or more current opioid regimens (drug, route, dose, frequency, asymmetrical dosing) and converts them into a single **Oral Morphine Equivalent (OME)** baseline, then computes a **target opioid and dose** with built‑in safety reductions and GFR-based warnings. All business logic must follow the OME flow: current TDD → factor TO OME → sum OMEs → apply % reduction for incomplete cross‑tolerance → factor FROM OME to target drug, including special handling for fentanyl patches and warnings/exclusions for drugs like methadone and nalbuphine. The UI is a **mobile-first SPA** (React/Vue/vanilla) with card-based layout and Hungarian/English text, and it must remain fully offline with **no backend or data storage**.

We use **uv** to manage the Python side of the project (for modelling, prototyping, and testing the OME/conversion logic) in a separate package (e.g. `ome_core`). The expected workflow is: initialize a uv project with `uv init --lib ome_core` under the repo, define pure functions for conversion and safety rules there, manage dependencies via `pyproject.toml` (`uv add ...`), and run tests or scripts with `uv run ...`. The frontend implementation should then mirror the validated logic from this uv‑managed Python package in JavaScript/TypeScript, but **uv is not used for the production frontend build**, only for developing and verifying the calculation engine.