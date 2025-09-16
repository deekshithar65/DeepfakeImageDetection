# backend/config.py
import os

# Base directory of the backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Folders
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")
CHECKPOINT_FOLDER = os.path.join(BASE_DIR, "checkpoints")
DATASET_FOLDER = os.path.join(BASE_DIR, "dataset")

# Model checkpoint file
CHECKPOINT_PATH = os.path.join(CHECKPOINT_FOLDER, "resnet_ffpp.pth")

# Training parameters
BATCH_SIZE = 16
NUM_EPOCHS = 3
LEARNING_RATE = 1e-4

# Server configuration
HOST = "0.0.0.0"
PORT = 5000
DEBUG = True