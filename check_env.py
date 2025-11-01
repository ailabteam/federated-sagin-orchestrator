# check_env.py
import torch
import flwr as fl

print("--- Starting PoC #3 Environment Check ---")
try:
    # 1. Check PyTorch and CUDA
    print(f"PyTorch version: {torch.__version__}")
    cuda_ok = torch.cuda.is_available()
    print(f"CUDA available: {cuda_ok}")
    if not cuda_ok: raise RuntimeError("CUDA not found by PyTorch")
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")

    # 2. Check Flower
    print(f"Flower (flwr) version: {fl.__version__}")

    # 3. Check Simulation Engine
    from flwr.simulation import start_simulation
    print("Flower simulation engine imported successfully.")

    print("\n--- ✅ All Checks Passed! Environment is ready for Federated Learning. ---")

except Exception as e:
    print(f"\n--- ❌ Check Failed: {e} ---")
