# model/_init_.py
from .deepfake_model import DeepfakeDetector
from . import utils

_all_ = ["DeepfakeDetector", "utils"]