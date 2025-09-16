import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import os
from .utils import grad_cam

class DeepfakeDetector:
    def __init__(self, checkpoint_path="checkpoints/resnet_ffpp.pth"):
        # Load ResNet-18 and adapt final layer for 2 classes
        self.model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        self.model.fc = nn.Linear(self.model.fc.in_features, 2)

        # Load trained weights if available
        if os.path.exists(checkpoint_path):
            self.model.load_state_dict(torch.load(checkpoint_path, map_location="cpu"))
            print(f"✅ Loaded trained model from {checkpoint_path}")
        else:
            print("⚠ No trained model found, using default ImageNet weights")

        self.model.eval()

        # Preprocessing pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])

        # Define class labels (order matches model output indices)
        self.classes = ["real", "fake"]

    def predict_with_heatmap(self, image_path, output_folder):
        img = Image.open(image_path).convert("RGB")
        x = self.transform(img).unsqueeze(0)

        with torch.no_grad():
            outputs = self.model(x)
            probs = torch.nn.functional.softmax(outputs, dim=1)[0]
            pred_class = torch.argmax(probs).item()

        label = self.classes[pred_class]
        confidence = float(probs[pred_class].item())

        base_name = os.path.splitext(os.path.basename(image_path))[0]
        heatmap_path = os.path.join(output_folder, f"{base_name}_heatmap.jpg")

        try:
            grad_cam(self.model, x, image_path, heatmap_path)
        except Exception as e:
            print("❌ Grad-CAM error:", str(e))
            heatmap_path = None

        return label, confidence, heatmap_path