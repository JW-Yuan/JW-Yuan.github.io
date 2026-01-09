1、**Lizard**（500-1000不等 20x， from GlaS、CRAG、CoNSeP、DigestPath、PanNuke以及TCGA，其中GlaS、CRAG和DigestPath是20x，所以选了20x，CoNSeP和PanNuke只用了图片，没用标签，TGGA只有图片 Colon）
  - **epithelial**: 上皮细胞（244563，49.39%）
  - **lymphocyte**: 淋巴细胞（101413，20.48%）
  - **plasma**: 浆细胞（28466，5.75%）
  - **eosinophil**: 嗜酸性粒细胞（3604， 0.73%）
  - **neutrophil**: 嗜中性粒细胞（4824，0.97%）
  - **connective**: 结缔组织细胞（112309，22.68%）



## ============================================================
Cell Type (Lizard Original) | Count        | Ratio

## Neutrophil                | 4116         |     0.95%
Epithelial                | 210372       |    48.71%
Lymphocyte                | 92238        |    21.36%
Plasma                    | 24861        |     5.76%
Eosinophil                | 2979         |     0.69%
Connective                | 97347        |    22.54%

# Total Instances           | 431913       | 100.00%
Total .mat Files Scanned: 238


文件结构：

lizard
├─ Lizard_Images1
│ └─ Lizard_Images1（子文件夹）
│ └─ 【若干.png图片文件】（如xxx.png、yyy.png等）
│ ▶ 文件名与Lizard_Labels/Labels中的.mat文件**完全一一对应**
├─ Lizard_Images2
│ └─ Lizard_Images2（子文件夹）
│ └─ 【若干.png图片文件】（如xxx.png、yyy.png等）
│ ▶ 文件名与Lizard_Labels/Labels中的.mat文件**完全一一对应**
├─ Lizard_Labels
│ ├─ Labels（子文件夹）
│ │ └─ 【若干.mat标注文件】（如xxx.mat、yyy.mat等）
│ │ ▶ 核心：每个.mat文件名与Lizard_Images1/Lizard_Images1、Lizard_Images2/Lizard_Images2中的.png文件名**完全一致**
│ │ └─ 每个.mat文件的key结构：
│ │ - **header**: bytes类型，值为b'MATLAB 5.0 MAT-file Platform: posix, Created on: Fri Jul 16 14:54:29 2021'
│ │ - **version**: str类型，值为1.0
│ │ - **globals**: list类型，值为[]
│ │ - inst_map: numpy.ndarray类型，形状为(图像高, 图像宽)，每个像素值对应实例ID（0不视为有效实例ID）
│ │ - id: numpy.ndarray类型，形状为(实例数量, 1)，每个元素为实例ID（从1开始递增）
│ │ - class: numpy.ndarray类型，形状为(实例数量, 1)，每个元素为对应实例ID的类别ID
│ │ - bbox: numpy.ndarray类型，形状为(实例数量, 4)，每个元素为对应实例ID的边界框（左上右下绝对值坐标）
│ │ - centroid: numpy.ndarray类型，形状为(实例数量, 2)，每个元素为对应实例ID的中心坐标（xy绝对值坐标）
│ ├─ info.csv（文件）
│ └─ read_label.py（文件）
│ └─ [README.md](http://README.md)（文件）
└─ Overlay



mat文件中的class只会是1-6这六个整数，对应关系如下：

cls_id_to_name = {  
1: "neutrophil",  
2: "epithelial",  
3: "lymphocyte",  
4: "plasma",  
5: "eosinophil",  
6: "connective"  
}




2、**PanNuke**（256*256 40x multiple）

- **Neoplastic cells**: 肿瘤细胞（77403， **40.80%**）
- **Inflammatory cells**: 炎症细胞（32276， **17.01%**）
- **Connective/Soft tissue cells**: 结缔/软组织细胞 （50585， **26.66%**）
- **Dead Cells**: 死细胞（2908， **1.53%**）
- **Epithelial cells**: 上皮细胞**14.00%**（26572， 14.00%）
### PanNuke文件夹架构（含文件定义）

```Markdown
PanNuke
├─ Fold1
│  ├─ images.npy：numpy数组，形状[num_images, h, w, 3]，存原始图像（图像数×高×宽×RGB通道）
│  ├─ masks.npy：numpy数组，形状[num_images, h, w, 6]，存实例与背景标注
│  └─ types.npy：numpy数组，形状[num_images,]，存每张图对应的器官类型（字符串）
├─ Fold2
│  ├─ images.npy：与Fold1同名文件的形状、意义完全一致
│  ├─ masks.npy：与Fold1同名文件的形状、意义完全一致
│  └─ types.npy：与Fold1同名文件的形状、意义完全一致
└─ Fold3
   ├─ images.npy：与Fold1同名文件的形状、意义完全一致
   ├─ masks.npy：与Fold1同名文件的形状、意义完全一致
   └─ types.npy：与Fold1同名文件的形状、意义完全一致
```

### 各文件的核心信息

#### 1. images.npy

- 形状：`[num_images, h, w, 3]`
- 作用：批量存储原始图像数据，维度对应“图像数量、图像高度、图像宽度、RGB三通道”。

#### 2. masks.npy（6个通道的定义）

- 形状：`[num_images, h, w, 6]`
- 各通道对应内容：
    - 通道0：Neoplastic cells（肿瘤细胞），像素值是实例ID（整数，不要求连续，相同ID代表同一实例）
    - 通道1：Inflammatory cells（炎症细胞），像素值是实例ID（规则同上）
    - 通道2：Connective/Soft tissue cells（结缔/软组织细胞），像素值是实例ID（规则同上）
    - 通道3：Dead Cells（死细胞），像素值是实例ID（规则同上）
    - 通道4：Epithelial cells（上皮细胞），像素值是实例ID（规则同上）
    - 通道5：background（背景），像素值只有0或1，1代表背景区域（这个部分不参与任何数据的构建）

#### 3. types.npy

- 形状：`[num_images,]`
- 元素类型：字符串
- 可选值（共19种器官）：

    `Adrenal_gland`、`Bile-duct`、`Bladder`、`Breast`、`Cervix`、`Colon`、

    `Esophagus`、`HeadNeck`、`Kidney`、`Liver`、`Lung`、`Ovarian`、`Pancreatic`、

    `Prostate`、`Skin`、`Stomach`、`Testis`、`Thyroid`、`Uterus`
- 作用：标记每张图像对应的器官来源

---





## =================================================================
Cell Type (PanNuke Original)        | Count      | Ratio

## Neoplastic Cells                    | 77403      |    40.79%
Inflammatory Cells                  | 32276      |    17.01%
Connective/Soft Tissue Cells        | 50585      |    26.66%
Dead Cells                          | 2908       |     1.53%
Epithelial Cells                    | 26572      |    14.00%

# Total Instances Across All Folds    | 189744     | 100.00%


3、PUMA(patch(1024x1024) 40x Melanoma)

1. **tumor**: 肿瘤细胞（57419， 58.93%）
2. **stroma**: 基质细胞（3856， 3.96%）
3. **vascular endothelium**: 血管内皮细胞（1701， 1.75%）
4. **histiocyte**: 组织细胞（7168， 7.36%）
5. **melanophage**: 吞噬色素细胞（695， 0.71%）
6. **lymphocyte**: 淋巴细胞（21643， 22.21）
7. **plasma cell**: 浆细胞（520， 0.53%）
8. **neutrophil**: 嗜中性粒细胞（366， 0.38%）
9. **apoptotic cell**: 凋亡细胞（1850， 1.90%）
10. **epithelium**: 上皮细胞（2211， 2.27%）



### 文件结构：

PUMA

├─ 01_training_dataset_geojson_nuclei

│  └─ 【若干.geojson格式文件】

│     ▶ 命名规则：{tif文件名}_nuclei.geojson（与tif文件一一对应）

├─ 01_training_dataset_geojson_tissue

│  └─ 【若干.geojson格式文件】

│     ▶ 命名规则：{tif文件名}_tissue.geojson（与tif文件一一对应）

└─ 01_training_dataset_tif_ROIs

  └─ 【若干.tif格式图片文件】（如xxx.tif、yyy.tif等）

    ▶ 作为基准文件，是geojson标注文件的命名来源


## =================================================================
PUMA Original Label            | Count        | Ratio

## nuclei_apoptosis               | 1850         |     1.90%
nuclei_endothelium             | 1701         |     1.75%
nuclei_epithelium              | 2211         |     2.27%
nuclei_histiocyte              | 7168         |     7.36%
nuclei_lymphocyte              | 21643        |    22.21%
nuclei_melanophage             | 695          |     0.71%
nuclei_neutrophil              | 366          |     0.38%
nuclei_plasma_cell             | 520          |     0.53%
nuclei_stroma                  | 3856         |     3.96%
nuclei_tumor                   | 57419        |    58.93%

# Total Nuclei Instances         | 97429        | 100.00%
Total GeoJSON Files Scanned: 206