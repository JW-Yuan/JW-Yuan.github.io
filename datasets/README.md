# 数据集文件说明

## 文件结构

```
datasets/
├── [dataset-id]/                 # 每个数据集的文件夹 (例如: 0001/)
│   ├── info.json                 # 数据集基本信息文件
│   ├── detail.md                 # 数据集详细信息（Markdown 格式）
│   ├── process.py (可选)         # 处理脚本 Python 文件
│   └── img/ (可选)               # 可视化图片文件夹
│       ├── image1.png
│       └── image2.jpg
```

所有数据集索引信息存储在根目录的 `datasets.json` 文件中。

## 数据集基本信息文件格式

每个数据集的基本信息文件（`info.json`）应包含以下字段：

```json
{
    "id": "0001",                     // 数据集唯一标识符（必需，4位数字ID）
    "name": "ACDC-LungHP",            // 数据集名称（必需）
    "year": 2019,                     // 发布年份
    "organs": "Lung",                 // 器官类型
    "staining": "H&E",                // 染色类型
    "size": "Train: 150, Test: 50",  // 数据集大小
    "data": "images + xml",           // 数据格式
    "task": ["seg", "classi"],       // 任务类型 (数组格式)
    "type": "wsi",                   // 数据类型
    "other": "",                      // 其他信息
    "description": "数据集描述",      // 数据集描述
    "links": {                        // 相关链接
        "data": "https://...",
        "paper": "https://...",
        "github": "https://..."
    }
}
```

**重要**：`id` 字段必须与文件夹名称一致，且为 4 位数字。`task` 字段应为字符串数组。

## 数据集详细信息文件格式

详细信息文件应放在每个数据集的文件夹中，使用 **Markdown 格式**，文件名固定为 `detail.md`。

### Markdown 文件示例

```markdown
# 数据集名称

## 数据集描述

这里是数据集的详细描述...

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

系统会自动将图片路径转换为：`../datasets/[dataset-id]/img/sample-distribution.png`

**注意**：
- 图片文件应放在 `datasets/[dataset-id]/img/` 文件夹中
- 如果使用完整 URL（`http://` 或 `https://`），则不会进行路径转换
- 如果使用绝对路径（以 `/` 开头），也不会进行路径转换

## 添加新数据集

1. **创建数据集文件夹**：在 `datasets/` 文件夹中创建新的 4 位数字 ID 文件夹（如 `0050/`）
2. **创建基本信息文件**：在该文件夹中创建 `info.json`
3. **创建详细信息文件**（可选）：在该文件夹中创建 `detail.md`
4. **添加可视化文件**（可选）：在该文件夹的 `img/` 子文件夹中添加图片文件
5. **添加到索引**：在根目录的 `datasets.json` 中添加新的 ID 和数据集名称

### 示例

创建 `0050/info.json`:
```json
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
```

然后在根目录的 `datasets.json` 中添加：
```json
{
    "0001": "PUMA",
    "0002": "ACDC-LungHP",
    // ... 其他数据集
    "0050": "New Dataset"
}
```

## 注意事项

- 文件夹名和 `info.json` 中的 `id` 字段必须是唯一的 4 位数字 ID
- 所有链接字段都是可选的
- `year` 字段用于排序，建议填写
- `organs`, `staining`, `task` 字段用于筛选，建议填写
- 索引文件 `datasets.json` 位于网站根目录，格式为字典：`{ "0001": "数据集名称", ... }`

## 优势

使用 Markdown 格式的优势：

- ✅ **易于编写**：使用纯文本格式，无需学习 JSON 语法
- ✅ **格式丰富**：支持标题、列表、表格、代码块等多种格式
- ✅ **易于维护**：可以直接在 GitHub 上编辑和预览
- ✅ **版本控制友好**：Markdown 文件在 Git 中更容易查看差异
- ✅ **可读性强**：即使不渲染，Markdown 文件也具有良好的可读性
