# offline_simulation/simulation.py

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from collections import OrderedDict
import warnings

import flwr as fl
from flwr.common import Metrics
from typing import Dict, List, Tuple

from prepare_data import download_cifar10, create_non_iid_partitions

warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

NUM_CLIENTS = 10
DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

# --- 1. Định nghĩa Mô hình & các hàm Huấn luyện/Đánh giá ---
class Net(nn.Module):
    def __init__(self) -> None:
        super(Net, self).__init__(); self.conv1 = nn.Conv2d(3, 6, 5); self.pool = nn.MaxPool2d(2, 2); self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 5 * 5, 120); self.fc2 = nn.Linear(120, 84); self.fc3 = nn.Linear(84, 10)
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.pool(F.relu(self.conv1(x))); x = self.pool(F.relu(self.conv2(x))); x = x.view(-1, 16 * 5 * 5)
        x = F.relu(self.fc1(x)); x = F.relu(self.fc2(x)); x = self.fc3(x)
        return x

def train(net, trainloader, epochs):
    criterion = torch.nn.CrossEntropyLoss(); optimizer = torch.optim.SGD(net.parameters(), lr=0.001, momentum=0.9)
    net.train();
    for _ in range(epochs):
        for images, labels in trainloader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad(); loss = criterion(net(images), labels); loss.backward(); optimizer.step()

def test(net, testloader):
    criterion = torch.nn.CrossEntropyLoss(); correct, total, loss = 0, 0, 0.0
    net.eval()
    with torch.no_grad():
        for images, labels in testloader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = net(images); loss += criterion(outputs, labels).item()
            _, predicted = torch.max(outputs.data, 1); total += labels.size(0); correct += (predicted == labels).sum().item()
    accuracy = correct / total if total > 0 else 0
    return loss, accuracy

# --- 2. Định nghĩa Flower Client ---
class FlowerClient(fl.client.NumPyClient):
    def __init__(self, net, trainloader, testloader):
        self.net = net; self.trainloader = trainloader; self.testloader = testloader
    def get_parameters(self, config): return [val.cpu().numpy() for _, val in self.net.state_dict().items()]
    def set_parameters(self, parameters):
        params_dict = zip(self.net.state_dict().keys(), parameters); state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
        self.net.load_state_dict(state_dict, strict=True)
    def fit(self, parameters, config):
        self.set_parameters(parameters); train(self.net, self.trainloader, epochs=1)
        return self.get_parameters(config={}), len(self.trainloader.dataset), {}
    def evaluate(self, parameters, config):
        self.set_parameters(parameters); loss, accuracy = test(self.net, self.testloader)
        return float(loss), len(self.testloader.dataset), {"accuracy": float(accuracy)}
            
def client_fn(cid: str) -> FlowerClient:
    net = Net().to(DEVICE)
    trainloader = trainloaders[int(cid)]
    testloader = valloader
    return FlowerClient(net, trainloader, testloader)

# --- 3. Main execution block ---
if __name__ == "__main__":
    print(f"--- Starting Federated Learning Simulation on {DEVICE} ---")

    train_dataset, test_dataset = download_cifar10()
    trainloaders = create_non_iid_partitions(train_dataset)
    valloader = DataLoader(test_dataset, batch_size=64)

    def weighted_average(metrics: List[Tuple[int, Metrics]]) -> Metrics:
        accuracies = [num_examples * m["accuracy"] for num_examples, m in metrics]
        examples = [num_examples for num_examples, _ in metrics]
        return {"accuracy": sum(accuracies) / sum(examples)}

    strategy = fl.server.strategy.FedAvg(
        fraction_fit=0.5, fraction_evaluate=0.5, min_fit_clients=5,
        min_evaluate_clients=5, min_available_clients=NUM_CLIENTS,
        evaluate_metrics_aggregation_fn=weighted_average,
    )

    history = fl.simulation.start_simulation(
        client_fn=client_fn, num_clients=NUM_CLIENTS,
        config=fl.server.ServerConfig(num_rounds=100),
        strategy=strategy,
        client_resources={"num_gpus": 0.2, "num_cpus": 2} if DEVICE.type == "cuda" else {"num_cpus": 2},
    )
    
    print("\n--- Simulation Finished ---")
    print("Training history (distributed evaluation accuracy per round):")
    
    # === SỬA LỖI Ở ĐÂY ===
    if "accuracy" in history.metrics_distributed:
        accuracies = history.metrics_distributed["accuracy"]
        for round_num, acc_value in accuracies:
            print(f"  - Round {round_num}: {acc_value:.4f}")
    else:
        print("Could not find 'accuracy' in distributed metrics.")
        print("Full history:", history)

    print("\n--- Federated Learning script finished successfully! ---")
