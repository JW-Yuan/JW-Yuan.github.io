# PanNuke 数据集详情

## 数据集描述

PanNuke 是一个大规模的组织病理学数据集，包含来自 19 种不同器官的细胞核标注数据。该数据集提供了丰富的多器官、多类别的细胞核分割和分类标注。

## 数据集基本信息

- **器官类型**：多种器官 (19种：Adrenal_gland, Bile-duct, Bladder, Breast, Cervix, Colon, Esophagus, HeadNeck, Kidney, Liver, Lung, Ovarian, Pancreatic, Prostate, Skin, Stomach, Testis, Thyroid, Uterus)
- **染色方式**：H&E (Hematoxylin and Eosin)
- **数据集大小**：189,744 个细胞核实例，来自超过 20,000 个 WSI
- **图像分辨率**：256×256 像素
- **放大倍数**：40x
- **数据格式**：NumPy 数组格式 (.npy)

## 文件结构

```
PanNuke/
├── Fold1/
│  ├── images.npy：numpy数组，形状[num_images, h, w, 3]，存原始图像（图像数×高×宽×RGB通道）
│  ├── masks.npy：numpy数组，形状[num_images, h, w, 6]，存实例与背景标注
│  └── types.npy：numpy数组，形状[num_images,]，存每张图对应的器官类型（字符串）
├── Fold2/
│  ├── images.npy：与Fold1同名文件的形状、意义完全一致
│  ├── masks.npy：与Fold1同名文件的形状、意义完全一致
│  └── types.npy：与Fold1同名文件的形状、意义完全一致
└── Fold3/
   ├── images.npy：与Fold1同名文件的形状、意义完全一致
   ├── masks.npy：与Fold1同名文件的形状、意义完全一致
   └── types.npy：与Fold1同名文件的形状、意义完全一致
```

## 各文件的核心信息

### 1. images.npy

- **形状**：`[num_images, h, w, 3]`
- **作用**：批量存储原始图像数据，维度对应"图像数量、图像高度、图像宽度、RGB三通道"。

### 2. masks.npy（6个通道的定义）

- **形状**：`[num_images, h, w, 6]`
- **各通道对应内容**：
  - **通道0**：Neoplastic cells（肿瘤细胞），像素值是实例ID（整数，不要求连续，相同ID代表同一实例）
  - **通道1**：Inflammatory cells（炎症细胞），像素值是实例ID（规则同上）
  - **通道2**：Connective/Soft tissue cells（结缔/软组织细胞），像素值是实例ID（规则同上）
  - **通道3**：Dead Cells（死细胞），像素值是实例ID（规则同上）
  - **通道4**：Epithelial cells（上皮细胞），像素值是实例ID（规则同上）
  - **通道5**：background（背景），像素值只有0或1，1代表背景区域（这个部分不参与任何数据的构建）

### 3. types.npy

- **形状**：`[num_images,]`
- **元素类型**：字符串
- **可选值**（共19种器官）：
  - `Adrenal_gland`、`Bile-duct`、`Bladder`、`Breast`、`Cervix`、`Colon`、
  - `Esophagus`、`HeadNeck`、`Kidney`、`Liver`、`Lung`、`Ovarian`、`Pancreatic`、
  - `Prostate`、`Skin`、`Stomach`、`Testis`、`Thyroid`、`Uterus`
- **作用**：标记每张图像对应的器官来源

## 标注情况

### 标注格式

数据集使用 NumPy 数组格式存储标注，每个图像对应一个 6 通道的 mask，其中前 5 个通道分别对应 5 种细胞类型，第 6 个通道为背景。

### 细胞核标注类别

数据集包含以下 5 种细胞核类型：

1. **Neoplastic cells** - 肿瘤细胞
2. **Inflammatory cells** - 炎症细胞
3. **Connective/Soft tissue cells** - 结缔/软组织细胞
4. **Dead Cells** - 死细胞
5. **Epithelial cells** - 上皮细胞

### 标注统计

- **总细胞核实例数**：189,744 个（跨所有 Fold）
- **数据划分**：3 个 Fold（Fold1, Fold2, Fold3）

### 细胞核类别统计

| 细胞核类型 | 数量 | 比例 |
|----------|------|------|
| **Neoplastic Cells** (肿瘤细胞) | 77,403 | 40.79% |
| **Connective/Soft Tissue Cells** (结缔/软组织细胞) | 50,585 | 26.66% |
| **Inflammatory Cells** (炎症细胞) | 32,276 | 17.01% |
| **Epithelial Cells** (上皮细胞) | 26,572 | 14.00% |
| **Dead Cells** (死细胞) | 2,908 | 1.53% |
| **总计** | **189,744** | **100.00%** |

## 数据特点

### 多器官覆盖

数据集涵盖 19 种不同器官，提供了丰富的多器官细胞核标注数据，适用于跨器官的泛化研究。

### 多类别标注

数据集提供了 5 种不同类型的细胞核标注，涵盖了肿瘤、炎症、结缔组织、死细胞和上皮细胞等主要细胞类型。

### 数据划分

数据集分为 3 个 Fold，便于进行交叉验证和模型评估。

## 使用建议

### 数据加载

```python
import numpy as np

# 加载图像
images = np.load('Fold1/images.npy')  # [num_images, 256, 256, 3]

# 加载标注
masks = np.load('Fold1/masks.npy')  # [num_images, 256, 256, 6]

# 加载器官类型
types = np.load('Fold1/types.npy')  # [num_images,]
```

### 数据预处理

1. **图像归一化**：建议对图像进行标准化处理（归一化到 [0, 1] 或使用 ImageNet 均值和标准差）
2. **类别平衡**：注意不同类别细胞核的数量不平衡问题
3. **多任务学习**：可以同时进行分割和分类任务

### 模型选择

1. **细胞核分割**：推荐使用 U-Net、Mask R-CNN、HoVer-Net 等模型
2. **细胞核分类**：推荐使用 ResNet、EfficientNet 等分类模型
3. **多任务学习**：可以同时进行分割和分类任务

### 评估指标

- **分割任务**：使用 Dice 系数、IoU、F1-score
- **分类任务**：使用准确率、精确率、召回率、F1-score、混淆矩阵

## 相关资源

- [数据集下载](https://warwick.ac.uk/fac/cross_fac/tia/data/pannuke/)
- [GitHub 页面](https://jgamper.github.io/PanNukeDataset/)
- [论文链接](https://link.springer.com/chapter/10.1007/978-3-030-23937-4_2)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@inproceedings{pannuke2019,
  title={PanNuke: An Open Pan-Cancer Histology Dataset for Nuclei Instance Segmentation and Classification},
  author={Gamper, Jevgenij and Koohbanani, Navid Alemi and Benet, Ksenija and Khuram, Ali and Rajpoot, Nasir},
  booktitle={European Congress on Digital Pathology},
  pages={11--19},
  year={2019},
  organization={Springer}
}
```

## 注意事项

1. **数据使用许可**：请遵守数据集的使用许可协议
2. **数据格式**：数据以 NumPy 数组格式存储，需要相应的 Python 环境
3. **内存占用**：完整数据集较大，注意内存使用
4. **类别不平衡**：不同类别细胞核数量差异较大，建议使用适当的采样策略或损失函数
