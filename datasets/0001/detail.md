# PUMA 数据集详情

## 数据集描述

PUMA (Pathology Understanding through Multi-scale Analysis) 是一个用于黑色素瘤组织病理学分析的数据集。该数据集包含原发性和转移性黑色素瘤的ROI（感兴趣区域）图像，提供了详细的细胞核和组织级别的注释。

## 数据集基本信息

- **器官类型**：黑色素瘤 (Melanoma)
- **染色方式**：H&E (Hematoxylin and Eosin)
- **数据集大小**：206 个 ROI
  - 原发性：103 个 ROI
  - 转移性：103 个 ROI
- **图像分辨率**：
  - Patch 图像：1024×1024 像素
  - Context 图像：5120×5120 像素
- **放大倍数**：40x
- **扫描仪**：Nanozoomer XR C12000–21/–22

## 文件结构

```
PUMA/
├── primary/                    # 原发性黑色素瘤
│   ├── images/                # 原始图像
│   │   ├── patches/           # 1024×1024 补丁图像
│   │   └── contexts/          # 5120×5120 上下文图像
│   ├── annotations/           # 标注文件
│   │   ├── nuclei/            # 细胞核级别标注
│   │   └── tissue/            # 组织级别标注
│   └── metadata/              # 元数据信息
├── metastatic/                 # 转移性黑色素瘤
│   ├── images/
│   │   ├── patches/
│   │   └── contexts/
│   ├── annotations/
│   │   ├── nuclei/
│   │   └── tissue/
│   └── metadata/
├── README.md                  # 数据集说明文档
└── LICENSE                    # 许可证文件
```

## 标注情况

### 标注格式

数据集提供了两种级别的标注：

1. **细胞核级别标注** (Nuclei Annotations)
   - 包含10个类别的细胞核标注
   - 格式：多边形或点标注

2. **组织级别标注** (Tissue Annotations)
   - 包含6个类别的组织区域标注（包括背景）
   - 格式：多边形区域标注

### 细胞核标注类别

数据集包含以下10种细胞核类型：

1. **Tumor** - 肿瘤细胞核
2. **Stroma** - 间质细胞核
3. **Vascular endothelium** - 血管内皮细胞核
4. **Histiocyte** - 组织细胞核
5. **Melanophage** - 黑色素吞噬细胞核
6. **Lymphocyte** - 淋巴细胞核
7. **Plasma cell** - 浆细胞核
8. **Neutrophil** - 中性粒细胞核
9. **Apoptotic cell** - 凋亡细胞核
10. **Epithelium** - 上皮细胞核

### 组织标注类别

数据集包含以下6种组织类型（包括背景）：

1. **Tumor** - 肿瘤组织
2. **Stroma** - 间质组织
3. **Epidermis** - 表皮组织
4. **Necrosis** - 坏死组织
5. **Blood vessel** - 血管组织
6. **Background** - 背景区域

### 标注工具

标注工作使用专业的病理学标注工具完成，所有标注均经过**病理学专家**审核。

### 标注统计

- **总ROI数量**：206 个
- **平均每个ROI的细胞核数量**：约 500-2000 个
- **标注完成度**：100%（所有ROI均已完成标注）

## 数据特点

### 多尺度设计

数据集采用多尺度设计，提供两种不同分辨率的图像：

- **Patch 图像** (1024×1024)：用于细胞核级别的详细分析
- **Context 图像** (5120×5120)：用于组织级别的全局分析

### 临床相关性

数据集包含原发性和转移性黑色素瘤样本，有助于研究：

- 黑色素瘤的形态学特征
- 原发性和转移性病变的差异
- 肿瘤微环境分析
- 免疫细胞浸润模式

## 可视化结果

### 数据集样本分布

![样本分布](img/sample-distribution.png)

展示原发性和转移性样本的数量分布情况。

### 标注示例

#### 细胞核标注示例

![细胞核标注](img/nuclei-annotation-example.png)

展示典型的细胞核级别标注结果，包括：
- 不同类别的细胞核标注
- 多类别细胞核的分布
- 标注质量评估

#### 组织标注示例

![组织标注](img/tissue-annotation-example.png)

展示典型的组织级别标注结果，包括：
- 不同组织类型的区域划分
- 肿瘤与正常组织的边界
- 多尺度标注的对应关系

### 数据增强示例

![数据增强](img/augmentation-example.png)

展示数据增强后的样本效果，包括：
- 旋转增强
- 翻转增强
- 颜色归一化
- 对比度调整

## 使用建议

### 数据预处理

1. **图像归一化**：建议对图像进行标准化处理
2. **多尺度处理**：可以同时使用 patch 和 context 图像
3. **类别平衡**：注意原发性和转移性样本的平衡

### 模型选择

1. **细胞核分割**：推荐使用 U-Net、Mask R-CNN 等模型
2. **组织分割**：推荐使用 DeepLab、SegFormer 等模型
3. **多任务学习**：可以同时进行细胞核和组织级别的分割

### 评估指标

- **细胞核分割**：使用 Dice 系数、IoU、F1-score
- **组织分割**：使用像素准确率、平均IoU、Dice 系数
- **分类任务**：使用准确率、精确率、召回率、F1-score

## 相关资源

- [数据集下载](https://zenodo.org/records/15050523)
- [论文链接](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf011/8024182)
- [数据集大小]：约 15 GB

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{puma2024,
  title={PUMA: A Comprehensive Dataset for Pathology Understanding through Multi-scale Analysis},
  author={Author, A. and Author, B.},
  journal={GigaScience},
  year={2024},
  doi={10.1093/gigascience/giaf011}
}
```

## 注意事项

1. **数据使用许可**：请遵守数据集的使用许可协议
2. **隐私保护**：数据集已进行去标识化处理
3. **标注质量**：所有标注均经过专家审核，但建议在使用前进行质量检查
4. **数据版本**：请使用最新版本的数据集

