# 数据集文件说明

## 文件结构

```
datasets/
├── datasets.json              # 数据集列表文件（列表格式，包含所有数据集的基本信息）
├── 0001.md                    # 数据集详细信息（Markdown 格式，文件名对应数据集 ID）
├── 0002.md                    # 另一个数据集的详细信息
├── 0003.md
└── README.md                  # 本说明文件
```

**注意**：所有数据集的基本信息都存储在 `datasets.json` 中，详细信息存储在对应的 `{id}.md` 文件中。

## 数据集列表文件格式

`datasets.json` 是一个**列表格式**的 JSON 文件，每个元素是一个数据集的基本信息对象：

```json
[
  {
    "id": "0001",
    "name": "PUMA",
    "year": 2024,
    "organs": "Melanoma",
    "staining": "H&E",
    "size": "206 ROIs (primary: 103, metastatic: 103)",
    "data": "images + nuclei and tissue annotations + context image",
    "task": ["seg"],
    "type": "patch(1024x1024) context(5120x5120)",
    "other": "40x - Nanozoomer XR C12000–21/–22",
    "links": {
      "data": "https://zenodo.org/records/15050523",
      "paper": "https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf011/8024182",
      "download": "https://zenodo.org/records/15050523"
    },
    "description": "Melanoma histopathology dataset. for seg tasks."
  },
  {
    "id": "0002",
    "name": "ACDC-LungHP",
    "year": 2019,
    "organs": "Lung",
    "staining": "H&E",
    "size": "Train: 150, Test: 50",
    "data": "images + xml",
    "task": ["seg", "classi"],
    "type": "wsi",
    "other": "",
    "links": {
      "data": "https://example.com",
      "paper": "https://example.com/paper"
    },
    "description": "Lung histopathology dataset."
  }
]
```

### 字段说明

- **id** (必需): 数据集唯一标识符，4位数字 ID（如 "0001"）
- **name** (必需): 数据集名称
- **year**: 发布年份
- **organs**: 器官类型
- **staining**: 染色类型
- **size**: 数据集大小描述
- **data**: 数据格式描述
- **task**: 任务类型，**数组格式**（如 `["seg", "classi"]`）
- **type**: 数据类型
- **other**: 其他信息
- **description**: 数据集描述
- **links**: 相关链接对象
  - `data`: 数据下载链接
  - `paper`: 论文链接
  - `github`: GitHub 链接（可选）
  - `download`: 下载链接（可选）

**重要**：`id` 字段必须是唯一的 4 位数字。`task` 字段应为字符串数组。

## 数据集详细信息文件格式

详细信息文件应放在 `datasets/` 文件夹中，使用 **Markdown 格式**，文件名格式为 `{id}.md`（例如：`0001.md`）。

### Markdown 文件示例

```markdown
# PUMA 数据集详情

## 数据集描述

PUMA (Pathology Understanding through Multi-scale Analysis) 是一个用于黑色素瘤组织病理学分析的数据集。

## 文件结构

```
dataset/
├── train/
│   └── images/
└── test/
    └── images/
```

## 标记情况

### 标注格式

使用 XML 格式存储标注...

### 标注类别

- 类别1
- 类别2

## 可视化结果

### 样本分布

![样本分布](sample-distribution.png)

展示不同类别样本的数量分布情况。

## 相关资源

- [数据集下载](https://example.com)
- [论文链接](https://example.com/paper)
```

### Markdown 支持的功能

详情页面支持标准的 Markdown 语法，包括：

- **标题**：`# H1`, `## H2`, `### H3` 等
- **列表**：有序列表和无序列表
- **代码块**：使用三个反引号包裹代码
- **行内代码**：使用单个反引号
- **链接**：`[链接文本](URL)`
- **图片**：`![alt文本](图片路径)`
- **表格**：标准 Markdown 表格语法
- **引用**：使用 `>` 符号
- **粗体**：`**粗体文本**`
- **斜体**：`*斜体文本*`

### 图片路径处理

在 Markdown 文件中引用图片时，可以使用相对路径：

```markdown
![样本分布](sample-distribution.png)
```

系统会自动将图片路径转换为：`datasets/{id}/img/sample-distribution.png`

**注意**：
- 如果图片需要放在特定文件夹中，可以创建 `{id}/img/` 文件夹结构
- 如果使用完整 URL（`http://` 或 `https://`），则不会进行路径转换
- 如果使用绝对路径（以 `/` 开头），也不会进行路径转换

## 添加新数据集

1. **编辑 `datasets.json`**：在列表中添加新的数据集对象（包含所有基本信息）
2. **创建详细信息文件**（可选）：创建 `{id}.md` 文件，例如 `0050.md`
3. **添加可视化文件**（可选）：如果需要图片，可以创建 `{id}/img/` 文件夹并添加图片文件

### 示例

在 `datasets.json` 中添加新数据集：

```json
[
  // ... 其他数据集
  {
    "id": "0050",
    "name": "New Dataset",
    "year": 2024,
    "organs": "Lung",
    "staining": "H&E",
    "size": "1000 images",
    "data": "images + masks",
    "task": ["segmentation"],
    "type": "patch (512x512)",
    "other": "40x magnification",
    "links": {
      "data": "https://example.com/data",
      "paper": "https://example.com/paper"
    },
    "description": "A new dataset for segmentation tasks."
  }
]
```

然后创建 `0050.md` 文件（可选）：

```markdown
# New Dataset 详情

## 数据集描述

这里是新数据集的详细描述...
```

## 注意事项

- `id` 字段必须是唯一的 4 位数字 ID
- `datasets.json` 必须是有效的 JSON 数组格式
- 所有链接字段都是可选的
- `year` 字段用于排序，建议填写
- `organs`, `staining`, `task` 字段用于筛选，建议填写
- `task` 字段必须是字符串数组格式

## 优势

使用扁平化结构的优势：

- ✅ **简化结构**：不需要为每个数据集创建文件夹
- ✅ **集中管理**：所有基本信息集中在一个 JSON 文件中
- ✅ **易于维护**：可以直接在 GitHub 上编辑和预览
- ✅ **版本控制友好**：文件结构更简单，Git 中更容易查看差异
- ✅ **易于编写**：Markdown 文件使用纯文本格式，无需学习复杂语法
