import torch
import cv2
import numpy as np
import os

def grad_cam(model, input_tensor, original_img_path, output_path):
    """
    Generate Grad-CAM heatmap for a given image and save it.
    
    Args:
        model: PyTorch model
        input_tensor: preprocessed image tensor (1, C, H, W)
        original_img_path: path to the original image
        output_path: path to save the heatmap overlay
    
    Returns:
        output_path if successful
    """
    try:
        # Use the last convolutional layer of ResNet18
        target_layer = model.layer4[-1].conv2  # Updated for ResNet18

        gradients = []
        activations = []

        # Hooks to capture forward and backward passes
        def forward_hook(module, inp, out):
            activations.append(out)

        def backward_hook(module, grad_in, grad_out):
            gradients.append(grad_out[0])

        target_layer.register_forward_hook(forward_hook)
        target_layer.register_backward_hook(backward_hook)

        # Forward pass
        output = model(input_tensor)
        pred_class = output.argmax(dim=1).item()

        # Backward pass
        model.zero_grad()
        class_score = output[0, pred_class]
        class_score.backward()

        # Get captured activations and gradients
        grads = gradients[0].cpu().data.numpy()[0]
        acts = activations[0].cpu().data.numpy()[0]

        # Compute weights
        weights = np.mean(grads, axis=(1,2))
        cam = np.zeros(acts.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * acts[i]

        # ReLU and normalize
        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (224, 224))
        cam -= np.min(cam)
        cam /= (np.max(cam) + 1e-8)  # prevent divide by zero

        # Read original image
        img = cv2.imread(original_img_path)
        img = cv2.resize(img, (224, 224))

        # Apply heatmap
        heatmap = cv2.applyColorMap(np.uint8(255*cam), cv2.COLORMAP_JET)
        overlay = np.float32(heatmap) + np.float32(img)
        overlay = 255 * overlay / np.max(overlay)

        # Ensure output folder exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cv2.imwrite(output_path, np.uint8(overlay))
        return output_path

    except Exception as e:
        print(f"❌ Grad-CAM error: {e}")
        return None