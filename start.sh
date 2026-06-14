#!/bin/bash

echo "=========================================="
echo "   AI-Enhanced Freelancer Marketplace"
echo "=========================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 not found! Please install Python 3.10+"
    exit 1
fi

# Create virtual environment
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate and install
source venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Create model directory and train model
mkdir -p saved_model
if [ ! -f "saved_model/freelancer_match_model.pkl" ]; then
    echo "Training ML model..."
    cd ml
    python train_model.py
    cd ..
fi

echo ""
echo "=========================================="
echo "   Starting Application..."
echo "=========================================="
echo ""
echo "Frontend: Open frontend/html/index.html"
echo "Backend:  http://localhost:5000"
echo ""
echo "Demo Accounts:"
echo "  Freelancer: rahul@demo.com / demo123"
echo "  Client: client@demo.com / demo123"
echo "=========================================="
echo ""

# Start Flask
python app.py
