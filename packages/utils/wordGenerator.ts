/**
 * Word文档生成工具
 */

import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

/**
 * A4纸尺寸 (twips, 1 inch = 1440 twips)
 * 宽度: 210mm = 8.27 inches = 11906 twips
 * 高度: 297mm = 11.69 inches = 16838 twips
 */
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const PAGE_MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

/**
 * 生成Word文件
 * @param canvasItems 画布组件
 */
export function generateWordDocument(canvasItems: any[]) {
  const zip = new PizZip();

  const images: any[] = [];
  canvasItems.forEach((item, index) => {
    if (item.type === 'image' && item.props.src) {
      const imageData = item.props.src;
      if (imageData.startsWith('data:')) {
        const base64Data = imageData.split(',')[1];
        const imageName = `image${index}.png`;
        zip.file(`word/media/${imageName}`, base64Data, { base64: true });
        images.push({
          id: `rId${images.length + 2}`,
          name: imageName,
          src: imageData,
          width: item.props.width || 300,
          height: item.props.height || 200,
        });
      }
    }
  });

  zip.file('word/document.xml', generateDocumentXml(canvasItems, images));
  zip.file('word/_rels/document.xml.rels', generateRelsXml(images));
  zip.file('word/media/.rels', '');
  zip.file('[Content_Types].xml', generateContentTypesXml());
  zip.file('_rels/.rels', generateRootRelsXml());

  const content = zip.generate({ type: 'blob' });
  saveAs(content, 'generated-document.docx');
}

/**
 * 生成文档XML
 */
function generateDocumentXml(canvasItems: any[], images: any[]) {
  let bodyContent = '';

  canvasItems.forEach((item) => {
    switch (item.type) {
      case 'text':
        bodyContent += generateTextParagraphXml(item.props);
        break;
      case 'image':
        if (item.props.src) {
          const image = images.find((img) => img.src === item.props.src);
          if (image) {
            bodyContent += generateImageXml(image, item.props);
          } else {
            bodyContent += generateTextParagraphXml({
              content: `图片: ${item.props.alt || '图片'}`,
            });
          }
        }
        break;
      case 'table':
        bodyContent += generateTableXml(item.props.data, item.props.headers);
        break;
      default:
        break;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
            xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
            xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
            xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
            mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyContent}
    <w:sectPr>
      <w:pgSz w:w="${PAGE_WIDTH}" w:h="${PAGE_HEIGHT}" w:orient="portrait"/>
      <w:pgMar w:top="${PAGE_MARGIN}" w:right="${PAGE_MARGIN}" w:bottom="${PAGE_MARGIN}" w:left="${PAGE_MARGIN}" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

/**
 * 生成文本段落XML，支持自动换行
 */
function generateTextParagraphXml(props: {
  content?: string;
  fontSize?: number;
  bold?: boolean;
  color?: string;
  align?: string;
}) {
  const content = props.content || '';
  const fontSize = props.fontSize || 14;
  const bold = props.bold || false;
  const textColor = props.color || '000000';
  const align = props.align || 'left';

  const alignMap: Record<string, string> = {
    left: 'start',
    center: 'center',
    right: 'end',
  };
  const wAlign = alignMap[align] || 'start';

  const escapedContent = escapeXml(content);
  const lines = wrapText(escapedContent, 45);

  let runsContent = '';
  lines.forEach((line) => {
    const boldTag = bold ? '<w:b/>' : '';
    runsContent += `<w:r>
      <w:rPr>
        ${boldTag}
        <w:sz w:val="${fontSize * 2}"/>
        <w:szCs w:val="${fontSize * 2}"/>
        <w:color w:val="${textColor}"/>
      </w:rPr>
      <w:t xml:space="preserve">${line}</w:t>
    </w:r>`;
  });

  return `<w:p>
    <w:pPr>
      <w:jc w:val="${wAlign}"/>
      <w:spacing w:after="200" w:line="276" w:lineRule="auto"/>
    </w:pPr>
    ${runsContent}
  </w:p>`;
}

/**
 * 文本自动换行处理
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  paragraphs.forEach((paragraph) => {
    if (paragraph.length === 0) {
      lines.push('');
      return;
    }

    let currentLine = '';
    const chars = paragraph.split('');

    chars.forEach((char) => {
      if (currentLine.length >= maxCharsPerLine && char !== ' ') {
        lines.push(currentLine);
        currentLine = char;
      } else if (char === '\n') {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
  });

  return lines;
}

/**
 * 生成图片XML，自适应页面宽度
 */
function generateImageXml(image: any, props: any) {
  const maxWidth = CONTENT_WIDTH;
  const maxHeight = 4000000;

  const aspectRatio = image.width / image.height;
  let imgWidth = Math.min(image.width * 9525, maxWidth);
  let imgHeight = imgWidth / aspectRatio;

  if (imgHeight > maxHeight) {
    imgHeight = maxHeight;
    imgWidth = imgHeight * aspectRatio;
  }

  const altText = escapeXml(props.alt || '图片');
  const descText = escapeXml(props.alt || '图片');

  return `<w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:after="200"/>
    </w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
                   distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${imgWidth}" cy="${imgHeight}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="1" name="${altText}" descr="${descText}"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="${altText}"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${image.id}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                  <a:stretch>
                    <a:fillRect/>
                  </a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${imgWidth}" cy="${imgHeight}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect">
                    <a:avLst/>
                  </a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>`;
}

/**
 * 生成表格XML，自适应页面宽度
 */
function generateTableXml(data: string[][], headers?: string[]) {
  const colCount = headers?.length || data[0]?.length || 1;
  const colWidth = Math.floor(CONTENT_WIDTH / colCount);

  let tableContent = '';

  if (headers && headers.length > 0) {
    tableContent += '<w:tr>';
    headers.forEach((header) => {
      tableContent += `
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="${colWidth}" w:type="dxa"/>
            <w:shd w:val="clear" w:color="auto" w:fill="E7E6E6"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:b/>
                <w:sz w:val="28"/>
              </w:rPr>
              <w:t>${escapeXml(header || '')}</w:t>
            </w:r>
          </w:p>
        </w:tc>`;
    });
    tableContent += '</w:tr>';
  }

  data.forEach((row) => {
    tableContent += '<w:tr>';
    row.forEach((cell) => {
      tableContent += `
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="${colWidth}" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:sz w:val="24"/>
              </w:rPr>
              <w:t>${escapeXml(cell || '')}</w:t>
            </w:r>
          </w:p>
        </w:tc>`;
    });
    tableContent += '</w:tr>';
  });

  return `<w:p>
    <w:pPr>
      <w:spacing w:after="200"/>
    </w:pPr>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="${CONTENT_WIDTH}" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        </w:tblBorders>
        <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
      </w:tblPr>
      <w:tblGrid>
        ${Array(colCount).fill(`<w:gridCol w:w="${colWidth}"/>`).join('')}
      </w:tblGrid>
      ${tableContent}
    </w:tbl>
  </w:p>`;
}

/**
 * 生成关系XML
 */
function generateRelsXml(images: any[]) {
  let relsContent = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
`;

  images.forEach((image) => {
    relsContent += `  <Relationship Id="${image.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${image.name}"/>
`;
  });

  relsContent += `</Relationships>`;
  return relsContent;
}

/**
 * 生成内容类型XML
 */
function generateContentTypesXml() {
  let contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
`;

  contentTypes += `</Types>`;
  return contentTypes;
}

/**
 * 生成根关系XML
 */
function generateRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

/**
 * 转义XML特殊字符
 */
function escapeXml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
