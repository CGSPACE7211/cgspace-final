import { NextResponse } from 'next/server';

export const revalidate = 1; 

export async function GET() {
  const NOTION_TOKEN = "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"; 
  const DATABASE_ID = "37045961808280f1945adb22e99baa17";

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Notion Sync Failed');
    const data = await response.json();

    const menuItems = [];
    let posterImages = [];
    let unitImage = null;
    let logoImage = null;

    data.results.forEach(page => {
      const props = page.properties;
      const active = props.Active?.checkbox || false;
      if (!active) return;

      const name = props.Name?.title[0]?.plain_text || '';
      const price = props.Price?.number || 0;
      const category = props.Category?.select?.name || 'Others';
      const specialTag = props.Special_Tag?.rich_text[0]?.plain_text || '';
      
      // 🚀 抓取这个格子里包含的所有图片文件链接
      const urls = props.Image?.files?.map(f => f.file?.url || f.external?.url).filter(Boolean) || [];

      if (name.toUpperCase() === 'UNIT') {
        if (urls.length > 0) unitImage = urls[0];
      } else if (name.toUpperCase() === 'LOGO') {
        if (urls.length > 0) logoImage = urls[0];
      } else if (category.toUpperCase() === 'POSTER') {
        posterImages = [...posterImages, ...urls];
      } else {
        menuItems.push({
          id: page.id,
          name,
          price,
          category,
          specialTag
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      menuItems, 
      posterImages, 
      unitImage, 
      logoImage 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
