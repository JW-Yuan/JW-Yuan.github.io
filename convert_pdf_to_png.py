#!/usr/bin/env python3
"""
PDF转PNG转换脚本
将PDF文件转换为PNG图片
"""

import fitz  # PyMuPDF
from PIL import Image
import os
import sys

def pdf_to_png(pdf_path, output_path, dpi=300):
    """
    将PDF转换为PNG
    """
    try:
        # 打开PDF文件
        pdf_document = fitz.open(pdf_path)

        # 获取第一页（通常PDF文档的第一页就是主要内容）
        page = pdf_document[0]

        # 将页面转换为图片
        pix = page.get_pixmap(dpi=dpi)

        # 保存为PNG
        pix.save(output_path)

        print(f"成功转换: {pdf_path} -> {output_path}")
        print(f"图片尺寸: {pix.width} x {pix.height}")

        # 关闭PDF文档
        pdf_document.close()

        return True

    except Exception as e:
        print(f"转换失败: {e}")
        return False

if __name__ == "__main__":
    # PDF文件路径
    pdf_path = "knowledge-points/imgs/TAND.pdf"
    # 输出PNG路径
    png_path = "knowledge-points/imgs/TAND.png"

    # 检查PDF文件是否存在
    if not os.path.exists(pdf_path):
        print(f"错误: PDF文件不存在 - {pdf_path}")
        sys.exit(1)

    # 转换PDF为PNG
    success = pdf_to_png(pdf_path, png_path)

    if success:
        print("PDF转换完成！")
        print(f"PNG文件保存在: {png_path}")
    else:
        print("PDF转换失败！")
        sys.exit(1)