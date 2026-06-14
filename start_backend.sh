#!/bin/bash

echo "=================================="
echo "AI-Enhanced Freelancer Marketplace"
echo "Backend Setup & Start"
echo "=================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 not found! Please install Python 3.10+"
    exit 1
fi

# Navigate to backend folder
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Train ML model if not exists
if [ ! -f "ml/saved_model/freelancer_match_model.pkl" ]; then
    echo "Training ML model..."
    cd ml
    python train_model.py
    cd ..
fi

echo ""
echo "=================================="
echo "Starting FastAPI Server..."
echo "=================================="
echo ""
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""

# Start FastAPI server
python app.py
