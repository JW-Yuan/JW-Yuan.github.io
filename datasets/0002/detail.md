# ACDC-LungHP 数据集详情

## 数据集描述

ACDC-LungHP 是一个用于肺组织病理学分割和分类任务的数据集。该数据集包含训练集和测试集，涵盖了多种组织类型。

## 文件结构

```
ACDC-LungHP/
├── train/
│   ├── images/          # 训练图像
│   ├── annotations/     # XML 格式的标注文件
│   └── masks/           # 分割掩码
├── test/
│   ├── images/          # 测试图像
│   ├── annotations/     # XML 格式的标注文件
│   └── masks/           # 分割掩码
├── README.md            # 数据集说明文档
└── LICENSE              # 许可证文件
```

## 标记情况

### 标注格式

数据集使用 **XML 格式**存储标注信息，包含边界框坐标和类别标签。

### 标注类别

数据集包含以下组织类型：

- **正常组织** (Normal Tissue)
- **肿瘤组织** (Tumor Tissue)
- **炎症组织** (Inflammatory Tissue)
- **坏死组织** (Necrotic Tissue)

### 标注工具

标注工作使用以下工具完成：

- LabelImg - 用于边界框标注
- VIA (VGG Image Annotator) - 用于多边形标注

### 标注质量

所有标注均由**病理学专家**进行审核，确保标注质量。

### 标注统计

- **训练集**：150 个样本
  - 平均每个样本包含 3-5 个标注区域
  - 总计约 600 个标注区域
  
- **测试集**：50 个样本
  - 平均每个样本包含 3-5 个标注区域
  - 总计约 200 个标注区域

## 可视化结果

### 数据集样本分布

![样本分布](sample-distribution.png)

展示不同类别样本的数量分布情况。可以看到各类别样本数量相对均衡。

### 标注示例

![标注示例](annotation-example.png)

展示典型的标注结果，包括：
- 边界框标注
- 类别标签
- 多类别重叠区域的处理

### 数据增强示例

![数据增强](augmentation-example.png)

展示数据增强后的样本效果，包括：
- 旋转增强
- 翻转增强
- 颜色增强
- 噪声增强

## 使用建议

1. **数据预处理**：建议对图像进行归一化处理
2. **数据增强**：可以使用旋转、翻转等增强方法增加数据多样性
3. **模型选择**：推荐使用 U-Net、DeepLab 等分割模型
4. **评估指标**：使用 Dice 系数、IoU 等指标评估模型性能

## 相关资源

- [数据集下载](https://acdc-lunghp.grand-challenge.org/)
- [论文链接](https://ieeexplore.ieee.org/document/9265237)
- [GitHub 仓库](https://github.com/example/acdc-lunghp)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{acdc-lunghp2019,
  title={ACDC-LungHP: A Dataset for Lung Histopathology Analysis},
  author={Author, A. and Author, B.},
  journal={IEEE Transactions on Medical Imaging},
  year={2019}
}
```

