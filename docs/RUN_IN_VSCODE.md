# Run FairTrip in VS Code — from scratch (Windows)

Do **one command at a time** in the VS Code terminal (PowerShell). Paste a line, press Enter, wait for it to finish.

## 0. Install these once
| Tool | Version | Get it |
|---|---|---|
| Python | **3.12** (3.14 breaks `pydantic_core` right now) | python.org — tick **"Add python.exe to PATH"** |
| Node.js | LTS (18+) | nodejs.org |
| PostgreSQL | 16 | postgresql.org — remember the `postgres` password you set |
| Tesseract OCR | latest | github.com/UB-Mannheim/tesseract/wiki — needed only for Scan & Check |
| VS Code | latest | Install the **Python** extension |

Check in a new terminal:
```
python --version
node --version
```
(If you have several Python versions, use `py -3.12 --version`.)

## 1. Open the project
VS Code → **File → Open Folder** → select the `fairtrip` folder (the one that contains `README.md`).
Then **Terminal → New Terminal**. The prompt should be `PS E:\...\fairtrip>`.

## 2. Create the environment file
```
copy .env.example .env
```
Optional: open `.env` and add a line `GROQ_API_KEY=your_key` to turn on the LLM explanations. Without it, the offline template is used.

## 3. Create the database
```
psql -U postgres -c "CREATE USER fairtrip WITH PASSWORD 'fairtrip_dev_pw';"
```
```
psql -U postgres -c "CREATE DATABASE fairtrip OWNER fairtrip;"
```
```
$env:PGPASSWORD = "fairtrip_dev_pw"
```
```
psql -h localhost -U fairtrip -d fairtrip -f backend\app\database\schema.sql
```
If you see `already exists` messages, the database was created before. That is fine.
If `psql` is not recognised: open **SQL Shell (psql)** from the Start menu and run the same commands there, or add PostgreSQL's `bin` folder to PATH.

## 4. Create a virtual environment and install packages
```
py -3.12 -m venv .venv
```
```
.\.venv\Scripts\Activate.ps1
```
If PowerShell blocks the activation script, run this once and try again:
```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
You should now see `(.venv)` at the start of the prompt.
```
pip install -r backend\requirements.txt
```

## 5. Train the two models (once per machine)
```
cd ml\training
```
```
python train_model.py
```
This writes the price model (`fairtrip_model.pkl`) and prints MAE / RMSE / R².
```
python train_cbow.py
```
This writes the next-word model (`cbow.npz`) and prints held-out accuracy.
```
cd ..\..
```

## 6. Start the backend (Terminal 1)
```
cd backend
```
```
uvicorn app.main:app --reload --port 8000
```
Leave this terminal running. Check http://localhost:8000/api/health — it should say `"status":"ok"`.
Open http://localhost:8000/docs to try the API.

## 7. Start the frontend (Terminal 2)
Click the **+** in the terminal panel for a second terminal. It does **not** need the venv.
```
cd frontend
```
```
npm install
```
(first time only; takes a few minutes)
```
npm run dev
```
Open **http://localhost:5173**.

## 8. Show the demo
1. **Check a Price** → click a demo chip (e.g. *Mumbai · Airport → Andheri*) → **Analyze Price**.
2. On the **Result** page, scroll to **AI Trip Assistant**. Switch between English and मराठी, copy the driver line.
3. **Community Reports** → type `driver refused to` in the notes box → click a suggested word chip.
4. **Scan & Check** → upload `docs\samples\taxi_rate_card.png` (needs Tesseract).
5. **Transparency** → show the real metrics.

## Troubleshooting
| Problem | Fix |
|---|---|
| `pydantic_core ... _pydantic_core` error | Your venv uses Python 3.14. Delete `.venv` and redo step 4 with `py -3.12`. |
| `cd backend\backend` / `cd` error | You are already inside `backend`. Run only the next command. |
| Health says `database: unavailable` | Start PostgreSQL (Windows Services → postgresql-x64-16) and check step 3. |
| `ml_model: unavailable` | Run step 5 (`train_model.py`). |
| Next-word chips never appear | Run `python train_cbow.py` inside `ml\training`, then restart the backend. |
| `tesseract` / OCR error | Install Tesseract and check the path in `backend\app\routes\ocr.py`. |
| Port 8000 or 5173 already in use | Close the old terminal, or run the command with another port number. |
| AI card says Offline template | That is expected without `GROQ_API_KEY`. Add the key in `.env` and restart the backend. |
| Changed `.env` but no effect | Stop the backend (Ctrl+C) and start it again. |
