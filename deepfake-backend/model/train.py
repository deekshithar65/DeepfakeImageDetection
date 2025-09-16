import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os

def train_model(
    data_dir="dataset",
    num_epochs=3,
    batch_size=16,
    lr=1e-4,
    save_path="checkpoints/resnet_ffpp.pth"
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🚀 Training on: {device}")

    # Data transforms
    transform = {
        "train": transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ]),
        "val": transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])
    }

    # Load dataset
    train_dataset = datasets.ImageFolder(os.path.join(data_dir, "train"), transform=transform["train"])
    val_dataset = datasets.ImageFolder(os.path.join(data_dir, "val"), transform=transform["val"])

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    # Model: ResNet18
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    for param in model.parameters():  # freeze all layers
        param.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, 2)  # replace last layer for binary classification
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=lr)  # only train final layer

    # Training loop
    for epoch in range(num_epochs):
        model.train()
        total_loss, correct = 0, 0

        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            correct += (outputs.argmax(1) == labels).sum().item()

        train_acc = correct / len(train_dataset)
        print(f"Epoch {epoch+1}/{num_epochs}, Loss: {total_loss:.4f}, Train Acc: {train_acc:.4f}")

        # Validation
        model.eval()
        correct = 0
        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs, labels = imgs.to(device), labels.to(device)
                outputs = model(imgs)
                correct += (outputs.argmax(1) == labels).sum().item()

        val_acc = correct / len(val_dataset)
        print(f"✅ Validation Acc: {val_acc:.4f}")

    # Save trained weights
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save(model.state_dict(), save_path)
    print(f"🎉 Model saved to {save_path}")

if __name__ == "__main__":
    train_model()