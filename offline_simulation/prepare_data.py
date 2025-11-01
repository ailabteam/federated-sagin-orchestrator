# offline_simulation/prepare_data.py

import torch
import torchvision
import torchvision.transforms as transforms
from torch.utils.data import DataLoader, Subset
import numpy as np
import os

NUM_CLIENTS = 10
DATA_ROOT = "./data" # Thư mục để lưu dữ liệu

def download_cifar10():
    """Tải bộ dữ liệu CIFAR-10."""
    print("--- 1. Downloading CIFAR-10 dataset ---")
    transform = transforms.Compose(
        [transforms.ToTensor(), transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))]
    )
    if not os.path.exists(DATA_ROOT):
        os.makedirs(DATA_ROOT)
        
    trainset = torchvision.datasets.CIFAR10(root=DATA_ROOT, train=True, download=True, transform=transform)
    testset = torchvision.datasets.CIFAR10(root=DATA_ROOT, train=False, download=True, transform=transform)
    
    print("Dataset downloaded successfully.")
    return trainset, testset

def create_non_iid_partitions(trainset):
    """
    Chia bộ dữ liệu training thành các phần không đồng nhất (non-IID).
    Mỗi client sẽ chỉ có dữ liệu của 2-3 lớp (class).
    """
    print(f"--- 2. Creating non-IID partitions for {NUM_CLIENTS} clients ---")
    
    # Sắp xếp các chỉ số (indices) của dữ liệu theo nhãn (label)
    labels = np.array(trainset.targets)
    indices_by_label = {label: np.where(labels == label)[0] for label in range(10)}
    
    client_indices = {i: [] for i in range(NUM_CLIENTS)}
    
    # Chia các chỉ số thành 20 "mảnh" (shards), mỗi lớp 2 mảnh
    shards = []
    for label in range(10):
        np.random.shuffle(indices_by_label[label])
        # Mỗi shard có 2500 ảnh (50000 ảnh / 10 lớp / 2 shards)
        shards.extend(np.array_split(indices_by_label[label], 2))
        
    np.random.shuffle(shards)
    
    # Phân 2 mảnh cho mỗi client
    for i in range(NUM_CLIENTS):
        # Lấy 2 mảnh từ danh sách shards đã xáo trộn
        shard1, shard2 = shards.pop(), shards.pop()
        client_indices[i] = np.concatenate([shard1, shard2])

    # Tạo DataLoaders cho mỗi client
    client_dataloaders = {}
    for i in range(NUM_CLIENTS):
        subset = Subset(trainset, client_indices[i])
        client_dataloaders[i] = DataLoader(subset, batch_size=32, shuffle=True, num_workers=2)
        
        # Kiểm tra phân phối nhãn của client
        client_labels = labels[client_indices[i]]
        unique_labels, counts = np.unique(client_labels, return_counts=True)
        print(f"  - Client {i}: {len(client_indices[i])} samples, labels: {dict(zip(unique_labels, counts))}")

    print("Non-IID partitions created successfully.")
    return client_dataloaders

# --- Main execution block để chạy và kiểm tra ---
if __name__ == "__main__":
    train_dataset, test_dataset = download_cifar10()
    client_loaders = create_non_iid_partitions(train_dataset)
    
    # Test: Lấy một batch từ client 0
    print("\n--- Testing DataLoader for Client 0 ---")
    first_batch = next(iter(client_loaders[0]))
    images, labels = first_batch
    
    print(f"Shape of image batch from Client 0: {images.shape}") # Mong đợi [32, 3, 32, 32]
    print(f"Shape of label batch from Client 0: {labels.shape}") # Mong đợi [32]
    print("--- Data preparation script finished successfully! ---")
