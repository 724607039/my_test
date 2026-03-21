import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

export function generateWordFile(canvasItems) {
  // 创建一个空的Word文档模板
  const zip = new PizZip();

  // 处理图片
  const images = [];
  canvasItems.forEach((item, index) => {
    if (item.type === 'ImageComponent' && item.props.src) {
      const imageData = item.props.src;
      if (imageData.startsWith('data:')) {
        // 处理base64图片
        const base64Data = imageData.split(',')[1];
        const imageName = `image${index}.png`;
        zip.file(`word/media/${imageName}`, base64Data, { base64: true });
        images.push({
          id: `rId${images.length + 2}`,
          name: imageName,
          src: imageData,
        });
      }
    }
  });

  zip.file('word/document.xml', generateDocumentXml(canvasItems, images));
  zip.file('word/_rels/document.xml.rels', generateRelsXml(images));
  zip.file('word/media/.rels', '');
  zip.file('[Content_Types].xml', generateContentTypesXml(images));
  zip.file('_rels/.rels', generateRootRelsXml());

  // 生成Word文件
  const content = zip.generate({ type: 'blob' });
  saveAs(content, 'generated-document.docx');
}

function generateDocumentXml(canvasItems, images) {
  let bodyContent = '';

  canvasItems.forEach((item, index) => {
    switch (item.type) {
      case 'TextComponent':
        bodyContent += `<w:p><w:r><w:t>${escapeXml(
          item.props.content || ''
        )}</w:t></w:r></w:p>`;
        break;
      case 'ImageComponent':
        if (item.props.src) {
          const image = images.find((img) => img.src === item.props.src);
          if (image) {
            bodyContent += generateImageXml(image.id, item.props.alt || '图片');
          } else {
            bodyContent += `<w:p><w:r><w:t>图片: ${escapeXml(
              item.props.alt || '图片'
            )}</w:t></w:r></w:p>`;
          }
        }
        break;
      case 'TableComponent':
        bodyContent += generateTableXml(item.props.data);
        break;
      default:
        break;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyContent}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function generateImageXml(relId, alt) {
  return `
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="4572000" cy="3429000"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="1" name="图片" descr="${escapeXml(alt)}"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="0" name="图片"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${relId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                    <a:stretch>
                      <a:fillRect/>
                    </a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="4572000" cy="3429000"/>
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

function generateTableXml(data) {
  let tableContent = '';

  data.forEach((row) => {
    tableContent += '<w:tr>';
    row.forEach((cell) => {
      tableContent += `
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="5000" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:t>${escapeXml(cell || '')}</w:t>
            </w:r>
          </w:p>
        </w:tc>`;
    });
    tableContent += '</w:tr>';
  });

  return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="8000" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4"/>
          <w:left w:val="single" w:sz="4"/>
          <w:bottom w:val="single" w:sz="4"/>
          <w:right w:val="single" w:sz="4"/>
          <w:insideH w:val="single" w:sz="4"/>
          <w:insideV w:val="single" w:sz="4"/>
        </w:tblBorders>
        <w:tblLook w:val="04A0"/>
      </w:tblPr>
      <w:tblGrid>
        ${data[0]?.map(() => '<w:gridCol w:w="2000"/>').join('')}
      </w:tblGrid>
      ${tableContent}
    </w:tbl>`;
}

function generateRelsXml(images) {
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

function generateContentTypesXml(images) {
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

function generateRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
